import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));

// In-memory rate limiting for cost protection (LKR 500 budget adherence)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per 10 minutes per IP/user
const WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// PDF Text Extraction Endpoint
app.post('/api/pdf/extract-text', async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'No PDF file data provided' });
    }

    const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'PDF file is too large (max 20MB)' });
    }

    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const info = await parser.getInfo().catch(() => ({ total: 1 }));
    await parser.destroy().catch(() => {});
    const rawText = textResult.text ? textResult.text.trim() : '';
    const numPages = (textResult.pages && textResult.pages.length) || (info as any).total || 1;

    if (!rawText || rawText.length < 20) {
      return res.json({
        success: true,
        extractedText: '',
        numPages,
        isScanned: true,
        message: 'PDF கோப்பானது பட வடிவில் (scanned image) உள்ளதால் உரை பிரித்தெடுக்கப்படவில்லை. குறிப்பு ஆவணக் கோப்பாக சேமிக்கப்படும்.',
      });
    }

    // Sanitize and limit extracted text length to prevent DB bloat
    const sanitizedText = rawText.slice(0, 80000);

    return res.json({
      success: true,
      extractedText: sanitizedText,
      numPages,
      isScanned: false,
      message: `${numPages} பக்கங்களிலிருந்து உரை வெற்றிகரமாக பிரித்தெடுக்கப்பட்டது (${sanitizedText.length} எழுத்துக்கள்).`,
    });
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF கோப்பை வாசிப்பதில் பிழை ஏற்பட்டது: ' + (error?.message || 'Unknown error'),
    });
  }
});

// AI Biology Tutor Chat Endpoint
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const userIdentifier = req.headers['x-user-id'] as string || req.ip || 'anonymous';
    const rateCheck = checkRateLimit(userIdentifier);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'கேள்வி எண்ணிக்கை வரம்பை எட்டிவிட்டீர்கள் (Rate limit reached). தயவுசெய்து சிறிது நேரம் கழித்து முயற்சிக்கவும் (Please wait a few minutes). செலவுக்கட்டுப்பாடு விதிகளின்படி இந்த வரம்பு பேணப்படுகிறது.',
      });
    }

    const { message, history, currentTopic, notesContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are "BioTutor Tamil", an expert, patient, and encouraging Biology teacher specialized in the Sri Lankan GCE Advanced Level (A/L) Biology syllabus (க.பொ.த. உயர்தர உயிரியல் பாடத்திட்டம்).

CORE PEDAGOGICAL DIRECTIVES:
1. PRIMARY LANGUAGE: Respond primarily in clear, natural, grammatically correct Tamil (தமிழ்).
2. SCIENTIFIC TERMINOLOGY: You MUST ALWAYS include English scientific and biological terms in parentheses next to Tamil terms.
   Examples:
   - கல மென்சவ்வு (Cell membrane)
   - இழைமணி (Mitochondria)
   - ஒளிச்சேர்க்கை (Photosynthesis)
   - குரோமோசோம் / நிறமூர்த்தம் (Chromosome)
   - இரைப்பைச் சாறு (Gastric juice)
   - தாவர வளர்ச்சி சீராக்கிகள் (Plant growth regulators)
   - இயற்கை தேர்வு (Natural selection)
   - நொதியம் (Enzyme)
3. SYLLABUS ALIGNMENT: Strictly align with the Sri Lankan National Institute of Education (NIE) GCE A/L Biology Resource Books / Teacher's Guides across these 8 core units:
   - Unit 1: Introduction to Biology & Cell Biology (கல உயிரியல்)
   - Unit 2: Chemical and Cellular Basis of Life
   - Unit 3: Evolution and Diversity of Organisms (கூர்ப்பு மற்றும் அங்கிகளின் பல்வகைமை)
   - Unit 4: Plant Form and Function (தாவர வடிவமும் தொழிலும்)
   - Unit 5: Animal Form and Function (விலங்கு வடிவமும் தொழிலும்)
   - Unit 6: Genetics (மரபியல்)
   - Unit 7: Molecular Biology and Recombinant DNA Technology
   - Unit 8: Environmental Biology / Ecology (சூழல் உயிரியல் / சூழலியல்)
   - Unit 9: Microbiology (நுண்ணுயிரியல்)
   - Unit 10: Applied Biology (பிரயோக உயிரியல்)
4. RETRIEVAL CONTEXT HANDLING:
   If "UPLOADED NOTES CONTEXT" is provided below:
   - Check if the question is answered by or related to the notes.
   - State clearly: "பதிவேற்றப்பட்ட குறிப்புகளின் படி..." (According to the uploaded notes...).
   - Explicitly distinguish statements backed by the teacher's notes from general biological principles.
   - If the uploaded note does not cover something, rely on standard GCE A/L syllabus knowledge and state so.
5. ACADEMIC HONESTY & ACCURACY:
   - NEVER invent or hallucinate textbook page numbers, official past paper question numbers, or official marking scheme quotes.
   - If a concept is outside the A/L syllabus or if the evidence is uncertain, state this transparently in Tamil.
   - Remind students when appropriate that this AI tool is a revision companion and not an official examination board replacement.
6. FORMATTING:
   - Use structured bullet points, numbered steps, bold headings, comparisons, or clean markdown tables where appropriate to make biological concepts easy to remember for exams.`;

    let contextPrompt = '';
    if (notesContext && typeof notesContext === 'string' && notesContext.trim().length > 0) {
      contextPrompt = `\n\n--- UPLOADED NOTES CONTEXT (பதிவேற்றப்பட்ட குறிப்புகள்) ---\n${notesContext.slice(0, 15000)}\n--- END OF CONTEXT ---\n`;
    }

    if (currentTopic) {
      contextPrompt += `\n[தற்போதைய அலகு / Current Topic: ${currentTopic}]\n`;
    }

    // Build contents array supporting conversational history
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Include up to 6 previous turns
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        if (turn.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: turn.text }] });
        } else if (turn.role === 'model' || turn.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: turn.text }] });
        }
      }
    }

    // Append current user message with context
    contents.push({
      role: 'user',
      parts: [{ text: `${contextPrompt}\nமாணவரின் கேள்வி (Student question): ${message}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    const answer = response.text || 'பதில் உருவாக்குவதில் தடங்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் கேட்கவும்.';

    return res.json({
      success: true,
      answer,
      remainingQuestions: rateCheck.remaining,
    });
  } catch (error: any) {
    console.error('Gemini Tutor Error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI ஆசிரியருடன் இணைப்பதில் பிழை ஏற்பட்டது: ' + (error?.message || 'Server error'),
    });
  }
});

