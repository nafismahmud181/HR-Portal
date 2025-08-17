import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DocumentSelectionPage from './components/DocumentSelectionPage';
import TemplateShowcasePage from './components/TemplateShowcasePage';
import HRPortal from './components/HRPortal';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/documents" element={<DocumentSelectionPage />} />
          <Route path="/templates" element={<TemplateShowcasePage />} />
          <Route path="/portal" element={<HRPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
