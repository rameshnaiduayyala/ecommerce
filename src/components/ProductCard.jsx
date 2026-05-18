import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

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
      showToast('Saved to Wishlist ❤️');
    }
    localStorage.setItem('sweetverse_wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    showToast(`${quantity}× ${product.name} added to cart`);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 600);
    setQuantity(1);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const displayPrice = Number(product.discount_price || product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#222] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
          {toastMessage}
        </div>
      )}

      {/* ── IMAGE AREA ── */}
      <Link to={`/products/${product.id}`} className="relative overflow-hidden bg-[#f8f4f0] aspect-[4/3] block shrink-0">
        <img
          src={product.image_url || `https://placehold.co/600x400/f8f4f0/BA242A?text=${encodeURIComponent(product.name.split(' ')[0])}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {discountPct}% OFF
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 shadow-sm ${
            isWishlisted
              ? 'bg-primary border-primary text-white scale-110'
              : 'bg-white/90 backdrop-blur-sm border-white/50 text-[#444] hover:bg-white hover:text-primary hover:scale-110'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Quick view pill (appears on hover) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-10">
          <span className="bg-white/90 backdrop-blur-md text-[#222] text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border border-white/60">
            View Details
          </span>
        </div>
      </Link>

      {/* ── CONTENT AREA ── */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Category tag */}
        {product.category && (
          <span className="text-[8px] font-black tracking-[0.3em] uppercase text-muted-foreground/70">
            {product.category}
          </span>
        )}

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-serif font-black text-[15px] text-[#222] leading-snug hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Admin note / short desc */}
        {product.admin_note && (
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 font-medium -mt-1">
            {product.admin_note}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-black text-primary font-serif">
            ₹{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-muted-foreground line-through font-medium">
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart row */}
        <div className="flex items-center gap-2 mt-1">
          {/* Qty stepper */}
          <div className="flex items-center border border-border rounded-full overflow-hidden bg-[#f8f8f8] shrink-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(prev => Math.max(1, prev - 1)); }}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all text-sm font-bold"
            >
              −
            </button>
            <span className="text-xs font-black text-[#222] min-w-[20px] text-center select-none">{quantity}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(prev => prev + 1); }}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all text-sm font-bold"
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 text-white text-[10px] font-black py-2.5 rounded-full transition-all duration-200 uppercase tracking-widest shadow-sm active:scale-95 ${
              addedAnim ? 'bg-emerald-500 scale-95' : 'bg-primary hover:bg-black'
            }`}
          >
            {addedAnim ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Bottom accent bar on hover */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-500 rounded-full" />
    </div>
  );
};

export default ProductCard;
