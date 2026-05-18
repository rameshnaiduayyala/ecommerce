import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import FlashAnnouncement from './FlashAnnouncement';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <FlashAnnouncement />

      <header className={`sticky top-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled 
          ? 'bg-white/80 border-b border-border/60 shadow-sm' 
          : 'bg-white/95 border-b border-border/30'
      }`}>
        <div className="container mx-auto px-4 md:px-6 h-[88px] flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 hover:opacity-95 transition-all">
            <div className="bg-primary text-white rounded-full px-6 py-2 flex flex-col items-center justify-center border-2 border-white shadow-[0_0_0_2px_theme(colors.primary)]">
              <span className="text-[8px] tracking-widest font-serif italic">Since 1948</span>
              <span className="text-sm font-black font-serif tracking-tight uppercase">Aha Konaseema</span>
              <span className="text-[6px] tracking-[0.2em] uppercase">A Sweet Tradition</span>
            </div>
          </Link>
 
          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#333]">
            <Link to="/products" className={`hover:text-primary transition-colors flex items-center gap-1 ${isActive('/products') ? 'text-primary' : ''}`}>
              Sweets
            </Link>
            <Link to="/categories" className={`hover:text-primary transition-colors flex items-center gap-1 ${isActive('/categories') ? 'text-primary' : ''}`}>
              Snacks & More
            </Link>
            
            {/* Account Dropdown */}
            <div className="relative group">
              <span className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                My Account & More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-50"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              </span>
              <div className="absolute top-full right-0 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="magic-glow-card glow-hover border border-border shadow-lg rounded-xl p-3 flex flex-col gap-2 min-w-[180px]">
                  {user ? (
                    <>
                      <Link to="/profile" className="text-sm hover:text-primary font-medium px-3 py-2 rounded-md hover:bg-black/5">My Profile</Link>
                      <Link to="/orders" className="text-sm hover:text-primary font-medium px-3 py-2 rounded-md hover:bg-black/5">My Orders</Link>
                      {isAdmin && (
                        <Link to="/admin" className="text-sm hover:text-primary font-medium px-3 py-2 rounded-md hover:bg-black/5">Admin Panel</Link>
                      )}
                      <button onClick={signOut} className="text-sm text-left text-destructive hover:bg-destructive/10 font-medium px-3 py-2 rounded-md">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" className="text-sm hover:text-primary font-medium px-3 py-2 rounded-md hover:bg-black/5">Login / Register</Link>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-5 text-[#333]">
            <Link to="/search" className="hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </Link>
            <Link to={user ? "/profile" : "/login"} className="hover:text-primary transition-colors hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
            <Link to="/cart" className="hover:text-primary transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden hover:text-primary transition-colors ml-2 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop overlay */}
        <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"></div>
        
        {/* Drawer container */}
        <div className={`absolute top-0 right-0 w-[80%] max-w-[320px] h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-border/50 flex flex-col p-6 transition-transform duration-500 transform ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-border/50 mb-6">
            <span className="text-sm font-black font-serif uppercase tracking-tight text-primary">Navigation</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-[#333] hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-col gap-4 text-md font-bold text-[#333] flex-1">
            <Link onClick={() => setMobileMenuOpen(false)} to="/products" className={`hover:text-primary py-2 border-b border-border/30 transition-all ${isActive('/products') ? 'text-primary pl-1' : ''}`}>
              Sweets
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/categories" className={`hover:text-primary py-2 border-b border-border/30 transition-all ${isActive('/categories') ? 'text-primary pl-1' : ''}`}>
              Snacks & More
            </Link>
            
            {user ? (
              <>
                <Link onClick={() => setMobileMenuOpen(false)} to="/profile" className={`hover:text-primary py-2 border-b border-border/30 transition-all ${isActive('/profile') ? 'text-primary pl-1' : ''}`}>
                  My Profile
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} to="/orders" className={`hover:text-primary py-2 border-b border-border/30 transition-all ${isActive('/orders') ? 'text-primary pl-1' : ''}`}>
                  My Orders
                </Link>
                {isAdmin && (
                  <Link onClick={() => setMobileMenuOpen(false)} to="/admin" className={`hover:text-primary py-2 border-b border-border/30 transition-all ${isActive('/admin') ? 'text-primary pl-1' : ''}`}>
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => { signOut(); setMobileMenuOpen(false); }} 
                  className="text-left text-destructive py-2 hover:bg-destructive/5 px-2 rounded-xl mt-4 font-bold border border-destructive/20 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link onClick={() => setMobileMenuOpen(false)} to="/login" className="bg-primary hover:bg-black text-white text-center py-3 rounded-full mt-4 font-bold transition-all shadow-md">
                Login / Register
              </Link>
            )}
          </nav>
          
          {/* Footer info inside mobile menu */}
          <div className="pt-6 border-t border-border/50 text-[10px] text-center text-muted-foreground font-medium">
            <span>© 2026 Aha Konaseema. Since 1948.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
