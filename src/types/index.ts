export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface BiologyTopic {
  id: string;
  name: string;      // Tamil name (e.g. "கல உயிரியல்")
  nameEn: string;    // English name (e.g. "Cell Biology")
  description?: string;
  order: number;
}

export interface BiologyNote {
  id: string;
  title: string;
  topic: string;
  subtopic?: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  accessType: 'free' | 'premium';
}

export interface PdfDocument {
  id: string;
  title: string;
  topic: string;
  description?: string;
  downloadUrl: string;
  fileName: string;
  fileSize?: number;
  extractedText?: string;
  authorId: string;
  uploadedAt: string;
}

 // Frontend-க்கு அனுப்பப்படும் பாதுகாப்பான வினாக்கள்
export interface PublicQuizQuestion {
  id: string;
  question: string;
  topic: string;
  options: string[];
}

// சரியான விடையும் விளக்கமும் கொண்ட முழுமையான வினா
export interface QuizQuestion extends PublicQuizQuestion {
  correctIndex: number;
  explanation: string;
}


export interface QuizResult {
  id: string;
  userId: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  topic?: string;
  isGrounded?: boolean;
}
