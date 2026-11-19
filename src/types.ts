export interface DemoRequest {
  fullName: string;
  schoolName: string;
  role: string;
  email: string;
  phone: string;
  schoolType: 'conventional' | 'madrasah' | 'combined' | 'other';
  studentCount: string;
  preferredDate?: string;
  notes?: string;
}

export interface SolutionItem {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  features: string[];
  iconName: string;
  accent: 'purple' | 'pink';
}

export interface FeatureItem {
  id: string;
  title: string;
  category: 'admin' | 'academic' | 'finance' | 'communication' | 'elearning';
  description: string;
  iconName: string;
  highlight: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
  detail: string;
  iconName: string;
}
