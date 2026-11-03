# Security Specification: BioTutor Tamil

## 1. Data Invariants
1. Students can view published notes, topics, and PDF documents.
2. Only verified Administrators (`isAdmin()`) can create, update, or delete notes, topics, and PDF documents.
3. Users can only read and write their own User profile (`users/{userId}`) where `userId == request.auth.uid`.
4. Users cannot elevate their own role to 'admin'; roles must be controlled or matched against the trusted `admins/{adminId}` document or verified bootstrap admin email.
5. Quiz attempts (`quiz_results/{resultId}`) can only be created by the authenticated student (`incoming().userId == request.auth.uid`) and read by that student or admin.
6. PDF documents must have valid download URLs, bounded title lengths, and sanitized metadata.
7. Note modifications require strict schema conformance via `isValidNote()`.
8. Admins collection (`admins/{adminId}`) can only be written by existing verified admins or initialized by bootstrap email.

## 2. The Dirty Dozen Payloads (Designed to be REJECTED)
1. **Unauthenticated Note Creation**: Unauthenticated client attempts to POST to `/notes/note123`. -> REJECT (Not signed in).
2. **Student Note Creation**: Authenticated non-admin student attempts to write `/notes/note123`. -> REJECT (Not admin).
3. **Ghost Field Injection (Shadow Update)**: Admin creates note with ghost property `isHacked: true`. -> REJECT (Keys not in allowed schema).
4. **Student Note Deletion**: Student attempts to delete `/notes/note123`. -> REJECT (Admin only).
5. **ID Poisoning Attack**: Path variable `{noteId}` contains 2KB irregular string. -> REJECT (`isValidId(noteId)` fails).
6. **Self-Role Privilege Escalation**: Student modifies `/users/{studentId}` setting `role: "admin"`. -> REJECT (Role modification blocked).
7. **PII Snooping**: Student A tries to `get` or `list` User B's profile `/users/{userB}`. -> REJECT (Owner only).
8. **Spoofed Author ID**: Admin or user creates a note setting `authorId: "other_user_id"`. -> REJECT (Must match `request.auth.uid`).
9. **Fake Quiz Result Submission**: Student A submits a quiz attempt with `userId: "studentB"`. -> REJECT (Must match `request.auth.uid`).
10. **Unbounded String Denial of Wallet**: Attacker creates a note with 500,000 character title. -> REJECT (`title.size() <= 200`).
11. **Malicious PDF Creation**: Non-admin attempts to insert `/pdfs/pdf123`. -> REJECT (Admin only).
12. **Admin Privilege Hijacking**: Non-admin attempts to create a document in `/admins/{attackerId}`. -> REJECT (Only verified bootstrap admin or existing admin).
