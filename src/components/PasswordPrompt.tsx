import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Theme } from '../config/theme';

interface PasswordPromptProps {
  onAuthenticated: () => void;
  theme: Theme;
}

export const PasswordPrompt = ({ onAuthenticated, theme }: PasswordPromptProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setLoading(true);

    try {
      // The server answers with an HttpOnly session cookie; nothing is stored client-side.
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({} as { error?: string }));

      if (response.ok) {
        toast.success('Access granted');
        onAuthenticated();
      } else {
        toast.error(response.status === 401 ? 'Incorrect password' : data.error || `Sign-in failed (HTTP ${response.status})`);
        setPassword('');
      }
    } catch {
      toast.error('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.bg} transition-colors duration-200`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${theme.cardBg} border ${theme.border}`}>
            <Lock size={32} className={theme.accent} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>
            ITROPA
          </h1>
          <p className={theme.muted}>
            Enter password to access
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`rounded-lg p-6 space-y-4 ${theme.card}`}>
            <label htmlFor="itropa-password" className="sr-only">Password</label>
            <input
              id="itropa-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all ${theme.inputBg} ${theme.text}`}
              autoFocus
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access App'
              )}
            </button>
          </div>
        </form>

        <p className={`text-center mt-6 text-sm ${theme.muted}`}>
          Industry Tree Research & Opportunity Prediction Analysis
        </p>
      </motion.div>
    </div>
  );
};
