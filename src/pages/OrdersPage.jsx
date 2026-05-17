import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
              <div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border inline-block ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500 border-green-500/50' :
                  order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                  order.status === 'cancelled' ? 'bg-destructive/20 text-destructive border-destructive/50' :
                  'bg-white/10 text-white border-white/20'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
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
    </div>
  );
};

export default OrdersPage;
