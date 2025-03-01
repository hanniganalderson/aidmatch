import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { Questionnaire } from './components/Questionnaire';
import { Results } from './components/Results';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { About } from './components/About';
import { Settings } from './components/Settings';
import { SavedScholarships } from './components/SavedScholarships';
import { InputScholarship } from './components/InputScholarship';
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
  
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/saved-scholarships" element={<SavedScholarships />} />
            <Route path="/input-scholarships" element={<InputScholarship />} />
            <Route path="/questionnaire" element={
              <Questionnaire 
                onSubmit={setAnswers} 
                initialValues={answers} 
              />
            } />
            <Route path="/results" element={
              <Results 
                answers={answers} 
                navigate={(path) => window.location.href = path} 
              />
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;