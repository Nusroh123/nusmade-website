/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { BookDemoPage } from './pages/BookDemoPage';
import { AdminPage } from './pages/AdminPage';
import { LiveDemoPage } from './pages/LiveDemoPage';
import { SchoolPortalPage } from './pages/SchoolPortalPage';
import { SchoolAdminPage } from './pages/SchoolAdminPage';
import { TeacherPortalPage } from './pages/TeacherPortalPage';
import { FirebaseProvider } from './context/FirebaseAuthContext';

export default function App() {
  return (
    <Theme accentColor="violet" grayColor="slate" radius="large">
      <FirebaseProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-[#6D28D9]/20 selection:text-[#6D28D9]">
            {/* Persistent Navigation Bar across all pages */}
            <Navbar />

            {/* Main Routed Page Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/solutions" element={<SolutionsPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/live-demo" element={<LiveDemoPage />} />
                <Route path="/school" element={<SchoolPortalPage />} />
                <Route path="/school/admin" element={<SchoolAdminPage />} />
                <Route path="/school/teacher" element={<TeacherPortalPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/book-demo" element={<BookDemoPage />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* Fallback to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Persistent Footer across all pages */}
            <Footer />
          </div>
        </BrowserRouter>
      </FirebaseProvider>
    </Theme>
  );
}
