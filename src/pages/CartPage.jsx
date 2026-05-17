import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getStoreSettings } from '../api/admin';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [settings, setSettings] = useState({ shipping_fee: 50.00, free_shipping_threshold: 999.00 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getStoreSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const shippingFee = settings.shipping_fee !== undefined ? parseFloat(settings.shipping_fee) : 50.00;
  const freeThreshold = settings.free_shipping_threshold !== undefined ? parseFloat(settings.free_shipping_threshold) : 999.00;
  const shipping = cartTotal >= freeThreshold ? 0 : shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="w-32 h-32 glassmorphism rounded-full flex items-center justify-center mb-8 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any quantum confections yet.</p>
        <Link to="/products" className="bg-primary text-white font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-all hover:neon-glow">
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col gap-6">
          {cartItems.map(item => (
            <div key={item.id} className="glassmorphism p-4 rounded-2xl flex items-center justify-between gap-6 flex-wrap md:flex-nowrap border border-white/5">
              <div className="flex items-center gap-4 flex-1">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain bg-black/10 rounded-xl border border-white/5" />
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-muted-foreground text-xs">₹{(item.discount_price || item.price).toFixed(2)}</p>
                </div>
              </div>

              {/* Quantity Increaser/Decreaser */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 gap-4">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="text-muted-foreground hover:text-white font-bold text-sm w-5 h-5 flex items-center justify-center transition-all hover:scale-125"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm min-w-[20px] text-center text-foreground">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="text-muted-foreground hover:text-white font-bold text-sm w-5 h-5 flex items-center justify-center transition-all hover:scale-125"
                >
                  +
                </button>
              </div>

              <div className="font-bold text-lg min-w-[100px] text-right font-mono">
                ₹{((item.discount_price || item.price) * item.quantity).toFixed(2)}
              </div>
              
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-white/5 rounded-full hover:bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
          
          <button onClick={clearCart} className="self-end text-sm text-destructive hover:underline mt-4">
            Clear Cart
          </button>
        </div>
        
        <div className="w-full lg:w-96">
          <div className="glassmorphism p-8 rounded-3xl sticky top-28 border border-primary/20">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="flex justify-between mb-4 text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-muted-foreground">
              <span>Shipping</span>
              <span className={`font-mono ${shipping === 0 ? 'text-green-400 font-bold' : ''}`}>
                {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
              </span>
            </div>

            {shipping > 0 && (
              <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-[11px] text-accent font-semibold text-center">
                  ⚡ Add <span className="font-mono">₹{(freeThreshold - cartTotal).toFixed(2)}</span> more for FREE Shipping!
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (cartTotal / freeThreshold) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex justify-between mb-8 text-xl font-bold">
              <span>Total</span>
              <span className="text-primary font-mono">₹{(cartTotal + shipping).toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="w-full block text-center bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 hover:neon-glow transition-all">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
