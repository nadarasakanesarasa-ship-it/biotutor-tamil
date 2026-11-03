import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { BiologyTopic, BiologyNote, PdfDocument, QuizResult } from '../types';
import { INITIAL_TOPICS, INITIAL_NOTES, INITIAL_PDFS, normalizeTopicLabel } from "./seedata";

interface DataContextType {
  topics: BiologyTopic[];
  notes: BiologyNote[];
  pdfs: PdfDocument[];
  userQuizResults: QuizResult[];
  loading: boolean;
  notesLoading: boolean;
  pdfsLoading: boolean;
  addNote: (note: Omit<BiologyNote, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>) => Promise<boolean>;
  updateNote: (id: string, note: Partial<BiologyNote>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  addPdfDoc: (pdf: Omit<PdfDocument, 'id' | 'uploadedAt' | 'authorId'>) => Promise<boolean>;
  deletePdfDoc: (id: string) => Promise<boolean>;
  recordQuizResult: (topic: string, score: number, total: number) => Promise<boolean>;
  retrieveRelevantContext: (queryText: string, selectedTopic?: string) => string;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [topics, setTopics] = useState<BiologyTopic[]>(INITIAL_TOPICS);
  const [notes, setNotes] = useState<BiologyNote[]>(INITIAL_NOTES);
  const [pdfs, setPdfs] = useState<PdfDocument[]>(INITIAL_PDFS);
  const [userQuizResults, setUserQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [pdfsLoading, setPdfsLoading] = useState<boolean>(false);

  // Load topics from Firestore, fallback to INITIAL_TOPICS if empty
  const loadTopics = async () => {
    try {
      const snap = await getDocs(collection(db, 'topics'));
      const storedTopics: BiologyTopic[] = [];
      snap.forEach((d) => storedTopics.push({ ...d.data(), id: d.id } as BiologyTopic));

      // The official 10 syllabus units are authoritative. Keep unrelated custom
      // topics, but hide the old generic seed topics to avoid duplicate entries.
      const legacyIds = new Set([
        'cell-biology', 'plant-biology', 'animal-biology', 'genetics',
        'ecology', 'evolution', 'microbiology', 'applied-biology',
      ]);
      const canonicalIds = new Set(INITIAL_TOPICS.map((topic) => topic.id));
      const legacyNames = new Set([
        'cell biology', 'plant biology', 'animal biology', 'genetics',
        'ecology', 'evolution', 'microbiology', 'applied biology',
      ]);
      const customTopics = storedTopics.filter((topic) =>
        !legacyIds.has(topic.id) &&
        !canonicalIds.has(topic.id) &&
        !legacyNames.has((topic.nameEn || '').toLowerCase())
      );
      customTopics.sort((a, b) => (a.order || 0) - (b.order || 0));
      setTopics([...INITIAL_TOPICS, ...customTopics]);
    } catch (err) {
      console.warn('Using initial biology topics (local fallback):', err);
      setTopics(INITIAL_TOPICS);
    }
  };

  // Load notes from Firestore with realtime snapshot listener
  const setupNotesListener = () => {
    setNotesLoading(true);
    const path = 'notes';
    try {
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snap) => {
          if (!snap.empty) {
            const list: BiologyNote[] = [];
            snap.forEach((d) => { const note = { ...d.data(), id: d.id } as BiologyNote; list.push({ ...note, topic: normalizeTopicLabel(note.topic || '') }); });
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotes(list);
          } else {
            setNotes(INITIAL_NOTES.map((note) => ({ ...note, topic: normalizeTopicLabel(note.topic) })));
          }
          setNotesLoading(false);
        },
        (error) => {
          console.warn('Notes snapshot notice, using local initial notes:', error.message);
          setNotes(INITIAL_NOTES.map((note) => ({ ...note, topic: normalizeTopicLabel(note.topic) })));
          setNotesLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      setNotes(INITIAL_NOTES.map((note) => ({ ...note, topic: normalizeTopicLabel(note.topic) })));
      setNotesLoading(false);
      return () => {};
    }
  };

  // Load PDFs from Firestore with realtime listener
  const setupPdfsListener = () => {
    setPdfsLoading(true);
    const path = 'pdfs';
    try {
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snap) => {
          if (!snap.empty) {
            const list: PdfDocument[] = [];
            snap.forEach((d) => { const pdf = { ...d.data(), id: d.id } as PdfDocument; list.push({ ...pdf, topic: normalizeTopicLabel(pdf.topic || '') }); });
            list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            setPdfs(list);
          } else {
            setPdfs(INITIAL_PDFS.map((pdf) => ({ ...pdf, topic: normalizeTopicLabel(pdf.topic) })));
          }
          setPdfsLoading(false);
        },
        (error) => {
          console.warn('PDF snapshot notice, using local initial PDFs:', error.message);
          setPdfs(INITIAL_PDFS.map((pdf) => ({ ...pdf, topic: normalizeTopicLabel(pdf.topic) })));
          setPdfsLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      setPdfs(INITIAL_PDFS.map((pdf) => ({ ...pdf, topic: normalizeTopicLabel(pdf.topic) })));
      setPdfsLoading(false);
      return () => {};
    }
  };

  // Load user's quiz attempts
  useEffect(() => {
    if (!currentUser) {
      setUserQuizResults([]);
      return;
    }

    const path = 'quiz_results';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: QuizResult[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as QuizResult));
          list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          setUserQuizResults(list);
        },
        (error) => {
          console.warn('Quiz results listener notice:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Quiz listener error:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTopics();
    const unsubNotes = setupNotesListener();
    const unsubPdfs = setupPdfsListener();
    setLoading(false);

    return () => {
      unsubNotes();
      unsubPdfs();
    };
  }, []);

  const refreshData = async () => {
    await loadTopics();
  };

  // Admin: Add Note
  const addNote = async (
    noteData: Omit<BiologyNote, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>
  ): Promise<boolean> => {
    if (!currentUser) throw new Error('உள்நுழைய வேண்டும் (Must be logged in).');
    const path = 'notes';
    const noteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newNote: BiologyNote = {
      ...noteData,
      id: noteId,
      authorId: currentUser.uid,
      authorName: userProfile?.displayName || 'ஆசிரியர்',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, noteId), newNote);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${noteId}`);
      return false;
    }
  };

  // Admin: Update Note
  const updateNote = async (id: string, noteData: Partial<BiologyNote>): Promise<boolean> => {
    if (!currentUser) throw new Error('உள்நுழைய வேண்டும்.');
    const path = `notes/${id}`;
    try {
      const existing = notes.find((n) => n.id === id);
      if (!existing) throw new Error('குறிப்பு காணப்படவில்லை (Note not found).');

      const updated = {
        ...existing,
        ...noteData,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'notes', id), updated, { merge: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  };

  // Admin: Delete Note
  const deleteNote = async (id: string): Promise<boolean> => {
    if (!currentUser) throw new Error('உள்நுழைய வேண்டும்.');
    const path = `notes/${id}`;
    try {
      await deleteDoc(doc(db, 'notes', id));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  };

  // Admin: Add PDF Document
  const addPdfDoc = async (
    pdfData: Omit<PdfDocument, 'id' | 'uploadedAt' | 'authorId'>
  ): Promise<boolean> => {
    if (!currentUser) throw new Error('உள்நுழைய வேண்டும்.');
    const path = 'pdfs';
    const pdfId = 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newPdf: PdfDocument = {
      ...pdfData,
      id: pdfId,
      authorId: currentUser.uid,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, pdfId), newPdf);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${pdfId}`);
      return false;
    }
  };

  // Admin: Delete PDF Document
  const deletePdfDoc = async (id: string): Promise<boolean> => {
    if (!currentUser) throw new Error('உள்நுழைய வேண்டும்.');
    const path = `pdfs/${id}`;
    try {
      await deleteDoc(doc(db, 'pdfs', id));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  };

  // Student: Record Quiz Result
  const recordQuizResult = async (topic: string, score: number, total: number): Promise<boolean> => {
    if (!currentUser) return false;
    const path = 'quiz_results';
    const resultId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const percentage = Math.round((score / total) * 100);
    const newResult: QuizResult = {
      id: resultId,
      userId: currentUser.uid,
      topic,
      score,
      total,
      percentage,
      completedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, resultId), newResult);
      return true;
    } catch (error) {
      console.warn('Quiz result saving notice:', error);
      // Still store locally in state so student sees immediate reflection
      setUserQuizResults((prev) => [newResult, ...prev]);
      return true;
    }
  };

  // Smart Context Retriever for AI Tutor: Extracts relevant paragraphs from notes and PDFs
  const retrieveRelevantContext = (queryText: string, selectedTopic?: string): string => {
    const qLower = queryText.toLowerCase();
    const matchedPassages: string[] = [];

    // Filter notes
    const searchNotes = selectedTopic && selectedTopic !== 'all'
      ? notes.filter((n) => n.topic.toLowerCase().includes(selectedTopic.toLowerCase()))
      : notes;

    for (const note of searchNotes) {
      const titleMatch = note.title.toLowerCase().includes(qLower);
      const contentMatch = note.content.toLowerCase().includes(qLower);

      // Check keyword overlap
      const words = qLower.split(/\s+/).filter((w) => w.length > 2);
      const wordHits = words.filter((w) => note.content.toLowerCase().includes(w)).length;

      if (titleMatch || contentMatch || wordHits >= 1) {
        matchedPassages.push(
          `[பாடக்குறிப்பு / Note: "${note.title}" (${note.topic})]\n${note.content.slice(0, 1500)}`
        );
      }
      if (matchedPassages.length >= 3) break;
    }

    // Search PDFs extracted text
    const searchPdfs = selectedTopic && selectedTopic !== 'all'
      ? pdfs.filter((p) => p.topic.toLowerCase().includes(selectedTopic.toLowerCase()))
      : pdfs;

    for (const pdf of searchPdfs) {
      if (pdf.extractedText && pdf.extractedText.length > 0) {
        const titleMatch = pdf.title.toLowerCase().includes(qLower);
        const textMatch = pdf.extractedText.toLowerCase().includes(qLower);
        const words = qLower.split(/\s+/).filter((w) => w.length > 2);
        const wordHits = words.filter((w) => pdf.extractedText?.toLowerCase().includes(w)).length;

        if (titleMatch || textMatch || wordHits >= 1) {
          matchedPassages.push(
            `[PDF ஆவண உரை / PDF Text: "${pdf.title}" (${pdf.topic})]\n${pdf.extractedText.slice(0, 1500)}`
          );
        }
      }
      if (matchedPassages.length >= 4) break;
    }

    return matchedPassages.join('\n\n');
  };

  return (
    <DataContext.Provider
      value={{
        topics,
        notes,
        pdfs,
        userQuizResults,
        loading,
        notesLoading,
        pdfsLoading,
        addNote,
        updateNote,
        deleteNote,
        addPdfDoc,
        deletePdfDoc,
        recordQuizResult,
        retrieveRelevantContext,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
