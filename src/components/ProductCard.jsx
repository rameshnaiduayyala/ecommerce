import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group glassmorphism rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
      <div className="relative aspect-square overflow-hidden bg-white/5 p-4 flex items-center justify-center">
        {/* Placeholder for actual image */}
        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-tr from-primary/40 to-accent/40 blur-xl absolute opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img 
          src={product.image_url || `https://placehold.co/400x400/1E1E1E/8B5CF6?text=${product.name.split(' ')[0]}`} 
          alt={product.name}
          className="relative z-10 w-full h-full object-cover rounded-xl shadow-lg drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
        />
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
      </div>
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-foreground truncate mr-2">{product.name}</h3>
          <span className="flex items-center text-accent text-sm">
            ★ {product.rating || '4.5'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || 'Premium luxury dessert crafted with the finest ingredients.'}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">₹{product.discount_price || product.price}</span>
            {product.discount_price && (
              <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
            )}
          </div>
          <button onClick={() => addToCart(product)} className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full hover:neon-glow transition-all active:scale-95">
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
