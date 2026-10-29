import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, BOOTSTRAP_ADMIN_EMAIL, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signUpWithEmail: (email: string, pass: string, confirmPass: string, displayName: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signInWithGooglePopup: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Translate Firebase error codes into clear, helpful Tamil messages
  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது (Invalid email or password).';
      case 'auth/email-already-in-use':
        return 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (Email already registered).';
      case 'auth/weak-password':
        return 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும் (Password should be at least 6 characters).';
      case 'auth/invalid-email':
        return 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் (Please enter a valid email).';
      case 'auth/network-request-failed':
        return 'இணைய இணைப்பு பிழை ஏற்பட்டது. தயவுசெய்து உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும் (Network error).';
      case 'auth/popup-closed-by-user':
        return 'Google உள்நுழைவு சாளரம் மூடப்பட்டது (Google Sign-In was cancelled).';
      default:
        return err?.message || 'அங்கீகார பிழை ஏற்பட்டது (Authentication error).';
    }
  };

  // Sync or create user profile in Firestore
  const syncUserProfile = async (user: User, customDisplayName?: string) => {
    try {
      const isBootstrapAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      let profileData: UserProfile;

      if (userSnap.exists()) {
        const existing = userSnap.data() as UserProfile;
        profileData = {
          ...existing,
          role: isBootstrapAdmin ? 'admin' : existing.role || 'student',
        };
        // Update if admin status changed
        if (isBootstrapAdmin && existing.role !== 'admin') {
          await setDoc(userRef, { ...existing, role: 'admin' }, { merge: true });
        }
      } else {
        profileData = {
          id: user.uid,
          email: user.email || '',
          displayName: customDisplayName || user.displayName || user.email?.split('@')[0] || 'மாணவர்',
          role: isBootstrapAdmin ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, profileData);
      }

      // If bootstrap admin, ensure admins marker doc exists
      if (isBootstrapAdmin) {
        try {
          const adminRef = doc(db, 'admins', user.uid);
          await setDoc(adminRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('Admin marker write notice:', err);
        }
      }

      setUserProfile(profileData);
      setIsAdmin(isBootstrapAdmin || profileData.role === 'admin');
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback in memory
      const fallbackRole = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';
      setUserProfile({
        id: user.uid,
        email: user.email || '',
        displayName: customDisplayName || user.displayName || 'மாணவர்',
        role: fallbackRole,
        createdAt: new Date().toISOString(),
      });
      setIsAdmin(fallbackRole === 'admin');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, pass: string, confirmPass: string, displayName: string): Promise<boolean> => {
    clearError();
    if (!email || !pass || !displayName) {
      setError('அனைத்து புலங்களையும் நிரப்பவும் (Please fill all fields).');
      return false;
    }
    if (pass !== confirmPass) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match).');
      return false;
    }
    if (pass.length < 6) {
      setError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும் (Password must be at least 6 characters).');
      return false;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(userCredential.user, { displayName: displayName.trim() });
      await syncUserProfile(userCredential.user, displayName.trim());
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(translateAuthError(err));
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    clearError();
    if (!email || !pass) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.');
      return false;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(userCredential.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(translateAuthError(err));
      return false;
    }
  };

  const signInWithGooglePopup = async (): Promise<boolean> => {
    clearError();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(translateAuthError(err));
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    clearError();
    if (!email) {
      setError('மின்னஞ்சல் முகவரியை உள்ளிடவும்.');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err: any) {
      setError(translateAuthError(err));
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (err: any) {
      setError(translateAuthError(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        error,
        clearError,
        signUpWithEmail,
        signInWithEmail,
        signInWithGooglePopup,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
