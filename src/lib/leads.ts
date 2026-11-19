import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'archived';

export interface DemoRequestInput {
  schoolName: string;
  fullName: string;
  email: string;
  phone: string;
  schoolType: string;
  numberOfStudents: string;
  preferredDate: string;
  selectedPlan: string;
  message: string;
}

export interface DemoRequestRecord extends DemoRequestInput {
  referenceId: string;
  status: LeadStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface ContactInquiryInput {
  name: string;
  schoolName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactInquiryRecord extends ContactInquiryInput {
  referenceId: string;
  status: LeadStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

function clampString(value: string, maxLength: number, fallback = ''): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

export function makeReferenceId(prefix: 'NUS-DEMO' | 'NUS-INQ'): string {
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `${prefix}-${timePart}${randomPart}`;
}

export async function submitDemoRequest(
  input: DemoRequestInput
): Promise<{ referenceId: string; receivedAt: string }> {
  const referenceId = makeReferenceId('NUS-DEMO');
  const path = `demo_requests/${referenceId}`;

  const payload = {
    referenceId,
    schoolName: clampString(input.schoolName, 160),
    fullName: clampString(input.fullName, 120),
    email: clampString(input.email, 160),
    phone: clampString(input.phone, 30),
    schoolType: clampString(input.schoolType, 80, 'School (Conventional)'),
    numberOfStudents: clampString(input.numberOfStudents, 80, '150 - 500 Students'),
    preferredDate: clampString(input.preferredDate, 20),
    selectedPlan: clampString(input.selectedPlan, 80, 'Growth Suite'),
    message: clampString(input.message, 2000, ''),
    status: 'new' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'demo_requests', referenceId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  const receivedAt = new Date().toISOString();

  // Best-effort secondary sync to Express webhook endpoint if configured
  void fetch('/api/book-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, referenceId }),
  }).catch(() => undefined);

  return { referenceId, receivedAt };
}

export async function submitContactInquiry(
  input: ContactInquiryInput
): Promise<{ referenceId: string; receivedAt: string }> {
  const referenceId = makeReferenceId('NUS-INQ');
  const path = `contact_inquiries/${referenceId}`;

  const payload = {
    referenceId,
    name: clampString(input.name, 120),
    schoolName: clampString(input.schoolName, 160),
    email: clampString(input.email, 160),
    phone: clampString(input.phone, 30),
    subject: clampString(input.subject, 160, 'General Inquiry'),
    message: clampString(input.message, 2000),
    status: 'new' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'contact_inquiries', referenceId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  const receivedAt = new Date().toISOString();

  // Best-effort secondary sync to Express webhook endpoint if configured
  void fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, referenceId }),
  }).catch(() => undefined);

  return { referenceId, receivedAt };
}

export function subscribeDemoRequests(
  onData: (items: DemoRequestRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'demo_requests';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: DemoRequestRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          referenceId: String(data.referenceId ?? docSnap.id),
          schoolName: String(data.schoolName ?? ''),
          fullName: String(data.fullName ?? ''),
          email: String(data.email ?? ''),
          phone: String(data.phone ?? ''),
          schoolType: String(data.schoolType ?? ''),
          numberOfStudents: String(data.numberOfStudents ?? ''),
          preferredDate: String(data.preferredDate ?? ''),
          selectedPlan: String(data.selectedPlan ?? ''),
          message: String(data.message ?? ''),
          status: (data.status as LeadStatus) || 'new',
          createdAt: (data.createdAt as Timestamp) ?? null,
          updatedAt: (data.updatedAt as Timestamp) ?? null,
        };
      });
      onData(records);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load demo requests.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeContactInquiries(
  onData: (items: ContactInquiryRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'contact_inquiries';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: ContactInquiryRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          referenceId: String(data.referenceId ?? docSnap.id),
          name: String(data.name ?? ''),
          schoolName: String(data.schoolName ?? ''),
          email: String(data.email ?? ''),
          phone: String(data.phone ?? ''),
          subject: String(data.subject ?? ''),
          message: String(data.message ?? ''),
          status: (data.status as LeadStatus) || 'new',
          createdAt: (data.createdAt as Timestamp) ?? null,
          updatedAt: (data.updatedAt as Timestamp) ?? null,
        };
      });
      onData(records);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load contact inquiries.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateLeadStatus(
  collectionName: 'demo_requests' | 'contact_inquiries',
  id: string,
  status: LeadStatus
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await updateDoc(doc(db, collectionName, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLeadRecord(
  collectionName: 'demo_requests' | 'contact_inquiries',
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
