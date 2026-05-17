import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        // Navigation is handled by useEffect above
      } else {
        const data = await signUp(email, password);
        if (data?.user && !data?.session) {
          setError('Success! Please check your email for a confirmation link.');
        }
        // If session exists, useEffect will handle navigation
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glassmorphism w-full max-w-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px]"></div>
        
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all hover:neon-glow disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
