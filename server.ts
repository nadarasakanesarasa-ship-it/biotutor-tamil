import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import { createRemoteJWKSet, jwtVerify } from 'jose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export default app;
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


// Firebase ID Token verification
const FIREBASE_PROJECT_ID = 'biotutor-tamil';
const firebaseJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function requireFirebaseAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { payload } = await jwtVerify(token, firebaseJwks, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    res.locals.firebaseUid = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }
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
        message: 'PDF à®•à¯‹à®ªà¯à®ªà®¾à®©à®¤à¯ à®ªà®Ÿ à®µà®Ÿà®¿à®µà®¿à®²à¯ (scanned image) à®‰à®³à¯à®³à®¤à®¾à®²à¯ à®‰à®°à¯ˆ à®ªà®¿à®°à®¿à®¤à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ. à®•à¯à®±à®¿à®ªà¯à®ªà¯ à®†à®µà®£à®•à¯ à®•à¯‹à®ªà¯à®ªà®¾à®• à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯.',
      });
    }

    // Sanitize and limit extracted text length to prevent DB bloat
    const sanitizedText = rawText.slice(0, 80000);

    return res.json({
      success: true,
      extractedText: sanitizedText,
      numPages,
      isScanned: false,
      message: `${numPages} à®ªà®•à¯à®•à®™à¯à®•à®³à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®‰à®°à¯ˆ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®ªà®¿à®°à®¿à®¤à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯ (${sanitizedText.length} à®Žà®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯).`,
    });
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return res.status(500).json({
      success: false,
      error: 'PDF à®•à¯‹à®ªà¯à®ªà¯ˆ à®µà®¾à®šà®¿à®ªà¯à®ªà®¤à®¿à®²à¯ à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯: ' + (error?.message || 'Unknown error'),
    });
  }
});

// AI Biology Tutor Chat Endpoint
app.post('/api/tutor/chat', requireFirebaseAuth, async (req, res) => {
  try {
    const userIdentifier = res.locals.firebaseUid as string;
    const rateCheck = checkRateLimit(userIdentifier);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'à®•à¯‡à®³à¯à®µà®¿ à®Žà®£à¯à®£à®¿à®•à¯à®•à¯ˆ à®µà®°à®®à¯à®ªà¯ˆ à®Žà®Ÿà¯à®Ÿà®¿à®µà®¿à®Ÿà¯à®Ÿà¯€à®°à¯à®•à®³à¯ (Rate limit reached). à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯ à®šà®¿à®±à®¿à®¤à¯ à®¨à¯‡à®°à®®à¯ à®•à®´à®¿à®¤à¯à®¤à¯ à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯ (Please wait a few minutes). à®šà¯†à®²à®µà¯à®•à¯à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯ à®µà®¿à®¤à®¿à®•à®³à®¿à®©à¯à®ªà®Ÿà®¿ à®‡à®¨à¯à®¤ à®µà®°à®®à¯à®ªà¯ à®ªà¯‡à®£à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯.',
      });
    }

    const { message, history, currentTopic, notesContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are "BioTutor Tamil", an expert, patient, and encouraging Biology teacher specialized in the Sri Lankan GCE Advanced Level (A/L) Biology syllabus (à®•.à®ªà¯Š.à®¤. à®‰à®¯à®°à¯à®¤à®° à®‰à®¯à®¿à®°à®¿à®¯à®²à¯ à®ªà®¾à®Ÿà®¤à¯à®¤à®¿à®Ÿà¯à®Ÿà®®à¯).

CORE PEDAGOGICAL DIRECTIVES:
1. PRIMARY LANGUAGE: Respond primarily in clear, natural, grammatically correct Tamil (à®¤à®®à®¿à®´à¯).
2. SCIENTIFIC TERMINOLOGY: You MUST ALWAYS include English scientific and biological terms in parentheses next to Tamil terms.
   Examples:
   - à®•à®² à®®à¯†à®©à¯à®šà®µà¯à®µà¯ (Cell membrane)
   - à®‡à®´à¯ˆà®®à®£à®¿ (Mitochondria)
   - à®’à®³à®¿à®šà¯à®šà¯‡à®°à¯à®•à¯à®•à¯ˆ (Photosynthesis)
   - à®•à¯à®°à¯‹à®®à¯‹à®šà¯‹à®®à¯ / à®¨à®¿à®±à®®à¯‚à®°à¯à®¤à¯à®¤à®®à¯ (Chromosome)
   - à®‡à®°à¯ˆà®ªà¯à®ªà¯ˆà®šà¯ à®šà®¾à®±à¯ (Gastric juice)
   - à®¤à®¾à®µà®° à®µà®³à®°à¯à®šà¯à®šà®¿ à®šà¯€à®°à®¾à®•à¯à®•à®¿à®•à®³à¯ (Plant growth regulators)
   - à®‡à®¯à®±à¯à®•à¯ˆ à®¤à¯‡à®°à¯à®µà¯ (Natural selection)
   - à®¨à¯Šà®¤à®¿à®¯à®®à¯ (Enzyme)
3. SYLLABUS ALIGNMENT: Strictly align with the Sri Lankan National Institute of Education (NIE) GCE A/L Biology Resource Books / Teacher's Guides across these 8 core units:
   - Unit 1: Introduction to Biology & Cell Biology (à®•à®² à®‰à®¯à®¿à®°à®¿à®¯à®²à¯)
   - Unit 2: Chemical and Cellular Basis of Life
   - Unit 3: Evolution and Diversity of Organisms (à®•à¯‚à®°à¯à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®™à¯à®•à®¿à®•à®³à®¿à®©à¯ à®ªà®²à¯à®µà®•à¯ˆà®®à¯ˆ)
   - Unit 4: Plant Form and Function (à®¤à®¾à®µà®° à®µà®Ÿà®¿à®µà®®à¯à®®à¯ à®¤à¯Šà®´à®¿à®²à¯à®®à¯)
   - Unit 5: Animal Form and Function (à®µà®¿à®²à®™à¯à®•à¯ à®µà®Ÿà®¿à®µà®®à¯à®®à¯ à®¤à¯Šà®´à®¿à®²à¯à®®à¯)
   - Unit 6: Genetics (à®®à®°à®ªà®¿à®¯à®²à¯)
   - Unit 7: Molecular Biology and Recombinant DNA Technology
   - Unit 8: Environmental Biology / Ecology (à®šà¯‚à®´à®²à¯ à®‰à®¯à®¿à®°à®¿à®¯à®²à¯ / à®šà¯‚à®´à®²à®¿à®¯à®²à¯)
   - Unit 9: Microbiology (à®¨à¯à®£à¯à®£à¯à®¯à®¿à®°à®¿à®¯à®²à¯)
   - Unit 10: Applied Biology (à®ªà®¿à®°à®¯à¯‹à®• à®‰à®¯à®¿à®°à®¿à®¯à®²à¯)
4. RETRIEVAL CONTEXT HANDLING:
   If "UPLOADED NOTES CONTEXT" is provided below:
   - Check if the question is answered by or related to the notes.
   - State clearly: "à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à®¿à®©à¯ à®ªà®Ÿà®¿..." (According to the uploaded notes...).
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
      contextPrompt = `\n\n--- UPLOADED NOTES CONTEXT (à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯) ---\n${notesContext.slice(0, 15000)}\n--- END OF CONTEXT ---\n`;
    }

    if (currentTopic) {
      contextPrompt += `\n[à®¤à®±à¯à®ªà¯‹à®¤à¯ˆà®¯ à®…à®²à®•à¯ / Current Topic: ${currentTopic}]\n`;
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
      parts: [{ text: `${contextPrompt}\nà®®à®¾à®£à®µà®°à®¿à®©à¯ à®•à¯‡à®³à¯à®µà®¿ (Student question): ${message}` }],
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

    const answer = response.text || 'à®ªà®¤à®¿à®²à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®µà®¤à®¿à®²à¯ à®¤à®Ÿà®™à¯à®•à®²à¯ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯ à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®•à¯‡à®Ÿà¯à®•à®µà¯à®®à¯.';

    return res.json({
      success: true,
      answer,
      remainingQuestions: rateCheck.remaining,
    });
  } catch (error: any) {
    console.error('Gemini Tutor Error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI à®†à®šà®¿à®°à®¿à®¯à®°à¯à®Ÿà®©à¯ à®‡à®£à¯ˆà®ªà¯à®ªà®¤à®¿à®²à¯ à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯: ' + (error?.message || 'Server error'),
    });
  }
});

