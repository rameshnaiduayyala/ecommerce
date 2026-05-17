import { useState, useEffect } from 'react';
import { addProduct } from '../api/products';
import { getAdminProducts, updateProduct, deleteProduct, getAllOrders, updateOrderStatus, getStoreSettings, updateStoreSettings, getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, getCoupons, addCoupon, deleteCoupon } from '../api/admin';
import { supabase } from '../supabase/client';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  
  // Products State
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', image_url: '', description: '', featured: false, admin_note: '' });
  const [status, setStatus] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  // Orders State
  const [orders, setOrders] = useState([]);

  // Settings State
  const [settings, setSettings] = useState({ cod_enabled: true, partial_payment_enabled: false, partial_payment_percent: 50 });
  const [settingsStatus, setSettingsStatus] = useState('');
  const [newHeroSlide, setNewHeroSlide] = useState({ title: '', description: '', image_url: '' });
  const [slideUploading, setSlideUploading] = useState(false);
  
  // Asset Library State
  const [storageImages, setStorageImages] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [onAssetSelect, setOnAssetSelect] = useState(() => () => {});

  const openAssetLibrary = async (selectCallback) => {
    setOnAssetSelect(() => selectCallback);
    setIsAssetPickerOpen(true);
    setLoadingAssets(true);
    try {
      const { data, error } = await supabase.storage.from('product-images').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (error) throw error;
      
      const list = data.map(file => {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(file.name);
        return { name: file.name, url: publicUrl };
      });
      setStorageImages(list || []);
    } catch (err) {
      console.error("Asset fetch error:", err);
    } finally {
      setLoadingAssets(false);
    }
  };
  
  // Order Edits State (Drafts)
  const [orderEdits, setOrderEdits] = useState({});

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn] = useState({ text: '', type: 'info', is_active: true });
  const [annStatus, setAnnStatus] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: 0, is_active: true });
  const [couponStatus, setCouponStatus] = useState('');
  
  const loadData = async () => {
    try {
      if (activeTab === 'products') {
        const data = await getAdminProducts();
        setProducts(data);
      } else if (activeTab === 'orders') {
        const data = await getAllOrders();
        setOrders(data);
      } else if (activeTab === 'settings') {
        const data = await getStoreSettings();
        if (data) setSettings(data);
      } else if (activeTab === 'announcements') {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } else if (activeTab === 'coupons') {
        const data = await getCoupons();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setStatus('Uploading image to cloud...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setStatus('Image uploaded successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error("Storage upload error:", err);
      setStatus(`Failed to upload image: ${err.message || 'Please verify database settings.'}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleProductChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        slug: formData.name.toLowerCase().replace(/\\s+/g, '-'),
      };
      
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setStatus('Product updated!');
      } else {
        await addProduct(payload);
        setStatus('Product added!');
      }
      
      setFormData({ name: '', price: '', image_url: '', description: '', featured: false, admin_note: '' });
      setEditingProduct(null);
      loadData();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus(`Error saving product: ${err.message || err.details || 'Please check if database policies are applied.'}`);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
      description: product.description || '',
      featured: product.featured || false,
      admin_note: product.admin_note || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsStatus('Saving...');
    try {
      await updateStoreSettings(settings);
      setSettingsStatus('Settings updated successfully!');
      setTimeout(() => setSettingsStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSettingsStatus('Error saving settings.');
    }
  };

  const handleOrderNoteUpdate = async (orderId, note) => {
    try {
      await supabase.from('orders').update({ admin_note: note }).eq('id', orderId);
      setSettingsStatus('Order note saved');
      setTimeout(() => setSettingsStatus(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOrderChanges = async (orderId) => {
    const draft = orderEdits[orderId];
    if (!draft) return; // No changes made
    
    setSettingsStatus('Saving order changes...');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: draft.status, 
          admin_note: draft.admin_note 
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      setSettingsStatus('Order updated successfully!');
      // Remove draft from local state after saving
      const updatedEdits = { ...orderEdits };
      delete updatedEdits[orderId];
      setOrderEdits(updatedEdits);
      
      loadData(); // Sync up from server
      setTimeout(() => setSettingsStatus(''), 3000);
    } catch (err) {
      console.error(err);
      alert("Error updating order");
    }
  };

  // Announcements Actions
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnStatus('Publishing...');
    try {
      await addAnnouncement(newAnn);
      setNewAnn({ text: '', type: 'info', is_active: true });
      setAnnStatus('Flash update published!');
      loadData();
      setTimeout(() => setAnnStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setAnnStatus('Error publishing announcement.');
    }
  };

  const handleAnnToggle = async (id, currentStatus) => {
    try {
      await updateAnnouncement(id, { is_active: !currentStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnnDelete = async (id) => {
    if (window.confirm("Delete this flash update?")) {
      try {
        await deleteAnnouncement(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Coupons Actions
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponStatus('Publishing coupon...');
    try {
      const payload = {
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: parseFloat(newCoupon.discount_value),
        min_order_value: parseFloat(newCoupon.min_order_value),
        is_active: newCoupon.is_active
      };
      await addCoupon(payload);
      setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: 0, is_active: true });
      setCouponStatus('Coupon published successfully!');
      loadData();
      setTimeout(() => setCouponStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setCouponStatus('Error creating coupon.');
    }
  };

  const handleCouponToggle = async (code, currentStatus) => {
    try {
      await supabase.from('coupons').update({ is_active: !currentStatus }).eq('code', code);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCouponDelete = async (code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      try {
        await deleteCoupon(code);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-4xl font-bold">Command Center</h1>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-full transition-all ${activeTab === 'products' ? 'bg-primary text-white neon-glow' : 'glassmorphism text-muted-foreground'}`}>Products</button>
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-full transition-all ${activeTab === 'orders' ? 'bg-primary text-white neon-glow' : 'glassmorphism text-muted-foreground'}`}>Orders</button>
          <button onClick={() => setActiveTab('announcements')} className={`px-6 py-2 rounded-full transition-all ${activeTab === 'announcements' ? 'bg-primary text-white neon-glow' : 'glassmorphism text-muted-foreground'}`}>Flash Updates</button>
          <button onClick={() => setActiveTab('coupons')} className={`px-6 py-2 rounded-full transition-all ${activeTab === 'coupons' ? 'bg-primary text-white neon-glow' : 'glassmorphism text-muted-foreground'}`}>Coupons</button>
          <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-full transition-all ${activeTab === 'settings' ? 'bg-primary text-white neon-glow' : 'glassmorphism text-muted-foreground'}`}>Settings</button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="glassmorphism p-6 rounded-3xl h-fit">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {status && <div className="bg-primary/20 text-primary p-3 rounded-lg mb-4 text-sm">{status}</div>}
            
            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
              <input name="name" placeholder="Product Name" value={formData.name} onChange={handleProductChange} required className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
              <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} onChange={handleProductChange} required className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
              {/* Premium Drag and Drop / Image Upload Section */}
              <div className="flex flex-col gap-2 bg-background/40 border border-white/10 rounded-2xl p-4">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Product Image</label>
                
                {formData.image_url ? (
                  <div className="relative group rounded-xl overflow-hidden aspect-square border border-primary/20 max-w-[150px] mx-auto">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="bg-destructive text-white px-3 py-1 rounded-full hover:scale-110 transition-transform text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl cursor-pointer transition-all bg-white/5 group">
                    {imageUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-primary font-semibold">Uploading to Cloud...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <span className="text-xs text-foreground font-semibold">Upload sweet photo</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Recommended: 800x800px (1:1 Ratio)</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={imageUploading}
                      className="hidden" 
                    />
                  </label>
                )}

                {/* Back up URL input for flexibility */}
                <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Or paste direct image URL</span>
                    <button 
                      type="button"
                      onClick={() => openAssetLibrary((url) => setFormData(prev => ({ ...prev, image_url: url })))}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      📁 Browse Cloud Library
                    </button>
                  </div>
                  <input 
                    name="image_url" 
                    placeholder="https://..." 
                    value={formData.image_url} 
                    onChange={handleProductChange} 
                    className="bg-background border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary text-xs w-full" 
                  />
                </div>
              </div>
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleProductChange} rows="3" className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"></textarea>
              <textarea name="admin_note" placeholder="Admin Note (Shows as a badge/alert to users)" value={formData.admin_note} onChange={handleProductChange} rows="2" className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary placeholder:text-primary/50 text-primary text-sm"></textarea>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleProductChange} className="accent-primary w-4 h-4" />
                Feature on Homepage
              </label>
              
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all">{editingProduct ? 'Update' : 'Publish'}</button>
                {editingProduct && (
                  <button type="button" onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', image_url: '', description: '', featured: false, admin_note: '' }); }} className="px-4 bg-background border border-white/10 rounded-xl hover:bg-white/5 transition-all text-sm">Cancel</button>
                )}
              </div>
            </form>
          </div>
          
          {/* List */}
          <div className="lg:col-span-2 glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
            <h2 className="text-2xl font-bold mb-6">Inventory</h2>
            <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-background/50 border border-white/5 rounded-xl hover:border-primary/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={p.image_url || `https://placehold.co/100x100/1E1E1E/8B5CF6?text=${p.name.charAt(0)}`} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold">{p.name} {p.featured && <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full ml-2 uppercase">Featured</span>}</h3>
                      <p className="text-sm text-muted-foreground">₹{p.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(p)} className="p-2 bg-white/5 hover:bg-primary hover:text-white rounded-lg transition-all">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/5 hover:bg-destructive hover:text-white rounded-lg transition-all">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
          <h2 className="text-2xl font-bold mb-6">Order Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status & Notes</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-mono text-xs">{order.id.split('-')[0]}...</td>
                    <td className="py-4">{order.users?.email || 'Unknown'}</td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {order.order_items?.map((item, i) => (
                        <div key={i}>{item.quantity}x {item.products?.name}</div>
                      ))}
                    </td>
                    <td className="py-4 font-bold">₹{order.total_amount}</td>
                    <td className="py-4">
                      {(() => {
                        const draft = orderEdits[order.id] || { 
                          status: order.status, 
                          admin_note: order.admin_note || '' 
                        };
                        const hasChanges = orderEdits[order.id] !== undefined;

                        return (
                          <div className="flex flex-col gap-2">
                            <select 
                              value={draft.status} 
                              onChange={(e) => setOrderEdits({
                                ...orderEdits,
                                [order.id]: { ...draft, status: e.target.value }
                              })}
                              className={`bg-background text-sm rounded-lg px-3 py-1.5 border focus:outline-none ${
                                draft.status === 'delivered' ? 'border-green-500 text-green-500' :
                                draft.status === 'processing' ? 'border-yellow-500 text-yellow-500' :
                                draft.status === 'cancelled' ? 'border-destructive text-destructive' :
                                'border-white/20'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="Admin Note..."
                              value={draft.admin_note}
                              onChange={(e) => setOrderEdits({
                                ...orderEdits,
                                [order.id]: { ...draft, admin_note: e.target.value }
                              })}
                              className="bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg px-3 py-1.5 focus:outline-none placeholder:text-primary/50"
                            />
                            {hasChanges && (
                              <button 
                                onClick={() => handleSaveOrderChanges(order.id)} 
                                className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold py-1 px-3 rounded-lg hover:neon-glow transition-all w-full mt-1"
                              >
                                Save Changes
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Publish Announcement Form */}
          <div className="glassmorphism p-6 rounded-3xl h-fit">
            <h2 className="text-2xl font-bold mb-6">Create Flash Update</h2>
            {annStatus && <div className="bg-primary/20 text-primary p-3 rounded-lg mb-4 text-sm">{annStatus}</div>}
            
            <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-4">
              <textarea 
                name="text" 
                placeholder="Type flash update message (e.g. ⚡ FLASH SALE: 20% OFF...)" 
                value={newAnn.text} 
                onChange={(e) => setNewAnn({ ...newAnn, text: e.target.value })} 
                required 
                rows="3" 
                className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm"
              ></textarea>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Alert Styling Type</label>
                <select 
                  value={newAnn.type} 
                  onChange={(e) => setNewAnn({ ...newAnn, type: e.target.value })}
                  className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm"
                >
                  <option value="info">Info (Cyan Glow)</option>
                  <option value="success">Success / Promo (Green Glow)</option>
                  <option value="warning">Warning / Alert (Amber Glow)</option>
                  <option value="critical">Critical / Emergency (Red Glow)</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={newAnn.is_active} 
                  onChange={(e) => setNewAnn({ ...newAnn, is_active: e.target.checked })} 
                  className="accent-primary w-4 h-4" 
                />
                Make Active Immediately
              </label>
              
              <button type="submit" className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all mt-2 hover:neon-glow">
                Publish Flash Update
              </button>
            </form>
          </div>

          {/* Live & Past Announcements List */}
          <div className="lg:col-span-2 glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
            <h2 className="text-2xl font-bold mb-6">Flash Logs</h2>
            <div className="overflow-y-auto pr-2 flex flex-col gap-4 flex-1">
              {announcements.map(ann => (
                <div 
                  key={ann.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-2xl transition-all gap-4 ${
                    ann.is_active 
                      ? 'bg-background/80 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.05)]' 
                      : 'bg-background/20 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        ann.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                        ann.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        ann.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ann.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-foreground">{ann.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={ann.is_active} 
                        onChange={() => handleAnnToggle(ann.id, ann.is_active)} 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    
                    <button 
                      onClick={() => handleAnnDelete(ann.id)} 
                      className="p-2 bg-white/5 hover:bg-destructive hover:text-white rounded-lg transition-all text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No announcements created yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Coupon Form */}
          <div className="glassmorphism p-6 rounded-3xl h-fit">
            <h2 className="text-2xl font-bold mb-6">Create Coupon</h2>
            {couponStatus && <div className="bg-primary/20 text-primary p-3 rounded-lg mb-4 text-sm">{couponStatus}</div>}
            
            <form onSubmit={handleCouponSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Promo Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. SWEET20" 
                  value={newCoupon.code} 
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} 
                  required 
                  className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm uppercase font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Discount Type</label>
                <select 
                  value={newCoupon.discount_type} 
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                  className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Discount Value</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 10 or 150" 
                  value={newCoupon.discount_value} 
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} 
                  required 
                  className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 500" 
                  value={newCoupon.min_order_value} 
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })} 
                  className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm font-mono"
                />
              </div>
              
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={newCoupon.is_active} 
                  onChange={(e) => setNewCoupon({ ...newCoupon, is_active: e.target.checked })} 
                  className="accent-primary w-4 h-4" 
                />
                Make Active Immediately
              </label>
              
              <button type="submit" className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all mt-2 hover:neon-glow">
                Create Coupon
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="lg:col-span-2 glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col h-[80vh]">
            <h2 className="text-2xl font-bold mb-6">Active Coupons</h2>
            <div className="overflow-y-auto pr-2 flex flex-col gap-4 flex-1">
              {coupons.map(coupon => (
                <div 
                  key={coupon.code} 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 border rounded-2xl transition-all gap-4 ${
                    coupon.is_active 
                      ? 'bg-background/80 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.05)]' 
                      : 'bg-background/20 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px] uppercase font-mono font-black text-primary px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        coupon.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-muted-foreground'
                      }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-semibold mt-2">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% OFF` 
                        : `₹${coupon.discount_value} OFF`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min Order Value: ₹{coupon.min_order_value || 0}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={coupon.is_active} 
                        onChange={() => handleCouponToggle(coupon.code, coupon.is_active)} 
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    
                    <button 
                      onClick={() => handleCouponDelete(coupon.code)} 
                      className="p-2 bg-white/5 hover:bg-destructive hover:text-white rounded-lg transition-all text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No coupons created yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glassmorphism p-8 rounded-3xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Store & Payment Settings</h2>
          {settingsStatus && <div className="bg-primary/20 text-primary p-3 rounded-lg mb-6 text-sm">{settingsStatus}</div>}
          
          <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-8">
            {/* Shipping Settings */}
            <div className="flex flex-col gap-4 p-4 bg-background/50 border border-white/10 rounded-xl">
              <h3 className="font-bold text-lg">Shipping Rules</h3>
              <p className="text-sm text-muted-foreground">Configure shipping fees and free delivery thresholds.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground">Flat Shipping Fee (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.shipping_fee !== undefined ? settings.shipping_fee : 50.00} 
                    onChange={(e) => setSettings({ ...settings, shipping_fee: parseFloat(e.target.value) || 0 })}
                    className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary w-full" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground">Free Shipping Threshold (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.free_shipping_threshold !== undefined ? settings.free_shipping_threshold : 999.00} 
                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                    className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary w-full" 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-background/50 border border-white/10 rounded-xl">
              <div>
                <h3 className="font-bold text-lg">Cash on Delivery (COD)</h3>
                <p className="text-sm text-muted-foreground">Allow customers to pay when their order is delivered.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.cod_enabled} onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })} />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex flex-col gap-4 p-4 bg-background/50 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Partial Payment (Layaway)</h3>
                  <p className="text-sm text-muted-foreground">Allow customers to pay a percentage upfront and the rest later.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.partial_payment_enabled} onChange={(e) => setSettings({ ...settings, partial_payment_enabled: e.target.checked })} />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {settings.partial_payment_enabled && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Upfront Percentage (%)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    value={settings.partial_payment_percent} 
                    onChange={(e) => setSettings({ ...settings, partial_payment_percent: parseInt(e.target.value) })}
                    className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary w-full md:w-1/3" 
                  />
                </div>
              )}
            </div>

            {/* Homepage Hero Customization */}
            <div className="flex flex-col gap-4 p-4 bg-background/50 border border-white/10 rounded-xl">
              <h3 className="font-bold text-lg text-primary">Homepage Hero Showcase</h3>
              <p className="text-sm text-muted-foreground">Customize the main hero cover picture or set up a looping multi-image carousel.</p>

              {/* Single Hero Image Upload */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-muted-foreground font-semibold">Hero Background / Main Image</label>
                  <button 
                    type="button"
                    onClick={() => openAssetLibrary((url) => setSettings(prev => ({ ...prev, hero_image_url: url })))}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    📁 Browse Cloud Library
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {settings.hero_image_url && (
                    <img 
                      src={settings.hero_image_url} 
                      alt="Hero Cover" 
                      className="w-16 h-16 rounded-xl object-cover border border-white/10"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center h-16 border border-dashed border-white/10 hover:border-primary/50 rounded-xl cursor-pointer bg-white/5 transition-all">
                    <span className="text-xs text-muted-foreground font-medium hover:text-white">Upload New Hero Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setSettingsStatus('Uploading hero cover image...');
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `hero-${Date.now()}.${fileExt}`;
                          const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
                          if (error) throw error;
                          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
                          setSettings({ ...settings, hero_image_url: publicUrl });
                          setSettingsStatus('Hero image uploaded successfully!');
                          setTimeout(() => setSettingsStatus(''), 3000);
                        } catch (err) {
                          console.error("Hero upload error:", err);
                          setSettingsStatus('Failed to upload hero image.');
                        }
                      }}
                    />
                  </label>
                </div>
                <input 
                  type="text" 
                  value={settings.hero_image_url || ''} 
                  onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                  placeholder="Or paste direct cover URL..." 
                  className="bg-background border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary w-full mt-1"
                />
              </div>

              {/* Carousel Toggle Switch */}
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl mt-2">
                <div>
                  <h4 className="font-bold text-sm">Enable Multi-Image Carousel Mode</h4>
                  <p className="text-xs text-muted-foreground">If enabled, the hero section will loop through all carousel confections.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.hero_use_carousel || false} 
                    onChange={(e) => setSettings({ ...settings, hero_use_carousel: e.target.checked })} 
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Carousel Urls Management */}
              {settings.hero_use_carousel && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4">
                  <h4 className="font-bold text-md text-primary">Advanced Carousel Slide Manager</h4>
                  <p className="text-xs text-muted-foreground">Add slides with gorgeous custom titles, descriptions, and images. They will fade in sync!</p>

                  {/* Add Slide Builder form */}
                  <div className="p-4 bg-background border border-white/5 rounded-2xl flex flex-col gap-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Create New Slide</h5>
                    
                    <input 
                      type="text" 
                      placeholder="Slide Title / Confection Name" 
                      value={newHeroSlide.title} 
                      onChange={(e) => setNewHeroSlide({ ...newHeroSlide, title: e.target.value })}
                      className="bg-background/80 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary w-full"
                    />

                    <textarea 
                      rows="2" 
                      placeholder="Slide Description / Captivating Details" 
                      value={newHeroSlide.description} 
                      onChange={(e) => setNewHeroSlide({ ...newHeroSlide, description: e.target.value })}
                      className="bg-background/80 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary w-full"
                    />

                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-muted-foreground">Slide Photo URL</span>
                        <button 
                          type="button"
                          onClick={() => openAssetLibrary((url) => setNewHeroSlide(prev => ({ ...prev, image_url: url })))}
                          className="text-[9px] text-primary hover:underline font-bold"
                        >
                          📁 Choose from Storage
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        {newHeroSlide.image_url ? (
                          <div className="relative rounded-lg overflow-hidden w-10 h-10 border border-primary/20 flex-shrink-0">
                            <img src={newHeroSlide.image_url} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <label className="flex-1 flex items-center justify-center h-10 border border-dashed border-white/10 hover:border-primary/50 rounded-xl cursor-pointer bg-white/5 transition-all text-[11px] text-muted-foreground">
                            {slideUploading ? "Uploading..." : "📷 Upload Photo"}
                            <input 
                              type="file" 
                              accept="image/*" 
                              disabled={slideUploading}
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setSlideUploading(true);
                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `slide-${Date.now()}.${fileExt}`;
                                  const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
                                  if (error) throw error;
                                  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
                                  setNewHeroSlide(prev => ({ ...prev, image_url: publicUrl }));
                                } catch (err) {
                                  console.error(err);
                                  alert("Failed to upload slide image");
                                } finally {
                                  setSlideUploading(false);
                                }
                              }}
                            />
                          </label>
                        )}
                        
                        <input 
                          type="text" 
                          placeholder="Or paste image url..." 
                          value={newHeroSlide.image_url} 
                          onChange={(e) => setNewHeroSlide({ ...newHeroSlide, image_url: e.target.value })}
                          className="bg-background border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary text-[10px] flex-1"
                        />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        if (!newHeroSlide.image_url || !newHeroSlide.title) {
                          alert("Please provide at least a title and a slide image!");
                          return;
                        }
                        const currentSlides = Array.isArray(settings.hero_slides) ? settings.hero_slides : [];
                        const updatedSlides = [...currentSlides, newHeroSlide];
                        setSettings({ ...settings, hero_slides: updatedSlides });
                        setNewHeroSlide({ title: '', description: '', image_url: '' });
                      }}
                      className="bg-primary/20 hover:bg-primary text-primary hover:text-white font-bold py-2 rounded-xl text-xs transition-all mt-1"
                    >
                      + Add Slide to Carousel
                    </button>
                  </div>

                  {/* Active list of Carousel Slides */}
                  <div className="flex flex-col gap-2 mt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Slide Sequence</h5>
                    
                    {Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {settings.hero_slides.map((slide, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                            <img src={slide.image_url} className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs truncate text-foreground">{slide.title}</h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{slide.description}</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const updated = settings.hero_slides.filter((_, index) => index !== i);
                                setSettings({ ...settings, hero_slides: updated });
                              }}
                              className="text-xs text-destructive hover:underline font-bold px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No slide confections added yet. Add one above!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button type="submit" className="bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all hover:neon-glow">
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* Cloud Asset Library Modal */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glassmorphism w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 p-6 flex flex-col gap-6 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📁 Cloud Asset Library
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Select an existing image from your bucket or upload a new one.</p>
              </div>
              <button 
                onClick={() => setIsAssetPickerOpen(false)}
                className="text-muted-foreground hover:text-white text-lg font-bold p-2"
              >
                ✕
              </button>
            </div>

            {/* Grid of assets */}
            <div className="flex-1 overflow-y-auto min-h-[300px] pr-2">
              {loadingAssets ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-pulse py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span>Scanning cloud repository...</span>
                </div>
              ) : storageImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {storageImages.map((img) => (
                    <div 
                      key={img.name} 
                      onClick={() => {
                        onAssetSelect(img.url);
                        setIsAssetPickerOpen(false);
                      }}
                      className="group relative cursor-pointer border border-white/5 hover:border-primary/50 bg-white/5 hover:bg-white/10 rounded-2xl p-2 transition-all flex flex-col gap-2 justify-between"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-black/20 relative">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] bg-primary text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider">Select</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center block px-1">{img.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 gap-2">
                  <span>No uploaded items found in the Supabase bucket.</span>
                  <span className="text-xs text-muted-foreground/60">Upload new ones to start building your repository.</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 items-center">
              {/* Upload inside Picker */}
              <label className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer">
                Upload custom new image
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setLoadingAssets(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `asset-${Date.now()}.${fileExt}`;
                      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
                      if (error) throw error;
                      
                      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
                      onAssetSelect(publicUrl);
                      setIsAssetPickerOpen(false);
                    } catch (err) {
                      console.error(err);
                      alert("Asset upload failed.");
                    } finally {
                      setLoadingAssets(false);
                    }
                  }}
                />
              </label>

              <button 
                onClick={() => setIsAssetPickerOpen(false)}
                className="px-6 py-2.5 rounded-full glassmorphism text-xs font-bold hover:bg-white/10 transition-all"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
