import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PasswordPromptProps {
  onAuthenticated: () => void;
  theme: any;
  dark: boolean;
}

export const PasswordPrompt = ({ onAuthenticated, theme, dark }: PasswordPromptProps) => {
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
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token in localStorage
        localStorage.setItem('authenticated', 'true');
        toast.success('Access granted!');
        onAuthenticated();
      } else {
        console.error('Auth failed:', response.status, data);
        toast.error(data.error || 'Invalid password');
        setPassword('');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme.inputBg} ${theme.text}`}
              autoFocus
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
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
