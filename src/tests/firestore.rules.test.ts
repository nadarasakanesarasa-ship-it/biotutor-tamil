import {
  initializeTestEnvironment,
  assertFails,
} from "@firebase/rules-unit-testing";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, test } from "vitest";

const PROJECT_ID = "biotutor-tamil";

let testEnv: Awaited<
  ReturnType<typeof initializeTestEnvironment>
>;

describe("BioTutor Firestore Security Rules", () => {
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

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test("Student cannot read quiz questions directly", async () => {
    const db = testEnv.authenticatedContext("student-123").firestore();

    await assertFails(getDoc(doc(db, "quiz_questions/q1")));
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
});