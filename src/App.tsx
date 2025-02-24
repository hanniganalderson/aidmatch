// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { Questionnaire } from './components/Questionnaire';
import { Results } from './components/Results';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { About } from './components/About';
import { AuthProvider } from './contexts/AuthContext';
import type { UserAnswers } from './types';

function App() {
  // Initialize with default values for all required fields
  const [answers, setAnswers] = useState<UserAnswers>({
    education_level: '',
    school: '',
    major: '',
    gpa: '',
    is_pell_eligible: '',
    location: ''
  });
  
  function AppRoutes() {
    const navigate = useNavigate();
    
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/questionnaire" element={
          <Questionnaire 
            onSubmit={setAnswers} 
            initialValues={answers} 
          />
        } />
        <Route path="/results" element={
          <Results 
            answers={answers} 
            navigate={navigate} 
          />
        } />
      </Routes>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#1B1B1B] text-gray-100">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-screen w-64 bg-[#2B2B2B] border-r border-[#3B3B3B]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
                <img src="/logo.svg" alt="AidMatch" className="w-8 h-8" />
                <div>
                  <h1 className="text-lg font-medium">AidMatch</h1>
                  <p className="text-xs text-gray-400">Financial Aid Simplified</p>
                </div>
              </div>
              <Navigation />
            </div>
          </div>

          {/* Main Content */}
          <div className="ml-64 min-h-screen">
            <AppRoutes />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;