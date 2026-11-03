
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
  googleProvider,
} from '../lib/firebase';

import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;

  signUpWithEmail: (
    email: string,
    pass: string,
    confirmPass: string,
    displayName: string
  ) => Promise<boolean>;

  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<boolean>;

  signInWithGooglePopup: () => Promise<boolean>;

  sendPasswordReset: (
    email: string
  ) => Promise<boolean>;

  logout: () => Promise<void>;

  refreshAdminClaim: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent outdated Auth callbacks from overwriting newer state.
  const authVersion = useRef(0);

  const clearError = () => {
    setError(null);
  };

  // --------------------------------------------------
  // Translate Firebase Authentication Errors
  // --------------------------------------------------

  const translateAuthError = (err: unknown): string => {
    const errorCode =
      (err as { code?: string })?.code || '';

    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.';

      case 'auth/email-already-in-use':
        return 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.';

      case 'auth/weak-password':
        return 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்.';

      case 'auth/invalid-email':
        return 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.';

      case 'auth/network-request-failed':
        return 'இணைய இணைப்பு பிழை ஏற்பட்டது. இணைப்பைச் சரிபார்க்கவும்.';

      case 'auth/popup-closed-by-user':
        return 'Google உள்நுழைவு சாளரம் மூடப்பட்டது.';

      case 'auth/too-many-requests':
        return 'பலமுறை முயற்சி செய்யப்பட்டுள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.';

      default:
        return (err as Error)?.message ||
          'அங்கீகார பிழை ஏற்பட்டது.';
    }
  };

  // --------------------------------------------------
  // Verify Admin Using Firebase Custom Claims
  // --------------------------------------------------

  const verifyAdminClaim = async (
    user: User,
    forceRefresh = false
  ): Promise<boolean> => {
    try {
      const tokenResult = await user.getIdTokenResult(forceRefresh);

      return tokenResult.claims.admin === true;
    } catch (err) {
      console.error('Admin claim verification failed:', err);
      return false;
    }
  };

  // Public method to refresh Admin claim after claim changes.
  const refreshAdminClaim = async (): Promise<boolean> => {
    const user = auth.currentUser;

    if (!user) {
      setIsAdmin(false);
      return false;
    }

    const version = authVersion.current;

    const hasAdminClaim = await verifyAdminClaim(user, true);

    if (
      authVersion.current === version &&
      auth.currentUser?.uid === user.uid
    ) {
      setIsAdmin(hasAdminClaim);
    }

    return hasAdminClaim;
  };

  // --------------------------------------------------
  // Synchronize User Profile
  // --------------------------------------------------

  const syncUserProfile = async (
    user: User,
    customDisplayName?: string
  ): Promise<UserProfile> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let profileData: UserProfile;

    if (userSnap.exists()) {
      const existing = userSnap.data() as UserProfile;

      profileData = {
        ...existing,
        id: user.uid,
        email: user.email || existing.email || '',
        displayName:
          existing.displayName ||
          customDisplayName ||
          user.displayName ||
          'மாணவர்',
        role: existing.role || 'student',
      };
    } else {
      profileData = {
        id: user.uid,
        email: user.email || '',
        displayName:
          customDisplayName ||
          user.displayName ||
          user.email?.split('@')[0] ||
          'மாணவர்',
        role: 'student',
        createdAt: new Date().toISOString(),
      };

      const { id: _profileId, ...storedProfile } = profileData;

      await setDoc(userRef, storedProfile);
    }

    return profileData;
  };

  // --------------------------------------------------
  // Authentication State Listener
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        const currentVersion = ++authVersion.current;

        setLoading(true);
        setCurrentUser(user);
        setUserProfile(null);
        setIsAdmin(false);

        if (!user) {
          if (mounted && authVersion.current === currentVersion) {
            setLoading(false);
          }

          return;
        }

        try {
          const [hasAdminClaim, profileData] = await Promise.all([
            verifyAdminClaim(user),
            syncUserProfile(user).catch((err) => {
              console.error('Profile synchronization failed:', err);

              return {
                id: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'மாணவர்',
                role: 'student',
                createdAt: new Date().toISOString(),
              } as UserProfile;
            }),
          ]);

          if (
            mounted &&
            authVersion.current === currentVersion &&
            auth.currentUser?.uid === user.uid
          ) {
            setIsAdmin(hasAdminClaim);
            setUserProfile(profileData);
          }
        } catch (err) {
          console.error('Authentication initialization failed:', err);

          if (
            mounted &&
            authVersion.current === currentVersion
          ) {
            setIsAdmin(false);
            setUserProfile(null);
          }
        } finally {
          if (
            mounted &&
            authVersion.current === currentVersion
          ) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authVersion.current++;
      unsubscribe();
    };
  }, []);

  // --------------------------------------------------
  // Sign Up With Email
  // --------------------------------------------------

  const signUpWithEmail = async (
    email: string,
    pass: string,
    confirmPass: string,
    displayName: string
  ): Promise<boolean> => {
    clearError();

    if (!email.trim() || !pass || !displayName.trim()) {
      setError('அனைத்து புலங்களையும் நிரப்பவும்.');
      return false;
    }

    if (pass !== confirmPass) {
      setError('கடவுச்சொற்கள் பொருந்தவில்லை.');
      return false;
    }

    if (pass.length < 6) {
      setError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்.');
      return false;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );

      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });

      await credential.user.getIdToken(true);

      const profileData = await syncUserProfile(
        credential.user,
        displayName.trim()
      );

      setCurrentUser(credential.user);
      setUserProfile(profileData);
      setIsAdmin(false);

      return true;
    } catch (err) {
      setError(translateAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Sign In With Email
  // --------------------------------------------------

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<boolean> => {
    clearError();

    if (!email.trim() || !pass) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.');
      return false;
    }

    try {
      setLoading(true);

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );

      const [hasAdminClaim, profileData] = await Promise.all([
        verifyAdminClaim(credential.user, true),
        syncUserProfile(credential.user),
      ]);

      setCurrentUser(credential.user);
      setUserProfile(profileData);
      setIsAdmin(hasAdminClaim);

      return true;
    } catch (err) {
      setError(translateAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Sign In With Google
  // --------------------------------------------------

  const signInWithGooglePopup = async (): Promise<boolean> => {
    clearError();

    try {
      setLoading(true);

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const [hasAdminClaim, profileData] = await Promise.all([
        verifyAdminClaim(result.user, true),
        syncUserProfile(result.user),
      ]);

      setCurrentUser(result.user);
      setUserProfile(profileData);
      setIsAdmin(hasAdminClaim);

      return true;
    } catch (err) {
      setError(translateAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Password Reset
  // --------------------------------------------------

  const sendPasswordReset = async (
    email: string
  ): Promise<boolean> => {
    clearError();

    if (!email.trim()) {
      setError('மின்னஞ்சல் முகவரியை உள்ளிடவும்.');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      setError(translateAuthError(err));
      return false;
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = async (): Promise<void> => {
    clearError();

    try {
      await signOut(auth);

      authVersion.current++;

      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (err) {
      setError(translateAuthError(err));
    }
  };

  // --------------------------------------------------
  // Provider
  // --------------------------------------------------

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
        refreshAdminClaim,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// Custom Hook
// --------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}
