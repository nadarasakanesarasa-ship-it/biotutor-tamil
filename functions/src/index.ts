
import { setGlobalOptions } from "firebase-functions";
import {
  onRequest,
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { SERVER_QUIZ_QUESTIONS } from "./quizBank";

setGlobalOptions({
  maxInstances: 2,
  region: "asia-south1",
});

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// ==========================================
// SUPER ADMIN CONFIGURATION
// ==========================================


// ==========================================
// TEMPORARY LOCAL EMULATOR SUPER ADMIN SETUP
// ==========================================

export const setupSuperAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please login first.");
  }

  const isEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  logger.info("Super Admin setup check", {
    isEmulator,
    authenticated: Boolean(request.auth),
  });

  if (!isEmulator) {
    throw new HttpsError(
      "failed-precondition",
      "Super Admin setup is available only in local emulators."
    );
  }

  const email = request.auth.token.email;

  if (
    typeof email !== "string" ||
    email.toLowerCase() !== "nadarasakanesarasa@gmail.com"
  ) {
    throw new HttpsError(
      "permission-denied",
      "This account is not allowed for local admin testing."
    );
  }

  try {
    const adminAuth = getAuth();
    const targetUid = request.auth.uid;
    const user = await adminAuth.getUser(targetUid);

    await adminAuth.setCustomUserClaims(targetUid, {
      ...user.customClaims,
      admin: true,
    });

    logger.info("Local Super Admin configured successfully.");

    return {
      success: true,
      message: "Local Super Admin configured successfully.",
    };
  } catch (error) {
    logger.error("Local Super Admin setup failed", error);

    throw new HttpsError(
      "internal",
      "Unable to configure local Super Admin."
    );
  }
});

// ==========================================
// TYPES
// ==========================================

interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

interface QuestionKey {
  correctIndex: number;
  explanation: string;
  optionsLength: number;
}

// ==========================================
// TEST FUNCTION
// ==========================================

export const bioTutorTest = onRequest(
  { cors: true },
  (request, response) => {
    logger.info("BioTutor Tamil Test Function called");

    response.status(200).json({
      success: true,
      message: "BioTutor Tamil Cloud Functions is working!",
      timestamp: new Date().toISOString(),
    });
  }
);

// ==========================================
// SECURE QUIZ QUESTIONS ENDPOINT
// ==========================================

export const getSafeQuizQuestions = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method !== "GET") {
      response.status(405).json({
        success: false,
        message: "Method not allowed",
      });
      return;
    }

    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        response.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const idToken = authorization.substring(7);
      await getAuth().verifyIdToken(idToken);

      const snapshot = await db.collection("quiz_questions").get();

      const firestoreQuestions = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          question: data.question,
          topic: data.topic,
          options: data.options,
        };
      });

      const serverQuestions = SERVER_QUIZ_QUESTIONS.map(
        ({ correctIndex, explanation, ...safeQuestion }) => safeQuestion
      );

      response.status(200).json({
        success: true,
        questions: [
          ...serverQuestions,
          ...firestoreQuestions,
        ],
      });
    } catch (error) {
      logger.error("Failed to fetch quiz questions", error);

      response.status(500).json({
        success: false,
        message: "Unable to authenticate or fetch questions",
      });
    }
  }
);

// ==========================================
// ADMIN-ONLY QUIZ QUESTIONS ENDPOINT
// ==========================================

export const getAdminQuizQuestions = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method !== "GET") {
      response.status(405).json({
        success: false,
        message: "Method not allowed",
      });
      return;
    }

    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        response.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const idToken = authorization.substring(7);
      const decodedToken = await getAuth().verifyIdToken(idToken);

      if (decodedToken.admin !== true) {
        response.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      const snapshot = await db
        .collection("quiz_questions")
        .get();

      const questions = snapshot.docs.map((questionDoc) => {
        const data = questionDoc.data();

        return {
          id: questionDoc.id,
          question: data.question,
          topic: data.topic,
          options: data.options,
          correctIndex: data.correctIndex,
          explanation: data.explanation,
        };
      });

      response.set("Cache-Control", "no-store");

      response.status(200).json({
        success: true,
        questions,
      });
    } catch (error) {
      logger.error("Failed to fetch admin quiz questions", error);

      response.status(500).json({
        success: false,
        message: "Unable to fetch admin quiz questions",
      });
    }
  }
);

// ==========================================
// SECURE QUIZ GRADING ENDPOINT
// ==========================================

