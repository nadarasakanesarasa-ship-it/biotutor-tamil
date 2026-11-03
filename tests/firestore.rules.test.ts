
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { readFileSync } from "node:fs";

import {
  afterAll,
  beforeAll,
  describe,
  test,
} from "vitest";

const PROJECT_ID = "biotutor-tamil";
const SUPER_ADMIN_UID = "MGP8IuW3ZbdCBnVh3a5iFw0T9TO2";

let testEnv: Awaited<
  ReturnType<typeof initializeTestEnvironment>
>;

describe("BioTutor Firestore Security Rules", () => {

  // INITIALIZE FIRESTORE RULES

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: "127.0.0.1",
        port: 8080,
        rules: readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  // SUPER ADMIN HELPER

  const adminDb = () =>
    testEnv
      .authenticatedContext(SUPER_ADMIN_UID, { admin: true })
      .firestore();

  // ==========================================
  // SUPER ADMIN SECURITY TESTS
  // ==========================================

  // NOTES

  test("Super Admin can create notes", async () => {
    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "notes/admin-note"), {
        title: "Cell Biology Notes",
        topic: "Biology",
        content: "Cell structure and functions",
        authorId: SUPER_ADMIN_UID,
        authorName: "Super Admin",
      })
    );
  });

  test("Super Admin can update notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "notes/admin-update-note"), {
        title: "Original Cell Notes",
        topic: "Biology",
        content: "Original content",
        authorId: SUPER_ADMIN_UID,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "notes/admin-update-note"), {
        title: "Updated Cell Notes",
        topic: "Biology",
        content: "Updated content",
        authorId: SUPER_ADMIN_UID,
      })
    );
  });

  test("Super Admin can delete notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "notes/admin-delete-note"), {
        title: "Delete Test Note",
        topic: "Biology",
        content: "Test content",
        authorId: SUPER_ADMIN_UID,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      deleteDoc(doc(db, "notes/admin-delete-note"))
    );
  });

  // PDFs

  test("Super Admin can create PDFs", async () => {
    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "pdfs/admin-pdf"), {
        title: "Biology PDF",
        topic: "Biology",
        downloadUrl: "https://example.com/biology.pdf",
        authorId: SUPER_ADMIN_UID,
      })
    );
  });

  test("Super Admin can update PDFs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "pdfs/admin-update-pdf"), {
        title: "Original Biology PDF",
        topic: "Biology",
        downloadUrl: "https://example.com/original.pdf",
        authorId: SUPER_ADMIN_UID,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "pdfs/admin-update-pdf"), {
        title: "Updated Biology PDF",
        topic: "Biology",
        downloadUrl: "https://example.com/updated.pdf",
        authorId: SUPER_ADMIN_UID,
      })
    );
  });

  test("Super Admin can delete PDFs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "pdfs/admin-delete-pdf"), {
        title: "Delete Test PDF",
        topic: "Biology",
        downloadUrl: "https://example.com/delete.pdf",
        authorId: SUPER_ADMIN_UID,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      deleteDoc(doc(db, "pdfs/admin-delete-pdf"))
    );
  });

  // TOPICS

  test("Super Admin can create topics", async () => {
    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "topics/admin-topic"), {
        name: "உயிரணுவியல்",
        nameEn: "Cell Biology",
        description: "Study of cells",
        order: 1,
      })
    );
  });

  test("Super Admin can update topics", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "topics/admin-update-topic"), {
        name: "Original Topic",
        nameEn: "Original Topic",
        description: "Original description",
        order: 1,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      setDoc(doc(db, "topics/admin-update-topic"), {
        name: "Updated Topic",
        nameEn: "Updated Topic",
        description: "Updated description",
        order: 2,
      })
    );
  });

  test("Super Admin can delete topics", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "topics/admin-delete-topic"), {
        name: "Delete Topic",
        nameEn: "Delete Topic",
        description: "Delete test",
        order: 1,
      });
    });

    const db = adminDb();

    await assertSucceeds(
      deleteDoc(doc(db, "topics/admin-delete-topic"))
    );
  });

  // ==========================================
  // QUIZ SECURITY TESTS
  // ==========================================

  test("Student cannot read quiz questions directly", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      getDoc(doc(db, "quiz_questions/q1"))
    );
  });

  test("Student cannot create quiz results directly", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(doc(db, "quiz_results/test-result"), {
        userId: "student-123",
        topic: "General A/L Biology",
        score: 3,
        total: 5,
        percentage: 60,
        completedAt: new Date().toISOString(),
      })
    );
  });

  test("Student cannot update an existing quiz result", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "quiz_results/existing-result"),
        {
          userId: "student-456",
          topic: "General A/L Biology",
          score: 3,
          total: 5,
          percentage: 60,
          completedAt: new Date().toISOString(),
        }
      );
    });

    const db = testEnv.authenticatedContext("student-456").firestore();

    await assertFails(
      setDoc(
        doc(db, "quiz_results/existing-result"),
        { score: 5 },
        { merge: true }
      )
    );
  });

  test("Student cannot read another student's quiz result", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "quiz_results/another-student-result"),
        {
          userId: "student-456",
          topic: "General A/L Biology",
          score: 3,
          total: 5,
          percentage: 60,
          completedAt: new Date().toISOString(),
        }
      );
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      getDoc(doc(db, "quiz_results/another-student-result"))
    );
  });

  // ==========================================
  // USER SECURITY TESTS
  // ==========================================

  test("Student cannot read another student's profile", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      getDoc(doc(db, "users/student-456"))
    );
  });

  test("Student cannot change their role to admin", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(doc(db, "users/student-123"), {
        email: "student@example.com",
        displayName: "Test Student",
        role: "admin",
      })
    );
  });

  // ==========================================
  // NOTES SECURITY TESTS
  // ==========================================

  test("Anyone can read published notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "notes/note-1"), {
        title: "Cell Biology",
        topic: "Biology",
        content: "Introduction to cells",
        authorId: "admin-123",
      });
    });

    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(
      getDoc(doc(db, "notes/note-1"))
    );
  });

  test("Student cannot create notes", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(doc(db, "notes/student-note"), {
        title: "Cell Biology",
        topic: "Biology",
        content: "Student created note",
        authorId: "student-123",
      })
    );
  });

  test("Student cannot update notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "notes/note-2"), {
        title: "Cell Biology",
        topic: "Biology",
        content: "Original content",
        authorId: "admin-123",
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(
        doc(db, "notes/note-2"),
        { content: "Changed content" },
        { merge: true }
      )
    );
  });

  test("Student cannot delete notes", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "notes/note-3"), {
        title: "Cell Biology",
        topic: "Biology",
        content: "Original content",
        authorId: "admin-123",
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      deleteDoc(doc(db, "notes/note-3"))
    );
  });

  // ==========================================
  // PDF SECURITY TESTS
  // ==========================================

  test("Anyone can read published PDFs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "pdfs/pdf-1"), {
        title: "Biology Notes",
        topic: "Biology",
        downloadUrl: "https://example.com/biology.pdf",
        authorId: "admin-123",
      });
    });

    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(
      getDoc(doc(db, "pdfs/pdf-1"))
    );
  });

  test("Student cannot create PDFs", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(doc(db, "pdfs/student-pdf"), {
        title: "Student PDF",
        topic: "Biology",
        downloadUrl: "https://example.com/student.pdf",
        authorId: "student-123",
      })
    );
  });

  test("Student cannot update PDFs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "pdfs/pdf-2"), {
        title: "Biology Notes",
        topic: "Biology",
        downloadUrl: "https://example.com/biology.pdf",
        authorId: "admin-123",
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(
        doc(db, "pdfs/pdf-2"),
        { title: "Changed PDF" },
        { merge: true }
      )
    );
  });

  test("Student cannot delete PDFs", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "pdfs/pdf-3"), {
        title: "Biology Notes",
        topic: "Biology",
        downloadUrl: "https://example.com/biology.pdf",
        authorId: "admin-123",
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      deleteDoc(doc(db, "pdfs/pdf-3"))
    );
  });

  // ==========================================
  // TOPICS SECURITY TESTS
  // ==========================================

  test("Anyone can read published topics", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "topics/topic-1"), {
        name: "உயிரணுவியல்",
        nameEn: "Cell Biology",
        description: "Study of cells",
        order: 1,
      });
    });

    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(
      getDoc(doc(db, "topics/topic-1"))
    );
  });

  test("Student cannot create topics", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(doc(db, "topics/student-topic"), {
        name: "உயிரணுவியல்",
        nameEn: "Cell Biology",
        description: "Student created topic",
        order: 1,
      })
    );
  });

  test("Student cannot update topics", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "topics/topic-2"), {
        name: "உயிரணுவியல்",
        nameEn: "Cell Biology",
        description: "Original topic",
        order: 1,
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      setDoc(
        doc(db, "topics/topic-2"),
        { description: "Changed topic" },
        { merge: true }
      )
    );
  });

  test("Student cannot delete topics", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "topics/topic-3"), {
        name: "உயிரணுவியல்",
        nameEn: "Cell Biology",
        description: "Topic for delete test",
        order: 1,
      });
    });

    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(
      deleteDoc(doc(db, "topics/topic-3"))
    );
  });

  // CLEANUP

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });
});
