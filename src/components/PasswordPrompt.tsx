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

      if (response.ok) {
        // Store auth token in localStorage
        localStorage.setItem('authenticated', 'true');
        toast.success('Access granted!');
        onAuthenticated();
      } else {
        toast.error('Invalid password');
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
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: dark ? theme.colors.dark.bg : theme.colors.light.bg }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ background: dark ? theme.colors.dark.cardBg : theme.colors.light.cardBg }}>
            <Lock size={32} style={{ color: theme.colors.primary }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" 
              style={{ color: dark ? theme.colors.dark.text : theme.colors.light.text }}>
            ITROPA
          </h1>
          <p style={{ color: dark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>
            Enter password to access
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-lg p-6 space-y-4"
               style={{ background: dark ? theme.colors.dark.cardBg : theme.colors.light.cardBg }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                background: dark ? theme.colors.dark.bg : theme.colors.light.bg,
                color: dark ? theme.colors.dark.text : theme.colors.light.text,
                borderColor: dark ? theme.colors.dark.border : theme.colors.light.border,
              }}
              autoFocus
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: theme.colors.primary,
                color: '#fff',
              }}
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

        <p className="text-center mt-6 text-sm"
           style={{ color: dark ? theme.colors.dark.textSecondary : theme.colors.light.textSecondary }}>
          Industry Tree Research & Opportunity Prediction Analysis
        </p>
      </motion.div>
    </div>
  );
};
