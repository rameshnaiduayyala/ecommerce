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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'glassmorphism border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-lg bg-background/80' 
        : 'bg-transparent'
    }`}>
      <FlashAnnouncement />
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-all group">
          <img 
            src={logoImg} 
            alt="Aha Konaseema Logo" 
            className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform" 
          />
          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 font-sans group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all">
            Aha Konaseema
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link 
            to="/products" 
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors relative py-1 group ${
              isActive('/products') ? 'text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Products</span>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
              isActive('/products') ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </Link>

          <Link 
            to="/categories" 
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors relative py-1 group ${
              isActive('/categories') ? 'text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V8.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
            <span>Categories</span>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
              isActive('/categories') ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </Link>

          <Link 
            to="/cart" 
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors relative py-1 group ${
              isActive('/cart') ? 'text-white' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
              isActive('/cart') ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </Link>

          {user ? (
            <div className="flex gap-6 items-center">
              <Link 
                to="/orders" 
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors relative py-1 group ${
                  isActive('/orders') ? 'text-white' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                <span>My Orders</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
                  isActive('/orders') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-all relative py-1 group ${
                    isActive('/admin') ? 'text-white' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>Admin Panel</span>
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${
                    isActive('/admin') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              )}

              <button 
                onClick={signOut} 
                className="flex items-center gap-1.5 text-xs font-bold bg-destructive/10 hover:bg-destructive text-destructive-foreground hover:text-white border border-destructive/30 hover:border-destructive px-4 py-2 rounded-full transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-2.5 rounded-full transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
              <span>Login</span>
            </Link>
          )}
        </nav>
        <button className="md:hidden text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
