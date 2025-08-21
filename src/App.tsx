import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TemplateShowcasePage from './components/TemplateShowcasePage';
import HRPortal from './components/HRPortal';
import AuthPage from './components/AuthPage';
import DocumentsPage from './components/DocumentsPage';
import EmployeeDirectory from './components/EmployeeDirectory';
import LeaveManagementPage from './components/LeaveManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import TitleManager from './components/TitleManager';
import OrganizationSettingsPage from './components/OrganizationSettingsPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <TitleManager />
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <EmployeeDirectory />
              </ProtectedRoute>
            } />
            <Route path="/leave" element={
              <ProtectedRoute>
                <LeaveManagementPage />
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
            <Route path="/organization-settings" element={
              <ProtectedRoute>
                <OrganizationSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
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
