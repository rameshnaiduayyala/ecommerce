import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [settings, setSettings] = useState({
    store_name: 'Aha Konaseema',
    origin_address: 'Ravulapalem, East Godavari District, Andhra Pradesh',
    courier_partner: 'Ghee Express Courier',
    support_email: 'support@ahakonaseema.com',
    support_phone: '+91 888 777 6666',
    guarantee_text: 'Pure Milk Ghee Freshness verified • Vacuum leakage protection sealed • Brand seal attached'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'default_settings')
          .single();
        if (data && !error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error loading store settings:", err);
      }
    };
    fetchSettings();

    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(quantity, price_at_time, products(name, image_url))
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">No Orders Yet</h2>
        <p className="text-muted-foreground mb-8">You haven't placed any orders with us yet.</p>
        <Link to="/products" className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-all hover:neon-glow">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Order History</h1>
      
      <div className="flex flex-col gap-6">
        {orders.map(order => (
          <div key={order.id} className="glassmorphism rounded-2xl overflow-hidden border border-white/5">
            <div className="bg-white/5 p-4 md:p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Placed</p>
                <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold text-primary">₹{order.total_amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order #</p>
                <p className="font-mono text-sm">{order.id.split('-')[0]}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border inline-block ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500 border-green-500/50' :
                  order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                  order.status === 'cancelled' ? 'bg-destructive/20 text-destructive border-destructive/50' :
                  'bg-white/10 text-white border-white/20'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                {order.status !== 'cancelled' && (
                  <button 
                    onClick={() => setSelectedTrackingOrder(order)}
                    className="flex items-center gap-1 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  >
                    🎯 Track Live
                  </button>
                )}
                <button 
                  onClick={() => window.open('/print/invoice/' + order.id, '_blank')}
                  className="flex items-center gap-1 text-xs font-black bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                  🧾 Invoice
                </button>
              </div>
            </div>
            
            {order.admin_note && (
              <div className="bg-primary/10 border-b border-primary/20 p-4 text-sm text-primary flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p><strong>Admin Note:</strong> {order.admin_note}</p>
              </div>
            )}
            
            <div className="p-4 md:p-6 flex flex-col gap-4">
              {order.order_items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img 
                    src={item.products?.image_url || `https://placehold.co/100x100/1E1E1E/8B5CF6?text=${item.products?.name?.charAt(0)}`} 
                    alt={item.products?.name} 
                    className="w-16 h-16 rounded-xl object-contain bg-black/10 border border-white/10" 
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.products?.name}</h3>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} • ₹{item.price_at_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live Order Tracking Modal/Drawer */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md transition-opacity">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setSelectedTrackingOrder(null)}></div>
          
          <div className="relative w-full max-w-lg h-full bg-background/95 border-l border-white/10 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 font-sans tracking-tight">
                  Live Order Tracker
                </h2>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: #{selectedTrackingOrder.id.split('-')[0].toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setSelectedTrackingOrder(null)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Estimated Delivery Prompt */}
            <div className="glassmorphism p-5 rounded-2xl border border-amber-500/20 flex flex-col gap-1 relative overflow-hidden bg-gradient-to-r from-amber-500/5 to-transparent">
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Ghee Express Status</span>
              <span className="text-lg font-black text-white">
                {selectedTrackingOrder.status === 'delivered' ? 'Sweets Delivered!' : 'En Route From Godavari Kitchens'}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {selectedTrackingOrder.status === 'delivered' 
                  ? 'Your pure-ghee confections have been delivered successfully. Enjoy the authentic taste!' 
                  : 'Your confections are prepared and vacuum-sealed for immediate dispatch within 24 hours.'}
              </span>
            </div>

            {/* Visual Timeline Stepper */}
            <div className="flex flex-col gap-8 relative pl-6 border-l border-white/10 py-2 mt-4 ml-3">
              
              {/* Step 1: Confirmed */}
              <div className="relative">
                {/* Glowing Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                <div>
                  <h4 className="font-bold text-sm text-white">Order Confirmed</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Sweets order successfully logged & verified in database.</p>
                  <p className="text-[10px] text-amber-500 font-mono mt-1">
                    {new Date(selectedTrackingOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step 2: Preparing */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                  selectedTrackingOrder.status === 'processing' || selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                    ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse' 
                    : 'bg-background border-white/20'
                }`}></div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    selectedTrackingOrder.status === 'processing' || selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                      ? 'text-white' : 'text-muted-foreground'
                  }`}>Preparing in Kitchen</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Our chefs in Ravulapalem are crafting your sweets with authentic pure ghee.</p>
                </div>
              </div>

              {/* Step 3: QC Check */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                  selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                    ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                    : 'bg-background border-white/20'
                }`}></div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                      ? 'text-white' : 'text-muted-foreground'
                  }`}>Freshness & Seal Verified</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Strict quality inspection, hygiene validation, and vacuum freshness sealing complete.</p>
                </div>
              </div>

              {/* Step 4: Dispatched */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                  selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                    ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse' 
                    : 'bg-background border-white/20'
                }`}></div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    selectedTrackingOrder.status === 'delivered' || selectedTrackingOrder.status === 'shipped'
                      ? 'text-white' : 'text-muted-foreground'
                  }`}>Dispatched / En Route</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Handed over to Godavari express network carriers for immediate doorstep transit.</p>
                </div>
              </div>

              {/* Step 5: Delivered */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                  selectedTrackingOrder.status === 'delivered'
                    ? 'bg-green-500 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' 
                    : 'bg-background border-white/20'
                }`}></div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    selectedTrackingOrder.status === 'delivered' ? 'text-green-400 font-extrabold' : 'text-muted-foreground'
                  }`}>Delivered Successfully</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Sweets hand-delivered in prime condition. Indulge in the true taste of Konaseema!</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
