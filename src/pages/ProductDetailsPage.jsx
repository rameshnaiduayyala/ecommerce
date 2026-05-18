import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedAnim, setAddedAnim] = useState(false);

  useDocumentTitle(product ? product.name : 'Loading...');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch current product
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Check if item is in wishlist (compatible with ProductCard storage)
        const savedWishlist = JSON.parse(localStorage.getItem('sweetverse_wishlist')) || [];
        setIsWishlisted(savedWishlist.some(item => item.id === data.id));

        // 2. Fetch related products (same category if exists, otherwise other products)
        const query = supabase.from('products').select('*').neq('id', id).limit(4);
        if (data.category_id) {
          query.eq('category_id', data.category_id);
        }
        const { data: relatedData } = await query;
        setRelatedProducts(relatedData || []);
        
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleWishlistToggle = () => {
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart(product, quantity);
    showToast(`${quantity}× ${product.name} added to cart`);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 600);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-28 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground mt-4 font-serif font-black tracking-widest uppercase text-xs">Preparing sweet details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-serif font-black text-[#222] mb-4">Delicacy Not Found</h2>
        <p className="text-muted-foreground mb-8">The requested item is currently unavailable in our kitchen.</p>
        <Link to="/products" className="bg-primary hover:bg-black text-white font-black px-8 py-4 rounded-full transition-all uppercase tracking-widest text-xs">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#222] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
          {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 mb-8 uppercase tracking-[0.2em] font-bold">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Sweets</Link>
        <span>/</span>
        <span className="text-[#222] truncate">{product.name}</span>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        
        {/* Left Side: Premium Image Frame */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-[#faf6f0] to-[#f4ebe1] rounded-[32px] p-8 md:p-12 border border-border/40 flex items-center justify-center aspect-square overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
          {/* Inner luxury circles */}
          <div className="absolute w-[80%] h-[80%] rounded-full border border-white/40 pointer-events-none" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-white/60 pointer-events-none" />
          
          <img 
            src={product.image_url || `https://placehold.co/600x600/f4ebe1/BA242A?text=${encodeURIComponent(product.name)}`} 
            alt={product.name} 
            className="relative z-10 max-h-[90%] max-w-[90%] object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>

        {/* Right Side: Editorial Info Panel */}
        <div className="lg:col-span-6 flex flex-col gap-6 justify-center lg:py-4">
          
          {/* Brand/Eyebrow Tags */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-primary/8 text-primary px-3 py-1 rounded-full uppercase font-black tracking-widest border border-primary/15">
              Traditional Ghee Delight
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-[#222] leading-tight mb-3">
              {product.name}
            </h1>
            
            {/* Price section */}
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-3xl font-serif font-black text-primary">
                ₹{Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Trust Highlights Row */}
          <div className="grid grid-cols-3 gap-2.5 my-2">
            <div className="bg-[#fcfaf7] border border-border/40 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2sm">
              <span className="text-xl mb-1">🌾</span>
              <p className="text-[9px] font-black text-[#222] uppercase tracking-wider">Pure Cattle Ghee</p>
            </div>
            <div className="bg-[#fcfaf7] border border-border/40 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2sm">
              <span className="text-xl mb-1">🏺</span>
              <p className="text-[9px] font-black text-[#222] uppercase tracking-wider">Generational Recipe</p>
            </div>
            <div className="bg-[#fcfaf7] border border-border/40 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2sm">
              <span className="text-xl mb-1">🔒</span>
              <p className="text-[9px] font-black text-[#222] uppercase tracking-wider">Vacuum Sealed</p>
            </div>
          </div>

          {/* Admin Kitchen Note */}
          {product.admin_note && (
            <div className="border border-[#eaddcf] bg-[#fdfaf5] rounded-2xl p-5 flex gap-4 items-start shadow-2sm">
              <span className="text-2xl mt-0.5 shrink-0 select-none">🏺</span>
              <div>
                <h4 className="text-[9px] uppercase tracking-widest font-black text-primary mb-1">A Note from Our Sweet Makers</h4>
                <p className="text-xs text-[#555] italic leading-relaxed font-serif font-semibold">{product.admin_note}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="border-t border-border/50 pt-5">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/80 mb-3">Authentic Heritage Details</h4>
            <p className="text-[#444] leading-relaxed text-sm font-medium">
              {product.description || 'Crafted with absolute dedication using 100% pure milk ghee, native Godavari ingredients, and traditional preparation techniques perfected over seven decades. Delivered in our specialized premium vacuum-sealing packs to lock in aroma and rich freshness.'}
            </p>
          </div>

          {/* Purchasing Stepper & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-border/50 pt-6 mt-2">
            
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between border border-border rounded-full px-4 py-3 gap-6 bg-[#f8f8f8] sm:w-fit shrink-0">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="text-muted-foreground hover:text-primary font-bold text-base w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="font-serif font-black text-sm text-[#222] min-w-[20px] text-center select-none">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="text-muted-foreground hover:text-primary font-bold text-base w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-all"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button 
              onClick={handleAddToCartClick}
              className={`flex-1 text-white font-black py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] shadow-md hover:-translate-y-0.5 active:scale-98 ${
                addedAnim ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-black'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {addedAnim ? '✓ Added successfully' : 'Add to Box'}
            </button>

            {/* Wishlist Button */}
            <button 
              onClick={handleWishlistToggle}
              className={`p-4 rounded-full border transition-all flex items-center justify-center shadow-2sm hover:scale-105 active:scale-95 ${
                isWishlisted 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white hover:bg-primary/5 border-border/80 text-muted-foreground hover:text-primary'
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border/50 pt-16 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10 bg-primary"></div>
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-primary">Godavari Delicacies</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-[#222] mb-10 tracking-tight">You May Also Relish</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
