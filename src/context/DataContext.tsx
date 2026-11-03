
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';

import {
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

import { useAuth } from './AuthContext';

import {
  BiologyTopic,
  BiologyNote,
  PdfDocument,
  QuizResult,
  QuizQuestion,
  PublicQuizQuestion,
} from '../types';

import {
  INITIAL_TOPICS,
  INITIAL_NOTES,
  INITIAL_PDFS,
  INITIAL_QUIZ_QUESTIONS,
  normalizeTopicLabel,
} from '../data/seedData';

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  creationTime: string;
  lastSignInTime: string;
  disabled: boolean;
}

interface DataContextType {
  topics: BiologyTopic[];
  notes: BiologyNote[];
  quizQuestions: PublicQuizQuestion[];
  adminQuizQuestions: QuizQuestion[];
  pdfs: PdfDocument[];
  userQuizResults: QuizResult[];

  adminUsers: AdminUser[];
  adminUsersLoading: boolean;
  adminUsersNextPageToken: string | null;
  loadAdminUsers: (pageToken?: string) => Promise<void>;

  loading: boolean;
  notesLoading: boolean;
  pdfsLoading: boolean;

  addNote: (
    note: Omit<BiologyNote, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>
  ) => Promise<boolean>;

  addTopic: (
    topic: Omit<BiologyTopic, 'id'>
  ) => Promise<boolean>;

  addQuizQuestion: (
    question: Omit<QuizQuestion, 'id'>
  ) => Promise<boolean>;

  deleteQuizQuestion: (id: string) => Promise<boolean>;
  migrateInitialQuizQuestions: () => Promise<boolean>;

  updateNote: (
    id: string,
    note: Partial<BiologyNote>
  ) => Promise<boolean>;

  deleteNote: (id: string) => Promise<boolean>;

  addPdfDoc: (
    pdf: Omit<PdfDocument, 'id' | 'uploadedAt' | 'authorId'>
  ) => Promise<boolean>;

  deletePdfDoc: (id: string) => Promise<boolean>;

  recordQuizResult: (
    topic: string,
    score: number,
    total: number
  ) => Promise<boolean>;

