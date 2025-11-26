import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        console.log('Current URL:', window.location.href);

        // Check for error parameters in URL
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          console.error('❌ OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for session - Supabase should have automatically exchanged the code
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setStatus('error');
          setMessage(`Authentication failed: ${sessionError.message}`);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (session?.user) {
          console.log('✅ Authentication successful!');
          console.log('User ID:', session.user.id);
          console.log('Email:', session.user.email);

          setStatus('success');
          setMessage('Authentication successful! Redirecting to your profile...');

          // The App.tsx auth listener will handle updating the auth store
          // Redirect to profile page after successful authentication
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          console.warn('⚠️ No session found after callback');
          console.log('Retrying session check...');

          // Try one more time after a longer delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (retrySession?.user) {
            console.log('✅ Session found on retry!');
            setStatus('success');
            setMessage('Authentication successful! Redirecting to your profile...');
            setTimeout(() => navigate('/profile'), 1000);
          } else {
            console.error('❌ Still no session after retry');
            setStatus('error');
            setMessage('No authentication session found. Please try again.');
            setTimeout(() => navigate('/auth'), 3000);
          }
        }
      } catch (err: any) {
        console.error('❌ Unexpected error in auth callback:', err);
        setStatus('error');
        setMessage(`Unexpected error: ${err.message}`);
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authenticating...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
