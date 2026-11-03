# BioTutor Tamil — Upgrade Package

இந்த package ஏற்கனவே உள்ள React + TypeScript + Vite + Firebase project-ஐ மேம்படுத்துகிறது.

## சேர்க்கப்பட்டவை
- Admin dashboard: overview, பாடங்கள், அலகுகள், MCQ வினா வங்கி
- Admin மூலம் lesson create/edit/delete
- Admin மூலம் புதிய syllabus topic சேர்த்தல்
- Admin மூலம் 2–5 option MCQ சேர்த்தல்; சரியான விடை மற்றும் விளக்கம்
- Firestore `quiz_questions` realtime collection மற்றும் rules
- Practice Quiz-ல் admin வெளியிட்ட MCQ-களும் built-in sample questions-உம் பயன்படுத்தப்படும்
- Admin-only navbar entry
- Vercel deployment configuration மற்றும் Express API catch-all function

## நிறுவி இயக்குவது
1. ZIP-ஐ extract செய்.
2. Project root folder-ல் terminal திற.
3. `npm install`
4. `.env.example`-ஐ பார்த்து `.env.local` உருவாக்கு; `GEMINI_API_KEY`-ஐ உன் Gemini key-ஆல் நிரப்பு. Key-ஐ frontend code-ல் வைக்க வேண்டாம்.
5. `npm run dev`
6. Build சரிபார்க்க `npm run build`.

## Firebase அமைப்பு
- `firebase-applet-config.json`-ல் உள்ள Firebase project/database config சரியானது என்பதை உறுதி செய்.
- Firebase Console → Firestore Database → Rules பகுதியில் `firestore.rules` உள்ள rules-ஐ review செய்து deploy செய்.
- Authentication-ல் Email/Password மற்றும் வேண்டுமெனில் Google provider enable செய்.
- Bootstrap admin email `src/lib/firebase.ts` மற்றும் `firestore.rules`-ல் உள்ள `nadarasakanesarasa@gmail.com`. வேறு admin பயன்படுத்தினால் இரண்டு இடங்களிலும் மாற்றி deploy செய்.
- Admin role-ஐ பொதுவான signup form-ல் user தேர்வு செய்ய முடியாது. Firestore rules தான் இறுதி பாதுகாப்பு எல்லை.

## Vercel
- Root Directory ஆக இந்த project root-ஐத் தேர்ந்தெடு; `src/` அல்லது `api/` அல்ல.
- Build command: `npm run build`; output directory: `dist` (vercel.json-ல் அமைக்கப்பட்டுள்ளது).
- Project Environment Variables-ல் `GEMINI_API_KEY` அமைக்கவும்.
- Vercel Functions-ல் API routes `/api/tutor/chat`, `/api/quiz/generate`, `/api/pdf/extract-text` Express app வழியாக route ஆகும்.
- Deploy செய்த பின் login, Firestore read/write, AI API மற்றும் PDF text extraction ஆகியவற்றை தனித்தனியாகச் சோதிக்கவும்.

## முக்கியக் குறிப்பு
Firebase project configuration மற்றும் Gemini API key உன் environment-க்கு உரியவை. அவற்றை இங்கிருந்து நேரடியாகச் சோதிக்க முடியாது. Admin UI-யில் சேர்க்கும் MCQ-கள் `quiz_questions` collection-ல் சேமிக்கப்படும். Firestore rules deploy செய்யப்படாவிட்டால் எழுதும் செயல்கள் அனுமதி மறுக்கப்படலாம்.
