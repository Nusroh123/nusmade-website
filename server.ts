import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

interface DemoSubmission {
  referenceId: string;
  type: 'demo';
  schoolName: string;
  fullName: string;
  email: string;
  phone: string;
  schoolType: string;
  numberOfStudents: string;
  preferredDate: string;
  selectedPlan?: string;
  message?: string;
  receivedAt: string;
}

interface ContactSubmission {
  referenceId: string;
  type: 'contact';
  name: string;
  schoolName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  receivedAt: string;
}

type LeadSubmission = DemoSubmission | ContactSubmission;

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(import.meta.dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');
const inMemoryLeads: LeadSubmission[] = [];

async function saveSubmission(entry: LeadSubmission): Promise<void> {
  inMemoryLeads.push(entry);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let existing: LeadSubmission[] = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
    existing.push(entry);
    await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist submission to disk (kept in memory):', err);
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.warn('Lead webhook delivery failed:', err);
    }
  }
}

function makeRef(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${timePart}${randomPart}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'nusmade-platform' });
  });

  app.post('/api/book-demo', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const schoolName = String(body.schoolName ?? '').trim();
    const fullName = String(body.fullName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const schoolType = String(body.schoolType ?? '').trim();
    const numberOfStudents = String(body.numberOfStudents ?? '').trim();
    const preferredDate = String(body.preferredDate ?? '').trim();
    const selectedPlan = String(body.selectedPlan ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!schoolName || !fullName || !email || !phone || !preferredDate) {
      res.status(400).json({ ok: false, error: 'Missing required demo booking fields.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ ok: false, error: 'Invalid email address.' });
      return;
    }

    const entry: DemoSubmission = {
      referenceId: makeRef('NUS-DEMO'),
      type: 'demo',
      schoolName,
      fullName,
      email,
      phone,
      schoolType: schoolType || 'School (Conventional)',
      numberOfStudents: numberOfStudents || '250 - 500 Students',
      preferredDate,
      selectedPlan: selectedPlan || undefined,
      message: message || undefined,
      receivedAt: new Date().toISOString(),
    };

    await saveSubmission(entry);
    res.status(201).json({
      ok: true,
      referenceId: entry.referenceId,
      receivedAt: entry.receivedAt,
    });
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const name = String(body.name ?? '').trim();
    const schoolName = String(body.schoolName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !schoolName || !email || !phone || !message) {
      res.status(400).json({ ok: false, error: 'Missing required contact fields.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ ok: false, error: 'Invalid email address.' });
      return;
    }

    const entry: ContactSubmission = {
      referenceId: makeRef('NUS-INQ'),
      type: 'contact',
      name,
      schoolName,
      email,
      phone,
      subject: subject || 'General Inquiry',
      message,
      receivedAt: new Date().toISOString(),
    };

    await saveSubmission(entry);
    res.status(201).json({
      ok: true,
      referenceId: entry.referenceId,
      receivedAt: entry.receivedAt,
    });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NUSMADE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NUSMADE server:', err);
  process.exit(1);
});
