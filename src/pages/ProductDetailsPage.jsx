import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useCart } from '../context/CartContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

        // Check if item is in wishlist
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
        console.error("Error loading product:", err);
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
      showToast('Added to Wishlist!');
    }
    localStorage.setItem('sweetverse_wishlist', JSON.stringify(updated));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart(product, quantity);
    showToast(`Added ${quantity} ${product.name} to Cart!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground mt-4 font-semibold">Materializing sweet data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Confection Not Found</h2>
        <p className="text-muted-foreground mb-8">The requested item has drifted out of this orbit.</p>
        <Link to="/products" className="bg-primary text-foreground font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-all">
          Back to Menu
        </Link>
      </div>
    );
  }

  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary border border-primary/30 text-foreground font-semibold px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-bounce text-sm">
          ✨ {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 uppercase tracking-wider font-semibold">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Confections</Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        {/* Left Side: Dynamic Image Box */}
        <div className="relative glassmorphism rounded-3xl p-8 border border-white/5 flex items-center justify-center aspect-square overflow-hidden group">
          <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl absolute opacity-60 group-hover:opacity-90 transition-opacity duration-700"></div>
          <img 
            src={product.image_url || `https://placehold.co/600x600/1E1E1E/8B5CF6?text=${product.name}`} 
            alt={product.name} 
            className="relative z-10 max-h-[85%] max-w-[85%] object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"
          />
          {product.discount_price && (
            <span className="absolute top-6 right-6 z-20 bg-destructive text-foreground text-xs font-black px-3 py-1.5 rounded-full tracking-wide shadow-lg">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right Side: Details & Purchasing Controls */}
        <div className="flex flex-col gap-6 justify-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full uppercase font-mono font-bold tracking-wider border border-primary/20">
                Quantum Chef Pick
              </span>
              <span className="text-accent text-sm font-semibold flex items-center">
                ★ {product.rating || '4.8'}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-3xl font-black text-foreground font-mono">
                ₹{Number(product.discount_price || product.price).toFixed(2)}
              </span>
              {product.discount_price && (
                <span className="text-lg text-muted-foreground line-through font-mono">
                  ₹{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Admin Custom Badges / Notes */}
          {product.admin_note && (
            <div className="border border-[#eaeaea] bg-amber-50/50 rounded-2xl p-5 flex gap-4 items-start shadow-sm mt-2">
              <span className="text-2xl mt-1">✨</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-black text-primary mb-1">A Note from Our Kitchen</h4>
                <p className="text-sm text-[#555] italic leading-relaxed font-serif">{product.admin_note}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="border-y border-border py-6 my-2">
            <h4 className="text-sm uppercase tracking-wider font-bold text-muted-foreground mb-3">Confection Description</h4>
            <p className="text-foreground/80 leading-relaxed text-sm lg:text-base">
              {product.description || 'A gourmet sci-fi confectionery dessert, beautifully prepared in our high-end zero-gravity kitchen using locally-sourced prime ingredients for premium, unforgettable layers of delicate sweet pleasure.'}
            </p>
          </div>

          {/* Purchasing Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-black/5 border border-border rounded-xl px-4 py-3 gap-6 sm:w-fit">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="text-muted-foreground hover:text-foreground font-bold text-lg w-5 h-5 flex items-center justify-center transition-all"
              >
                -
              </button>
              <span className="font-mono font-bold text-base min-w-[20px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="text-muted-foreground hover:text-foreground font-bold text-lg w-5 h-5 flex items-center justify-center transition-all"
              >
                +
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button 
              onClick={handleAddToCartClick}
              className="flex-1 bg-primary text-foreground font-bold py-4 px-8 rounded-xl hover:bg-primary/95 hover:neon-glow transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Add Confection
            </button>

            {/* Wishlist Button */}
            <button 
              onClick={handleWishlistToggle}
              className={`p-4 rounded-xl border transition-all flex items-center justify-center ${
                isWishlisted 
                  ? 'bg-destructive/10 border-destructive text-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-black/5 border-border hover:border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border pt-16">
          <h2 className="text-2xl font-black mb-8 text-foreground tracking-tight">You May Also Relish</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <div 
                key={p.id} 
                className="group glassmorphism rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                <Link to={`/products/${p.id}`} className="aspect-[4/3] bg-black/5 p-4 flex items-center justify-center block relative overflow-hidden">
                  <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl absolute opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <img src={p.image_url} alt={p.name} className="relative z-10 w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform" />
                </Link>
                <div className="p-4 flex flex-col gap-1">
                  <Link to={`/products/${p.id}`}>
                    <h3 className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  <span className="text-sm font-bold text-primary font-mono mt-2">₹{Number(p.discount_price || p.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
