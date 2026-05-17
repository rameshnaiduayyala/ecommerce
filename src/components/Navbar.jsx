import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import FlashAnnouncement from './FlashAnnouncement';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glassmorphism border-b border-white/10' : 'bg-transparent'}`}>
      <FlashAnnouncement />
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-500 neon-glow">
          SweetVerse
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
          <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
          <Link to="/cart" className="text-sm font-medium hover:text-primary transition-colors relative">
            Cart
            {cartCount > 0 && <span className="absolute -top-2 -right-3 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
          </Link>
          {user ? (
            <div className="flex gap-4 items-center">
              <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors">My Orders</Link>
              {isAdmin && <Link to="/admin" className="text-sm font-medium text-accent hover:text-primary transition-colors">Admin Dashboard</Link>}
              <button onClick={signOut} className="text-sm font-medium bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 px-4 py-2 rounded-full transition-all text-destructive-foreground">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium bg-primary/20 hover:bg-primary/30 border border-primary/50 px-4 py-2 rounded-full transition-all hover:neon-glow">
              Login
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
