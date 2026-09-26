/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ScholarshipAdvisor } from './components/ScholarshipAdvisor';
import { AuthModal } from './components/AuthModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HelpSection } from './components/HelpSection';
import { FloatingChatWidget } from './components/FloatingChatWidget';

const MainLayout: React.FC = () => {
  const { activeView, selectedReceipt, setSelectedReceipt } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'student-dashboard' && <StudentDashboard />}
        {activeView === 'admin-dashboard' && <AdminDashboard />}
        {activeView === 'advisor' && <ScholarshipAdvisor />}
        {activeView === 'help' && <HelpSection />}
        {activeView === 'auth' && <AuthModal />}
      </main>

      {/* Global Floating AI Bursar Chatbot Widget */}
      <FloatingChatWidget />

      {/* Global Digital E-Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