  retrieveRelevantContext: (
    queryText: string,
    selectedTopic?: string
  ) => string;

  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(
  undefined
);

// --------------------------------------------------
// CLOUD FUNCTIONS URL
// --------------------------------------------------


// --------------------------------------------------
// PROVIDER
// --------------------------------------------------

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentUser,
    userProfile,
    isAdmin,
    loading: authLoading,
  } = useAuth();

  const [topics, setTopics] = useState<BiologyTopic[]>(INITIAL_TOPICS);
  const [notes, setNotes] = useState<BiologyNote[]>(INITIAL_NOTES);

  const [quizQuestions, setQuizQuestions] =
    useState<PublicQuizQuestion[]>([]);

  const [adminQuizQuestions, setAdminQuizQuestions] =
    useState<QuizQuestion[]>([]);

  const [pdfs, setPdfs] = useState<PdfDocument[]>(INITIAL_PDFS);

  const [userQuizResults, setUserQuizResults] =
    useState<QuizResult[]>([]);

  // Admin users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersNextPageToken, setAdminUsersNextPageToken] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [pdfsLoading, setPdfsLoading] = useState(false);

  const requestVersion = useRef(0);

  // --------------------------------------------------
  // CHECK CURRENT AUTH USER
  // --------------------------------------------------

  function authUserIsCurrent(uid: string): boolean {
    return currentUser?.uid === uid;
  }

  // --------------------------------------------------
  // LOAD TOPICS
  // --------------------------------------------------

  const loadTopics = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'topics'));

      const storedTopics: BiologyTopic[] = [];

      snap.forEach((d) => {
        storedTopics.push({
          ...d.data(),
          id: d.id,
        } as BiologyTopic);
      });

      const legacyIds = new Set([
        'cell-biology',
        'plant-biology',
        'animal-biology',
        'genetics',
        'ecology',
        'evolution',
        'microbiology',
        'applied-biology',
      ]);

      const canonicalIds = new Set(
        INITIAL_TOPICS.map((topic) => topic.id)
      );

      const legacyNames = new Set([
        'cell biology',
        'plant biology',
        'animal biology',
        'genetics',
        'ecology',
        'evolution',
        'microbiology',
        'applied biology',
      ]);

      const customTopics = storedTopics.filter(
        (topic) =>
          !legacyIds.has(topic.id) &&
          !canonicalIds.has(topic.id) &&
          !legacyNames.has(
            (topic.nameEn || '').toLowerCase()
          )
      );

      customTopics.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      setTopics([...INITIAL_TOPICS, ...customTopics]);
    } catch (error) {
      console.warn('Using initial biology topics:', error);
      setTopics(INITIAL_TOPICS);
    }
  }, []);

  // --------------------------------------------------
  // LOAD ADMIN MCQ QUESTIONS
  // --------------------------------------------------

  const loadAdminQuizQuestions = useCallback(async () => {
    const user = currentUser;

    if (!user || !isAdmin) {
      setAdminQuizQuestions([]);
      return;
    }

    const version = requestVersion.current;

    try {
      const snapshot = await getDocs(
        collection(db, 'quiz_questions')
      );

      if (
        version !== requestVersion.current ||
        !authUserIsCurrent(user.uid)
      ) {
        return;
      }

      const questions = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as QuizQuestion[];

      setAdminQuizQuestions(questions);
    } catch (error) {
      console.error('Admin MCQ loading failed:', error);

      if (version === requestVersion.current) {
        setAdminQuizQuestions([]);
      }
    }
  }, [currentUser, isAdmin]);

  // --------------------------------------------------
  // MIGRATE INITIAL MCQ QUESTIONS (ADMIN ONLY)
  // --------------------------------------------------

  const migrateInitialQuizQuestions = async (): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      return false;
    }

    try {
      const [privateSnapshot, publicSnapshot] = await Promise.all([
        getDocs(collection(db, 'quiz_questions')),
        getDocs(collection(db, 'quiz_questions_public')),
      ]);

      const privateIds = new Set(privateSnapshot.docs.map((item) => item.id));
      const publicIds = new Set(publicSnapshot.docs.map((item) => item.id));
      const batch = writeBatch(db);

      for (const question of INITIAL_QUIZ_QUESTIONS) {
        const { id, correctIndex, explanation, ...publicQuestion } = question;

        if (!privateIds.has(id)) {
          batch.set(doc(db, 'quiz_questions', id), question);
        }

        if (!publicIds.has(id)) {
          batch.set(doc(db, 'quiz_questions_public', id), publicQuestion);
        }
      }

      await batch.commit();

      await Promise.all([
        loadAdminQuizQuestions(),
        loadQuizQuestions(),
      ]);

      return true;
    } catch (error) {
      console.error('Initial MCQ migration failed:', error);
      return false;
    }
  };
  // --------------------------------------------------
  // LOAD ADMIN USERS
  // --------------------------------------------------

  const loadAdminUsers = useCallback(
    async (_pageToken?: string): Promise<void> => {
      setAdminUsers([]);
      setAdminUsersNextPageToken(null);
      setAdminUsersLoading(false);
    },
    []
  );

  // --------------------------------------------------
  // LOAD STUDENT-SAFE MCQ QUESTIONS
  // --------------------------------------------------

  const loadQuizQuestions = useCallback(async () => {
    const user = currentUser;

    if (!user) {
      setQuizQuestions([]);
      return;
    }

    const version = requestVersion.current;

    try {
      const snapshot = await getDocs(
        collection(db, 'quiz_questions_public')
      );

      if (
        version !== requestVersion.current ||
        !authUserIsCurrent(user.uid)
      ) {
        return;
      }

      const questions = snapshot.docs.map((item) => ({
        id: item.id,
        question: item.data().question,
        topic: item.data().topic,
        options: item.data().options,
      })) as PublicQuizQuestion[];

      setQuizQuestions(questions);
    } catch (error) {
      console.error('Quiz questions loading failed:', error);

      if (version === requestVersion.current) {
        setQuizQuestions([]);
      }
    }
  }, [currentUser]);

  // --------------------------------------------------
  // NOTES LISTENER
  // --------------------------------------------------

  useEffect(() => {
    setNotesLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'notes'),
      (snap) => {
        const firestoreNotes: BiologyNote[] = [];

        snap.forEach((d) => {
          const note = {
            ...d.data(),
            id: d.id,
          } as BiologyNote;

          firestoreNotes.push({
            ...note,
            topic: normalizeTopicLabel(note.topic || ''),
          });
        });

        const notesMap = new Map<string, BiologyNote>();

        INITIAL_NOTES.forEach((note) => {
          notesMap.set(note.id, {
            ...note,
            topic: normalizeTopicLabel(note.topic || ''),
          });
        });

        firestoreNotes.forEach((note) => {
          notesMap.set(note.id, note);
        });

        const combinedNotes = Array.from(notesMap.values());

        combinedNotes.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setNotes(combinedNotes);
        setNotesLoading(false);
      },
      (error) => {
        console.warn('Notes listener failed:', error.message);

        setNotes(
          INITIAL_NOTES.map((note) => ({
            ...note,
            topic: normalizeTopicLabel(note.topic),
          }))
        );

        setNotesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // PDFS LISTENER
  // --------------------------------------------------

  useEffect(() => {
    setPdfsLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'pdfs'),
      (snap) => {
        if (!snap.empty) {
          const list: PdfDocument[] = [];

          snap.forEach((d) => {
            const pdf = {
              ...d.data(),
              id: d.id,
            } as PdfDocument;

            list.push({
              ...pdf,
              topic: normalizeTopicLabel(pdf.topic || ''),
            });
          });

          list.sort(
            (a, b) =>
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
          );

          setPdfs(list);
        } else {
          setPdfs(
            INITIAL_PDFS.map((pdf) => ({
              ...pdf,
              topic: normalizeTopicLabel(pdf.topic),
            }))
          );
        }

        setPdfsLoading(false);
      },
      (error) => {
        console.warn('PDF listener failed:', error.message);

        setPdfs(
          INITIAL_PDFS.map((pdf) => ({
            ...pdf,
            topic: normalizeTopicLabel(pdf.topic),
          }))
        );

        setPdfsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // INITIAL DATA LOADING
  // --------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    const version = ++requestVersion.current;
    let active = true;

    const initializeData = async () => {
      setLoading(true);

      setQuizQuestions([]);
      setAdminQuizQuestions([]);
      setAdminUsers([]);
      setAdminUsersNextPageToken(null);
      setUserQuizResults([]);

      try {
        await loadTopics();

        await Promise.all([
          loadQuizQuestions(),
          isAdmin
            ? loadAdminQuizQuestions()
            : Promise.resolve(),
          isAdmin
            ? loadAdminUsers()
            : Promise.resolve(),
        ]);
      } catch (error) {
        console.error('Data initialization failed:', error);
      } finally {
        if (
          active &&
          version === requestVersion.current
        ) {
          setLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      active = false;
      requestVersion.current++;
    };
  }, [
    authLoading,
    currentUser,
    isAdmin,
    loadTopics,
    loadQuizQuestions,
    loadAdminQuizQuestions,
    loadAdminUsers,
  ]);

  // --------------------------------------------------
  // REFRESH DATA
  // --------------------------------------------------

  const refreshData = async () => {
    if (authLoading) return;

    await loadTopics();
    await loadQuizQuestions();

    if (currentUser && isAdmin) {
      await Promise.all([
        loadAdminQuizQuestions(),
        loadAdminUsers(),
      ]);
    } else {
      setAdminQuizQuestions([]);
      setAdminUsers([]);
      setAdminUsersNextPageToken(null);
    }
  };

  // --------------------------------------------------
  // ADMIN: ADD TOPIC
  // --------------------------------------------------

  const addTopic = async (
    topicData: Omit<BiologyTopic, 'id'>
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const slug =
      `${Date.now()}_${topicData.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;

    try {
      await setDoc(
        doc(db, 'topics', slug),
        topicData
      );

      await loadTopics();

      return true;
    } catch (error) {
      console.warn('Topic create failed:', error);
      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: ADD MCQ
  // --------------------------------------------------

  const addQuizQuestion = async (
    questionData: Omit<QuizQuestion, 'id'>
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('Admin permission required.');
    }

    if (
      !questionData.question?.trim() ||
      !questionData.topic?.trim() ||
      !Array.isArray(questionData.options) ||
      questionData.options.length < 2 ||
      questionData.options.length > 5 ||
      questionData.options.some(
        (option) => typeof option !== 'string' || !option.trim()
      ) ||
      !Number.isInteger(questionData.correctIndex) ||
      questionData.correctIndex < 0 ||
      questionData.correctIndex >= questionData.options.length ||
      !questionData.explanation?.trim()
    ) {
      throw new Error('Please check the question and answer options.');
    }

    const id =
      `mcq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const privateQuestion = {
      question: questionData.question.trim(),
      topic: questionData.topic.trim(),
      options: questionData.options.map((option) => option.trim()),
      correctIndex: questionData.correctIndex,
      explanation: questionData.explanation.trim(),
    };

    const publicQuestion = {
      question: privateQuestion.question,
      topic: privateQuestion.topic,
      options: privateQuestion.options,
    };

    try {
      const batch = writeBatch(db);

      batch.set(doc(db, 'quiz_questions', id), privateQuestion);
      batch.set(doc(db, 'quiz_questions_public', id), publicQuestion);

      await batch.commit();

      await Promise.all([
        loadAdminQuizQuestions(),
        loadQuizQuestions(),
      ]);

      return true;
    } catch (error) {
      console.warn('MCQ create failed:', error);
      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: DELETE MCQ
  // --------------------------------------------------

  const deleteQuizQuestion = async (
    id: string
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('Admin permission required.');
    }

    if (!id.trim()) {
      return false;
    }

    try {
      const batch = writeBatch(db);

      batch.delete(doc(db, 'quiz_questions', id));
      batch.delete(doc(db, 'quiz_questions_public', id));

      await batch.commit();

      await Promise.all([
        loadAdminQuizQuestions(),
        loadQuizQuestions(),
      ]);

      return true;
    } catch (error) {
      console.warn('MCQ delete failed:', error);
      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: ADD NOTE
  // --------------------------------------------------

  const addNote = async (
    noteData: Omit<
      BiologyNote,
      'id' | 'createdAt' | 'updatedAt' | 'authorId'
    >
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const path = 'notes';

    const noteId =
      'note_' +
      Date.now() +
      '_' +
      Math.random().toString(36).substring(2, 7);

    const newNote = {
      ...noteData,
      subtopic: noteData.subtopic ?? '',
      id: noteId,
      authorId: currentUser.uid,
      authorName: userProfile?.displayName || 'à®†à®šà®¿à®°à®¿à®¯à®°à¯',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const { id: _noteId, ...storedNote } = newNote;

      await setDoc(
        doc(db, path, noteId),
        storedNote
      );

      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${path}/${noteId}`
      );

      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: UPDATE NOTE
  // --------------------------------------------------

  const updateNote = async (
    id: string,
    noteData: Partial<BiologyNote>
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const path = `notes/${id}`;

    try {
      const existing = notes.find(
        (note) => note.id === id
      );

      if (!existing) {
        throw new Error('à®•à¯à®±à®¿à®ªà¯à®ªà¯ à®•à®¾à®£à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.');
      }

      const updated = {
        ...existing,
        ...noteData,
        id,
        authorId: existing.authorId,
        updatedAt: new Date().toISOString(),
      };

      const { id: _noteId, ...storedNote } = updated;

      await setDoc(
        doc(db, 'notes', id),
        storedNote,
        { merge: true }
      );

      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        path
      );

      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: DELETE NOTE
  // --------------------------------------------------

  const deleteNote = async (
    id: string
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const path = `notes/${id}`;

    try {
      await deleteDoc(doc(db, 'notes', id));
      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        path
      );

      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: ADD PDF
  // --------------------------------------------------

  const addPdfDoc = async (
    pdfData: Omit<
      PdfDocument,
      'id' | 'uploadedAt' | 'authorId'
    >
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const path = 'pdfs';

    const pdfId =
      'pdf_' +
      Date.now() +
      '_' +
      Math.random().toString(36).substring(2, 7);

    const newPdf: PdfDocument = {
      ...pdfData,
      id: pdfId,
      authorId: currentUser.uid,
      uploadedAt: new Date().toISOString(),
    };

    try {
      const { id: _pdfId, ...storedPdf } = newPdf;

      await setDoc(
        doc(db, path, pdfId),
        storedPdf
      );

      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${path}/${pdfId}`
      );

      return false;
    }
  };

  // --------------------------------------------------
  // ADMIN: DELETE PDF
  // --------------------------------------------------

  const deletePdfDoc = async (
    id: string
  ): Promise<boolean> => {
    if (!currentUser || !isAdmin) {
      throw new Error('à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®…à®©à¯à®®à®¤à®¿ à®¤à¯‡à®µà¯ˆ.');
    }

    const path = `pdfs/${id}`;

    try {
      await deleteDoc(doc(db, 'pdfs', id));
      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        path
      );

      return false;
    }
  };

  // --------------------------------------------------
  // QUIZ RESULT - LOCAL UI ONLY
  // --------------------------------------------------

  const recordQuizResult = async (
    topic: string,
    score: number,
    total: number
  ): Promise<boolean> => {
    if (
      !currentUser ||
      total <= 0 ||
      score < 0 ||
      score > total
    ) {
      return false;
    }

    const newResult: QuizResult = {
      id:
        'local_qr_' +
        Date.now() +
        '_' +
        Math.random().toString(36).substring(2, 7),
      userId: currentUser.uid,
      topic,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      completedAt: new Date().toISOString(),
    };

    setUserQuizResults((prev) => [
      newResult,
      ...prev,
    ]);

    return true;
  };

  // --------------------------------------------------
  // SMART CONTEXT RETRIEVER
  // --------------------------------------------------

  const retrieveRelevantContext = (
    queryText: string,
    selectedTopic?: string
  ): string => {
    const qLower = queryText.toLowerCase().trim();

    if (!qLower) return '';

    const matchedPassages: string[] = [];

    const searchNotes =
      selectedTopic && selectedTopic !== 'all'
        ? notes.filter((note) =>
            note.topic
              .toLowerCase()
              .includes(selectedTopic.toLowerCase())
          )
        : notes;

    for (const note of searchNotes) {
      const titleMatch =
        note.title.toLowerCase().includes(qLower);

      const contentMatch =
        note.content.toLowerCase().includes(qLower);

      const words = qLower
        .split(/\s+/)
        .filter((word) => word.length > 2);

      const wordHits = words.filter((word) =>
        note.content.toLowerCase().includes(word)
      ).length;

      if (titleMatch || contentMatch || wordHits >= 1) {
        matchedPassages.push(
          `[à®ªà®¾à®Ÿà®•à¯à®•à¯à®±à®¿à®ªà¯à®ªà¯ / Note: "${note.title}" (${note.topic})]\n${note.content.slice(0, 1500)}`
        );
      }

      if (matchedPassages.length >= 3) {
        break;
      }
    }

    const searchPdfs =
      selectedTopic && selectedTopic !== 'all'
        ? pdfs.filter((pdf) =>
            pdf.topic
              .toLowerCase()
              .includes(selectedTopic.toLowerCase())
          )
        : pdfs;

    for (const pdf of searchPdfs) {
      if (
        pdf.extractedText &&
        pdf.extractedText.length > 0
      ) {
        const titleMatch =
          pdf.title.toLowerCase().includes(qLower);

        const textMatch =
          pdf.extractedText.toLowerCase().includes(qLower);

        const words = qLower
          .split(/\s+/)
          .filter((word) => word.length > 2);

        const wordHits = words.filter((word) =>
          pdf.extractedText
            ?.toLowerCase()
            .includes(word)
        ).length;

        if (titleMatch || textMatch || wordHits >= 1) {
          matchedPassages.push(
            `[PDF à®†à®µà®£ à®‰à®°à¯ˆ / PDF Text: "${pdf.title}" (${pdf.topic})]\n${pdf.extractedText.slice(0, 1500)}`
          );
        }
      }

      if (matchedPassages.length >= 4) {
        break;
      }
    }

    return matchedPassages.join('\n\n');
  };

  // --------------------------------------------------
  // PROVIDER
  // --------------------------------------------------

  return (
    <DataContext.Provider
      value={{
        topics,
        notes,
        quizQuestions,
        adminQuizQuestions,
        pdfs,
        userQuizResults,

        adminUsers,
        adminUsersLoading,
        adminUsersNextPageToken,
        loadAdminUsers,

        loading,
        notesLoading,
        pdfsLoading,

        addNote,
        addTopic,
        addQuizQuestion,
        deleteQuizQuestion,
        migrateInitialQuizQuestions,
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

// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error(
      'useData must be used within a DataProvider'
    );
  }

  return context;
}