// AI Practice Questions Generator Endpoint
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const userIdentifier = req.headers['x-user-id'] as string || req.ip || 'anonymous';
    const rateCheck = checkRateLimit(userIdentifier);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'வினாடி வினா உருவாக்க வரம்பை எட்டிவிட்டீர்கள். தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்.',
      });
    }

    const { topic, difficulty = 'medium', count = 5 } = req.body;

    const prompt = `Generate ${count} Sri Lankan GCE Advanced Level (A/L) Biology examination-style multiple-choice questions (MCQs) for the topic: "${topic || 'General A/L Biology'}".
Requirements:
1. Language: Accurate Tamil with English scientific terms in parentheses (e.g., "கலமென்சவ்வு (Cell membrane)").
2. Provide exactly 5 options (A, B, C, D, E) per question matching the Sri Lankan A/L 5-option MCQ format.
3. Include an accurate correctOption index (0 to 4).
4. Provide a detailed educational explanation (விளக்கம்) in Tamil explaining why the correct option is right and common pitfalls.
5. Clearly indicate that these are AI-generated practice questions, not past paper examination questions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a senior Sri Lankan GCE A/L Biology curriculum setter. Return ONLY valid JSON adhering to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of A/L Biology practice multiple choice questions',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: 'Question text in Tamil with English terms in parentheses' },
              topic: { type: Type.STRING, description: 'Topic category' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '5 options in Tamil with English terms',
              },
              correctIndex: { type: Type.INTEGER, description: 'Index of correct answer (0 to 4)' },
              explanation: { type: Type.STRING, description: 'Detailed explanation in Tamil' },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({
      success: true,
      questions: parsed,
    });
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: 'பயிற்சிக் கேள்விகளை உருவாக்குவதில் பிழை ஏற்பட்டது: ' + (error?.message || 'Server error'),
    });
  }
});

// Production vs Dev handling with Vite
// Production vs Development handling
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BioTutor Tamil server listening on port ${PORT}`);
  });
}

export default app;