// AI Practice Questions Generator Endpoint
app.post('/api/quiz/generate', requireFirebaseAuth, async (req, res) => {
  try {
    const userIdentifier = res.locals.firebaseUid as string;
    const rateCheck = checkRateLimit(userIdentifier);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'à®µà®¿à®©à®¾à®Ÿà®¿ à®µà®¿à®©à®¾ à®‰à®°à¯à®µà®¾à®•à¯à®• à®µà®°à®®à¯à®ªà¯ˆ à®Žà®Ÿà¯à®Ÿà®¿à®µà®¿à®Ÿà¯à®Ÿà¯€à®°à¯à®•à®³à¯. à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯ à®šà®¿à®±à®¿à®¤à¯ à®¨à¯‡à®°à®®à¯ à®•à®¾à®¤à¯à®¤à®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.',
      });
    }

    const { topic, difficulty = 'medium', count = 5 } = req.body;

    const prompt = `Generate ${count} Sri Lankan GCE Advanced Level (A/L) Biology examination-style multiple-choice questions (MCQs) for the topic: "${topic || 'General A/L Biology'}".
Requirements:
1. Language: Accurate Tamil with English scientific terms in parentheses (e.g., "à®•à®²à®®à¯†à®©à¯à®šà®µà¯à®µà¯ (Cell membrane)").
2. Provide exactly 5 options (A, B, C, D, E) per question matching the Sri Lankan A/L 5-option MCQ format.
3. Include an accurate correctOption index (0 to 4).
4. Provide a detailed educational explanation (à®µà®¿à®³à®•à¯à®•à®®à¯) in Tamil explaining why the correct option is right and common pitfalls.
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
      error: 'à®ªà®¯à®¿à®±à¯à®šà®¿à®•à¯ à®•à¯‡à®³à¯à®µà®¿à®•à®³à¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®µà®¤à®¿à®²à¯ à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯: ' + (error?.message || 'Server error'),
    });
  }
});

// Production vs Dev handling with Vite
if (process.env.VERCEL !== '1' && process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else if (process.env.VERCEL !== '1') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BioTutor Tamil server listening on port ${PORT}`);
  });
}
