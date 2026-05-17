import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('sweetverse_wishlist')) || [];
    setIsWishlisted(savedWishlist.some(item => item.id === product.id));
  }, [product.id]);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const savedWishlist = JSON.parse(localStorage.getItem('sweetverse_wishlist')) || [];
    let updated = [];
    
    if (isWishlisted) {
      updated = savedWishlist.filter(item => item.id !== product.id);
      setIsWishlisted(false);
      showToast('Removed from Wishlist');
    } else {
      updated = [...savedWishlist, product];
      setIsWishlisted(true);
      showToast('Added to Wishlist!');
    }
    localStorage.setItem('sweetverse_wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`Added ${product.name} to Cart!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="group glassmorphism rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary border border-primary/30 text-white font-semibold px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-bounce text-sm">
          ✨ {toastMessage}
        </div>
      )}

      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-white/5 p-4 flex items-center justify-center block">
        {/* Placeholder for actual image */}
        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-tr from-primary/40 to-accent/40 blur-xl absolute opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img 
          src={product.image_url || `https://placehold.co/400x400/1E1E1E/8B5CF6?text=${product.name.split(' ')[0]}`} 
          alt={product.name}
          className="relative z-10 w-full h-full object-cover rounded-xl shadow-lg drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Wishlist Button Overlay */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-4 left-4 z-20 p-2 rounded-full border transition-all ${
            isWishlisted 
              ? 'bg-destructive text-white border-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:scale-110' 
              : 'bg-black/40 backdrop-blur-md text-white border-white/10 hover:border-white/30 hover:scale-110'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {product.discount_price && (
          <span className="absolute top-4 right-4 z-20 bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full">
            SALE
          </span>
        )}
        {product.admin_note && (
          <span className="absolute bottom-4 left-4 z-20 bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
            {product.admin_note}
          </span>
        )}
      </Link>
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg text-foreground truncate mr-2 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
          </Link>
          <span className="flex items-center text-accent text-sm">
            ★ {product.rating || '4.5'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || 'Premium luxury dessert crafted with the finest ingredients.'}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground font-mono">₹{product.discount_price || product.price}</span>
            {product.discount_price && (
              <span className="text-sm text-muted-foreground line-through font-mono">₹{product.price}</span>
            )}
          </div>
          <button onClick={handleAddToCart} className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full hover:neon-glow transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
