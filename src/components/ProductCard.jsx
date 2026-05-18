import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

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
    addToCart(product, quantity);
    showToast(`Added ${quantity} ${product.name} to Cart!`);
    setQuantity(1); // Reset after adding
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="group magic-glow-card glow-hover rounded-3xl overflow-hidden shadow-sm relative flex flex-col h-full border border-border/50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary text-white font-semibold px-6 py-4 rounded-2xl shadow-lg animate-bounce text-sm">
          {toastMessage}
        </div>
      )}

      <Link to={`/products/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-black/5 flex items-center justify-center block">
        <img 
          src={product.image_url || `https://placehold.co/600x400/FFFFFF/BA242A?text=${product.name.split(' ')[0]}`} 
          alt={product.name}
          className="relative z-10 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Wishlist Button Overlay */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full border transition-all ${
            isWishlisted 
              ? 'bg-white text-primary border-transparent shadow-md' 
              : 'bg-white/80 backdrop-blur-md text-foreground border-transparent hover:bg-white shadow-sm'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {product.discount_price && (
          <span className="absolute top-3 left-3 z-20 bg-primary text-white text-[10px] font-medium px-3 py-1 rounded-full shadow-sm">
            Best Seller
          </span>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-[15px] text-[#333] truncate hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
        </Link>
        
        {product.admin_note && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">{product.admin_note}</p>
        )}
        
        <div className="mt-2 flex flex-col mb-4">
          <span className="text-[13px] font-bold text-primary">Rs.{Number(product.discount_price || product.price).toFixed(2)}</span>
          {product.discount_price && (
            <span className="text-[11px] text-muted-foreground line-through">Rs.{Number(product.price).toFixed(2)}</span>
          )}
        </div>
        
        <div className="mt-auto flex items-center gap-2">
          <div className="flex items-center justify-between border border-border rounded-full px-3 py-2 w-1/3 text-xs text-[#333]">
            <span 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(prev => Math.max(1, prev - 1)); }} 
              className="cursor-pointer opacity-50 hover:opacity-100 p-1"
            >
              -
            </span>
            <span>{quantity}</span>
            <span 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(prev => prev + 1); }} 
              className="cursor-pointer opacity-50 hover:opacity-100 p-1"
            >
              +
            </span>
          </div>
          <button onClick={handleAddToCart} className="flex-1 bg-[#3f3f3f] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-full transition-all active:scale-95 uppercase tracking-wide">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
