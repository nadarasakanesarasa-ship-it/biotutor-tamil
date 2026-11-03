
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getIdTokenResult } from 'firebase/auth';
import { auth, functions } from "../lib/firebase";

interface SetupResponse {
  success: boolean;
  message: string;
}

export default function SuperAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage('Please login first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const setupAdmin = httpsCallable<
        Record<string, never>,
        SetupResponse
      >(functions, 'setupSuperAdmin');

      const result = await setupAdmin({});

      // Refresh token to obtain the new custom claim.
      const tokenResult = await getIdTokenResult(user, true);

      if (tokenResult.claims.admin === true) {
        setMessage('Super Admin configured successfully!');
      } else {
        setMessage(
          result.data.message +
          ' Please sign out and sign in again.'
        );
      }
    } catch (error) {
      console.error('Super Admin setup error:', error);

      setMessage(
        error instanceof Error
          ? error.message
          : 'Super Admin setup failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">
        Super Admin Setup
      </h2>

      <p className="text-sm mb-4">
        Temporary setup for the authorized account only.
      </p>

      <button
        onClick={handleSetup}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Setting up...' : 'Configure Super Admin'}
      </button>

      {message && (
        <p className="mt-4 text-sm break-words">
          {message}
        </p>
      )}
    </div>
  );
}
