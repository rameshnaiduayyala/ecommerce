import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getStoreSettings, validateCoupon } from '../api/admin';
import { supabase } from '../supabase/client';
import { EmailTemplates } from '../notifications/emailService';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  
  const [settings, setSettings] = useState({ cod_enabled: true, partial_payment_enabled: false, partial_payment_percent: 50 });
  const [paymentMethod, setPaymentMethod] = useState('full'); // 'full', 'cod', 'partial'
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getStoreSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error("Error loading settings", err);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getShippingAmount = () => {
    const shippingFee = settings.shipping_fee !== undefined ? parseFloat(settings.shipping_fee) : 50.00;
    const freeThreshold = settings.free_shipping_threshold !== undefined ? parseFloat(settings.free_shipping_threshold) : 999.00;
    return cartTotal >= freeThreshold ? 0 : shippingFee;
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return cartTotal * (appliedCoupon.discount_value / 100);
    } else {
      return Math.min(appliedCoupon.discount_value, cartTotal);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode) return;

    try {
      const coupon = await validateCoupon(couponCode);
      if (!coupon) {
        setCouponError('Invalid or expired coupon code.');
        return;
      }
      if (cartTotal < coupon.min_order_value) {
        setCouponError(`Min order of ₹${coupon.min_order_value} required for this coupon.`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon "${coupon.code}" applied!`);
    } catch (err) {
      console.error(err);
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to checkout.");
      return navigate('/login');
    }
    
    setIsProcessing(true);
    
    try {
      // Calculate Total Based on Payment Method and Coupon Discounts
      const subtotal = cartTotal;
      const discount = getDiscountAmount();
      const shipping = getShippingAmount();
      const grandTotal = Math.max(0, subtotal - discount + shipping);
      let finalAmount = grandTotal;
      
      if (paymentMethod === 'partial' && settings.partial_payment_enabled) {
        finalAmount = grandTotal * (settings.partial_payment_percent / 100);
      }
      
      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: grandTotal, // Store full amount for accounting
          status: 'pending',
          shipping_address: formData
        }])
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // 2. Insert Order Items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.discount_price || item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;

      // 3. Send Emails (Non-blocking: we catch errors so checkout succeeds even if email fails)
      try {
        console.log("Sending transactional emails...");
        
        // Build the full order details payload for the Amazon-style email
        const orderDetails = {
          orderId: orderData.id,
          date: orderData.created_at || new Date().toISOString(),
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
          phone: formData.phone || '',
          items: cartItems,
          subtotal: cartTotal,
          discount: discount,
          shipping: shipping,
          grandTotal: finalAmount,
          paymentMethod: paymentMethod === 'full' ? 'Prepaid (Full)' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'Partial Payment',
          origin: window.location.origin
        };

        // Send full receipt to customer
        await EmailTemplates.sendOrderConfirmation(user.email, orderDetails);
        
        // Send full alert to admin using support email from store settings
        const adminEmail = settings.support_email || 'admin@rameshayyala.online'; 
        await EmailTemplates.sendAdminNewOrderAlert(adminEmail, orderDetails);
        console.log("Transactional emails sent successfully");
      } catch (emailErr) {
        console.warn("Failed to send transactional emails (likely due to Resend domain verification limits during testing). Order still placed successfully.", emailErr);
      }
      
      // 4. Cleanup
      clearCart();
      navigate('/orders');
      
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Checkout Error</h2>
        <p className="text-muted-foreground mb-8">Your cart is empty. Please add items before checking out.</p>
        <button onClick={() => navigate('/products')} className="bg-primary px-8 py-3 rounded-full font-bold text-white">Go to Products</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Secure Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form onSubmit={handleCheckout} className="flex flex-col gap-8">
            <div className="glassmorphism p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="col-span-2 flex flex-col gap-2 mt-2">
                  <label className="text-sm text-muted-foreground">Street Address</label>
                  <input required name="address" value={formData.address} onChange={handleChange} className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm text-muted-foreground">City</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm text-muted-foreground">Postal Code</label>
                  <input required name="postalCode" value={formData.postalCode} onChange={handleChange} className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
            </div>

            <div className="glassmorphism p-8 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]"></div>
              <h2 className="text-2xl font-bold mb-6 relative z-10">Payment Method</h2>
              
              <div className="flex flex-col gap-4 relative z-10 mb-8">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'full' ? 'border-primary bg-primary/10' : 'border-white/10 bg-background/50'}`}>
                  <input type="radio" name="paymentMethod" value="full" checked={paymentMethod === 'full'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary w-5 h-5" />
                  <span className="font-bold">Pay in Full (Credit Card)</span>
                </label>
                
                {settings.cod_enabled && (
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-white/10 bg-background/50'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary w-5 h-5" />
                    <span className="font-bold">Cash on Delivery (COD)</span>
                  </label>
                )}

                {settings.partial_payment_enabled && (
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'partial' ? 'border-primary bg-primary/10' : 'border-white/10 bg-background/50'}`}>
                    <input type="radio" name="paymentMethod" value="partial" checked={paymentMethod === 'partial'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary w-5 h-5" />
                    <span className="font-bold">Pay {settings.partial_payment_percent}% Upfront</span>
                  </label>
                )}
              </div>
              
              {paymentMethod !== 'cod' && (
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground">Card Number</label>
                    <input required name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="0000 0000 0000 0000" className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-muted-foreground">Expiry Date</label>
                      <input required name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-primary focus:outline-none transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-muted-foreground">CVC</label>
                      <input required name="cvc" value={formData.cvc} onChange={handleChange} placeholder="123" type="password" maxLength="4" className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 font-mono focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white font-bold py-5 rounded-xl hover:bg-primary/90 hover:neon-glow transition-all text-lg disabled:opacity-50">
              {isProcessing ? 'Processing...' : `Place Order`}
            </button>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="glassmorphism p-8 rounded-3xl sticky top-28 border border-white/10">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="flex flex-col gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                      <span className="absolute -top-2 -right-2 bg-muted text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white/20">{item.quantity}</span>
                    </div>
                    <span className="text-muted-foreground flex items-center">{item.name}</span>
                  </div>
                  <span className="flex items-center">₹{((item.discount_price || item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Coupon Promo form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-6 mb-2">
              <input 
                type="text" 
                placeholder="PROMO CODE" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                className="bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary focus:outline-none flex-1 uppercase font-mono font-bold"
              />
              <button type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all">Apply</button>
            </form>
            {couponError && <p className="text-destructive text-[11px] mb-4 font-semibold">{couponError}</p>}
            {couponSuccess && <p className="text-green-400 text-[11px] mb-4 font-semibold">{couponSuccess}</p>}

            <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{getShippingAmount() === 0 ? 'FREE' : `₹${getShippingAmount().toFixed(2)}`}</span>
              </div>
              
              {paymentMethod === 'partial' && (
                <div className="flex justify-between text-accent font-bold mt-2">
                  <span>Upfront Payment ({settings.partial_payment_percent}%)</span>
                  <span>₹{((Math.max(0, cartTotal - getDiscountAmount() + getShippingAmount())) * (settings.partial_payment_percent / 100)).toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between text-xl font-bold">
              <span>{paymentMethod === 'cod' ? 'Total (Due at Delivery)' : paymentMethod === 'partial' ? 'Due Today' : 'Total'}</span>
              <span className="text-primary">
                ₹{paymentMethod === 'partial' 
                  ? ((Math.max(0, cartTotal - getDiscountAmount() + getShippingAmount())) * (settings.partial_payment_percent / 100)).toFixed(2) 
                  : (Math.max(0, cartTotal - getDiscountAmount() + getShippingAmount())).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
