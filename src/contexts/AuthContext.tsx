import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type Auth
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Type assertion to ensure auth is properly typed
const typedAuth = auth as Auth;

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(typedAuth, email, password);
    
    // Update the user profile with the display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
    }
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(typedAuth, email, password);
  }

  async function logout() {
    await signOut(typedAuth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(typedAuth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(typedAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}