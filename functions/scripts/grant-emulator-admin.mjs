
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Safety: refuse to run against production Firebase.
if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error("STOP: Firebase Auth Emulator is not enabled.");
  process.exit(1);
}

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node scripts/grant-emulator-admin.mjs YOUR_TEST_UID");
  process.exit(1);
}

const app = initializeApp({
  projectId: "biotutor-tamil",
});

const auth = getAuth(app);

try {
  const user = await auth.getUser(uid);

  const existingClaims = user.customClaims || {};

  await auth.setCustomUserClaims(uid, {
    ...existingClaims,
    admin: true,
  });

  console.log("SUCCESS: Emulator user granted admin claim.");
  console.log("UID:", uid);
  console.log("Admin claim:", true);
  console.log("Sign out and sign in again to refresh the token.");
} catch (error) {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
}
