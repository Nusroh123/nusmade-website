# NUSMADE Security Specification (Leads + Real School RBAC System)

## 1. Data Invariants
1. **Default Deny**: Every document path outside explicitly matched collections (`/demo_requests`, `/contact_inquiries`, `/admins`, `/school_settings`, `/school_teachers`, `/school_students`, `/school_student_fees`) is unconditionally denied.
2. **Public Lead Intake Only (No PII Reads)**: Unauthenticated visitors may `create` leads in `demo_requests` or `contact_inquiries` ONLY with strict schema validation, `status == 'new'`, and `createdAt == request.time`. Only verified Admin (`oyedele.nusroh@gmail.com`) can read, update status, or delete leads.
3. **Strict Separation of School Admin vs. Class Teacher (RBAC)**:
   - **School Admin (`oyedele.nusroh@gmail.com`)**: Full authority over `/school_settings`, `/school_teachers`, `/school_students`, and `/school_student_fees`.
   - **Class Teacher (verified Google Sign-In matching an Admin-created `school_teachers` document)**:
     - Can ONLY read their own `school_teachers` record (`email == request.auth.token.email.lower()`).
     - Can ONLY read and list `/school_students` where `classTeacherEmail == request.auth.token.email.lower()` and `classTeacherEmail.size() > 0`.
     - Can ONLY update academic/roll-call fields (`attendanceDate`, `attendanceToday`, `marks`, `teacherRemark`, `tahfizProgress`, `updatedAt`) on their assigned students—never `admissionNo`, `fullName`, `className`, `classTeacherEmail`, or `createdAt`.
     - Cannot create or delete students or teacher profiles.
4. **Split PII & Financial Collection (`/school_student_fees`)**:
   - Guardian phone numbers, guardian names, tuition fee targets, and payment receipts live in `/school_student_fees/{studentId}`, which is strictly locked to **Admin only**. Teachers have zero read or write access to school finances or guardian phone numbers.
5. **Query Cost Optimization**: No `allow list` rule invokes `get()` or `exists()`; list queries evaluate `resource.data` directly against `request.auth.token.email.lower()`.

---

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return `PERMISSION_DENIED`)
1. Unauthenticated `get` / `list` on `/demo_requests`, `/school_students`, or `/school_student_fees`.
2. Unverified Google user (`email_verified: false`) pretending to be `oyedele.nusroh@gmail.com` or a teacher email.
3. Public `create` on `/demo_requests` with ghost field `"isAdmin": true` or forged `createdAt`.
4. Teacher A (`teacherA@gmail.com` assigned to `JSS 2A`) calling `getDoc` on a `JSS 1A` student in `/school_students`.
5. Teacher A calling `getDocs(collection(db, 'school_students'))` without `where('classTeacherEmail', '==', 'teachera@gmail.com')`.
6. Teacher A attempting `getDoc` or `getDocs` on `/school_student_fees` (tuition & guardian PII leak attempt).
7. Teacher A attempting to transfer a student out of their class by updating `className` or `classTeacherEmail` on `/school_students`.
8. Teacher A attempting to create or delete a student in `/school_students`.
9. Teacher A attempting to assign themselves to another class by updating `/school_teachers/{teacherId}`.
10. Arbitrary signed-in user (`random@gmail.com`) attempting to create `/school_teachers/tch_hack` to make themselves a teacher.
11. Admin or Teacher sending oversized strings (`teacherRemark.length > 500`, `schoolName.length > 160`) or invalid `attendanceToday` enum (`"excused_forever"`).
12. Any user attempting to mutate `createdAt` or `studentId` after creation.
