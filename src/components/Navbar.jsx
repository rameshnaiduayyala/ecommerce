import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import FlashAnnouncement from './FlashAnnouncement';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
            <button className="lg:hidden hover:text-primary transition-colors ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

        </div>
      </header>
    </>
  );
};

export default Navbar;