export const gradeQuizAttempt = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).json({
        success: false,
        message: "Method not allowed",
      });
      return;
    }

    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        response.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const idToken = authorization.substring(7);
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const { topic, answers } = request.body || {};

      if (
        typeof topic !== "string" ||
        topic.trim().length === 0 ||
        topic.length > 100 ||
        !Array.isArray(answers) ||
        answers.length < 1 ||
        answers.length > 50
      ) {
        response.status(400).json({
          success: false,
          message: "Invalid quiz submission",
        });
        return;
      }

      const submittedAnswers = answers as SubmittedAnswer[];
      const submittedIds = new Set<string>();

      for (const answer of submittedAnswers) {
        if (
          !answer ||
          typeof answer.questionId !== "string" ||
          answer.questionId.length === 0 ||
          answer.questionId.length > 150 ||
          !Number.isInteger(answer.selectedIndex) ||
          answer.selectedIndex < 0 ||
          submittedIds.has(answer.questionId)
        ) {
          response.status(400).json({
            success: false,
            message: "Invalid answer data",
          });
          return;
        }

        submittedIds.add(answer.questionId);
      }

      const questionBank = new Map<string, QuestionKey>();

      SERVER_QUIZ_QUESTIONS.forEach((question) => {
        questionBank.set(question.id, {
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          optionsLength: question.options.length,
        });
      });

      const firestoreQuestions = await Promise.all(
        submittedAnswers.map(async (answer) => {
          const doc = await db
            .collection("quiz_questions")
            .doc(answer.questionId)
            .get();

          if (!doc.exists) {
            return null;
          }

          const data = doc.data();

          if (
            !data ||
            !Array.isArray(data.options) ||
            !Number.isInteger(data.correctIndex) ||
            data.correctIndex < 0 ||
            data.correctIndex >= data.options.length ||
            typeof data.explanation !== "string"
          ) {
            return null;
          }

          return {
            id: doc.id,
            correctIndex: data.correctIndex as number,
            explanation: data.explanation as string,
            optionsLength: data.options.length,
          };
        })
      );

      firestoreQuestions.forEach((question) => {
        if (question) {
          questionBank.set(question.id, {
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            optionsLength: question.optionsLength,
          });
        }
      });

      const gradedAnswers = submittedAnswers.map((answer) => {
        const question = questionBank.get(answer.questionId);

        if (
          !question ||
          answer.selectedIndex >= question.optionsLength
        ) {
          throw new Error("Invalid or unknown quiz question");
        }

        return {
          questionId: answer.questionId,
          selectedIndex: answer.selectedIndex,
          correct: answer.selectedIndex === question.correctIndex,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
        };
      });

      const score = gradedAnswers.filter(
        (answer) => answer.correct
      ).length;

      const total = gradedAnswers.length;
      const percentage = Math.round((score / total) * 100);

      const resultRef = db.collection("quiz_results").doc();

      await resultRef.set({
        userId,
        topic,
        score,
        total,
        percentage,
        completedAt: new Date().toISOString(),
      });

      response.status(200).json({
        success: true,
        score,
        total,
        percentage,
        gradedAnswers,
      });
    } catch (error) {
      logger.error("Quiz grading failed", error);

      response.status(400).json({
        success: false,
        message: "Unable to grade quiz attempt",
      });
    }
  }
);

// ==========================================
// ADMIN-ONLY: LIST REGISTERED USERS
// ==========================================

export const getAdminUsers = onRequest(
  { cors: true },
  async (request, response) => {
    response.set("Cache-Control", "no-store");

    if (request.method !== "GET") {
      response.status(405).json({
        success: false,
        message: "Method not allowed",
      });
      return;
    }

    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        response.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const idToken = authorization.substring(7);
      const decodedToken = await getAuth().verifyIdToken(idToken);

      if (decodedToken.admin !== true) {
        response.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      const pageToken =
        typeof request.query.pageToken === "string"
          ? request.query.pageToken
          : undefined;

      const result = await getAuth().listUsers(100, pageToken);

      response.status(200).json({
        success: true,
        users: result.users.map((user) => ({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime ?? "",
          disabled: user.disabled,
        })),
        nextPageToken: result.pageToken ?? null,
      });
    } catch (error) {
      logger.error("Admin user list request failed", error);

      response.status(500).json({
        success: false,
        message: "Unable to fetch users",
      });
    }
  }
);

// ==========================================
// ADMIN-ONLY: GET STUDENT QUIZ RESULTS
// ==========================================

export const getAdminQuizResults = onRequest(
  { cors: true },
  async (request, response) => {
    response.set("Cache-Control", "no-store");

    if (request.method !== "GET") {
      response.status(405).json({
        success: false,
        message: "Method not allowed",
      });
      return;
    }

    try {
      const authorization = request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        response.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const idToken = authorization.substring(7);
      const decodedToken = await getAuth().verifyIdToken(idToken);

      if (decodedToken.admin !== true) {
        response.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      const snapshot = await db
        .collection("quiz_results")
        .orderBy("completedAt", "desc")
        .limit(200)
        .get();

      const results = snapshot.docs.map((resultDoc) => {
        const data = resultDoc.data();

        return {
          id: resultDoc.id,
          userId: data.userId ?? "",
          topic: data.topic ?? "",
          score: data.score ?? 0,
          total: data.total ?? 0,
          percentage: data.percentage ?? 0,
          completedAt: data.completedAt ?? null,
        };
      });

      response.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      logger.error("Admin quiz results request failed", error);

      response.status(500).json({
        success: false,
        message: "Unable to fetch quiz results",
      });
    }
  }
);
