import React, { useState } from 'react';
import { auth, firestore } from '../firebase/config';
import { documentService } from '../services/documentService';

const FirebaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testFirebaseConnection = async () => {
    setIsTesting(true);
    setDebugInfo([]);
    
    try {
      addDebugInfo('Starting Firebase connection test...');
      
      // Test auth
      addDebugInfo(`Auth object: ${auth ? 'Present' : 'Missing'}`);
      if (auth) {
        addDebugInfo(`Auth currentUser: ${auth.currentUser ? auth.currentUser.email : 'None'}`);
      }
      
      // Test firestore
      addDebugInfo(`Firestore object: ${firestore ? 'Present' : 'Missing'}`);
      if (firestore) {
        addDebugInfo(`Firestore keys: ${Object.keys(firestore).join(', ')}`);
      }
      
      // Test document service
      addDebugInfo('Testing DocumentService...');
      const isConnected = await documentService.testConnection();
      addDebugInfo(`DocumentService connection: ${isConnected ? 'Success' : 'Failed'}`);
      
      // Test environment variables
      addDebugInfo('Environment variables:');
      addDebugInfo(`VITE_FIREBASE_API_KEY: ${import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Not set'}`);
      addDebugInfo(`VITE_FIREBASE_PROJECT_ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Not set'}`);
      
    } catch (error) {
      addDebugInfo(`Error during test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Firebase Debug Information</h3>
      
      <button
        onClick={testFirebaseConnection}
        disabled={isTesting}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isTesting ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      <div className="bg-white p-4 rounded border">
        <h4 className="font-medium mb-2">Debug Log:</h4>
        <div className="max-h-64 overflow-y-auto">
          {debugInfo.map((info, index) => (
            <div key={index} className="text-sm font-mono text-gray-700 mb-1">
              {info}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebug;
