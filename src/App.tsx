import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TemplateShowcasePage from './components/TemplateShowcasePage';
import HRPortal from './components/HRPortal';
import AuthPage from './components/AuthPage';
import DocumentsPage from './components/DocumentsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <TemplateShowcasePage />
              </ProtectedRoute>
            } />
            <Route path="/portal" element={
              <ProtectedRoute>
                <HRPortal />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
