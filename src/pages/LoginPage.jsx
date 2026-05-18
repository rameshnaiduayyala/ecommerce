import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const data = await signUp(email, password, { full_name: name });
        if (data?.user && !data?.session) {
          setSuccess('Account created! Please check your email for a confirmation link.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white shadow-lg border border-border/50 p-1.5 mb-4">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-muted-foreground">Aha Konaseema</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[28px] border border-border/50 shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-border/40">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'text-primary border-b-2 border-primary bg-primary/3' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'text-primary border-b-2 border-primary bg-primary/3' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create Account
            </button>
          </div>

          <div className="p-7 sm:p-8">
            <h1 className="text-2xl font-serif font-black text-[#222] mb-1">
              {isLogin ? 'Welcome back' : 'Join us today'}
            </h1>
            <p className="text-xs text-muted-foreground font-medium mb-6">
              {isLogin ? 'Sign in to access your orders and wishlist.' : 'Create your account to start ordering premium sweets.'}
            </p>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex gap-2 items-start">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex gap-2 items-start">
                <span>✅</span><span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-[#fafafa] placeholder:text-muted-foreground/50"
                    required
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-[#fafafa] placeholder:text-muted-foreground/50"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-[#fafafa] placeholder:text-muted-foreground/50"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-primary hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </span>
                ) : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-muted-foreground/60 font-medium mt-6 tracking-wide">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
