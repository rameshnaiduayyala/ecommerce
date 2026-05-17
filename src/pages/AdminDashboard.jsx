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
  const [selectedFulfillmentOrder, setSelectedFulfillmentOrder] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  
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

  // Pre-load all listings once for the Executive Quick Stats counters
  useEffect(() => {
    const loadStats = async () => {
      try {
        const prodData = await getAdminProducts();
        setProducts(prodData || []);
        const ordData = await getAllOrders();
        setOrders(ordData || []);
        const annData = await getAnnouncements();
        setAnnouncements(annData || []);
        const coupData = await getCoupons();
        setCoupons(coupData || []);
      } catch (err) {
        console.error("Dashboard overview prefetch error:", err);
      }
    };
    loadStats();
  }, []);

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
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
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
      setIsProductModalOpen(false);
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
    setAnnStatus(editingAnn ? 'Updating...' : 'Publishing...');
    try {
      if (editingAnn) {
        await updateAnnouncement(editingAnn.id, newAnn);
        setEditingAnn(null);
        setAnnStatus('Flash update updated!');
      } else {
        await addAnnouncement(newAnn);
        setAnnStatus('Flash update published!');
      }
      setNewAnn({ text: '', type: 'info', is_active: true });
      setIsAnnModalOpen(false);
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
    <>
      <div className="container mx-auto px-4 py-12 print:hidden">
        {/* Executive Welcome & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 font-sans tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Administrator. The Godavari kitchens are active and online.</p>
        </div>
        
        {/* Navigation Tabs Pillbox */}
        <div className="flex flex-wrap gap-2.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === 'products' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-102' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>Catalog</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-102' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-12h7.5M20.25 9h-7.5m7.5 3h-7.5m7.5 3h-7.5M2.25 4.5A2.25 2.25 0 0 1 4.5 2.25h15A2.25 2.25 0 0 1 21.75 4.5v15a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25v-15Z" />
            </svg>
            <span>Orders</span>
          </button>

          <button 
            onClick={() => setActiveTab('announcements')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === 'announcements' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-102' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            <span>Flash Updates</span>
          </button>

          <button 
            onClick={() => setActiveTab('coupons')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === 'coupons' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-102' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.181 0l5.103-5.103a2.25 2.25 0 0 0 0-3.181l-9.582-9.584A2.25 2.25 0 0 0 9.568 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <span>Coupons</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === 'settings' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-102' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Executive Quick Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glassmorphism p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col gap-1 hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-black text-amber-500">
            📦
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Total Catalog</span>
          <span className="text-xl font-black text-white">{products.length} Products</span>
        </div>
        
        <div className="glassmorphism p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col gap-1 hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-black text-amber-500">
            📊
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Store Orders</span>
          <span className="text-xl font-black text-white">{orders.length} Placed</span>
        </div>

        <div className="glassmorphism p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col gap-1 hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-black text-amber-500">
            ⚡
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Flash Alerts</span>
          <span className="text-xl font-black text-white">
            {announcements.filter(a => a.is_active).length} Active
          </span>
        </div>

        <div className="glassmorphism p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col gap-1 hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-black text-amber-500">
            🎟️
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Coupon Campaign</span>
          <span className="text-xl font-black text-white">
            {coupons.filter(c => c.is_active).length} Active
          </span>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col min-h-[70vh] animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Add, update, or feature confections in the storefront catalog.</p>
            </div>
            <button 
              onClick={() => {
                setEditingProduct(null);
                setFormData({ name: '', price: '', image_url: '', description: '', featured: false, admin_note: '' });
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-102"
            >
              + Add Confection
            </button>
          </div>
          
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-background/50 border border-white/5 rounded-xl hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <img 
                    src={p.image_url || `https://placehold.co/100x100/1E1E1E/8B5CF6?text=${p.name.charAt(0)}`} 
                    alt={p.name}
                    className="w-12 h-12 rounded-lg object-contain bg-black/10 border border-white/5" 
                  />
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      {p.name} 
                      {p.featured && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black uppercase">Featured</span>}
                      {p.admin_note && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">Alert Badge Active</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 font-bold">₹{p.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      startEdit(p);
                      setIsProductModalOpen(true);
                    }} 
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black text-white rounded-lg transition-all text-xs font-bold"
                  >
                    Edit Item
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-destructive hover:text-white rounded-lg transition-all text-xs font-bold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm font-medium">No confections in database. Click + Add Confection to create.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col min-h-[70vh] animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Fulfillment Control</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Manage, inspect, seal, and dispatch fresh Godavari confections.</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Total Sales Volume: <span className="text-primary font-black">₹{orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0)}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Customer Details</th>
                  <th className="pb-3 font-semibold">Ordered Items</th>
                  <th className="pb-3 font-semibold">Payment Total</th>
                  <th className="pb-3 font-semibold text-center">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const addr = order.shipping_address || {};
                  const custName = addr.firstName ? `${addr.firstName} ${addr.lastName}` : 'Guest Checkout';
                  
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono text-xs text-primary font-bold">
                        #{order.id.split('-')[0].toUpperCase()}
                      </td>
                      <td className="py-4 text-xs font-medium text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{custName}</span>
                          <span className="text-[10px] text-muted-foreground">{order.users?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-muted-foreground">
                        {order.order_items?.map((item, i) => (
                          <div key={i} className="flex gap-1.5 items-center my-0.5">
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black">
                              {item.quantity}x
                            </span>
                            <span>{item.products?.name}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white">₹{order.total_amount}</span>
                          <span className="text-[9px] text-green-400 font-bold font-mono">Paid / COD Pending</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {(() => {
                          const draft = orderEdits[order.id] || { 
                            status: order.status, 
                            admin_note: order.admin_note || '' 
                          };
                          const hasChanges = orderEdits[order.id] !== undefined;

                          return (
                            <div className="flex flex-col gap-2 items-center">
                              <div className="flex gap-2 w-full justify-center">
                                <select 
                                  value={draft.status} 
                                  onChange={(e) => setOrderEdits({
                                    ...orderEdits,
                                    [order.id]: { ...draft, status: e.target.value }
                                  })}
                                  className={`bg-background text-xs rounded-lg px-2.5 py-1 border focus:outline-none ${
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

                                <button 
                                  onClick={() => setSelectedFulfillmentOrder(order)}
                                  className="flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                                >
                                  📋 Fulfillment Docket
                                </button>
                              </div>

                              <input 
                                type="text" 
                                placeholder="Add packaging instructions / dispatch note..."
                                value={draft.admin_note}
                                onChange={(e) => setOrderEdits({
                                  ...orderEdits,
                                  [order.id]: { ...draft, admin_note: e.target.value }
                                })}
                                className="bg-primary/5 border border-primary/20 text-primary text-[10px] rounded-lg px-3 py-1.5 focus:outline-none placeholder:text-primary/30 w-full"
                              />

                              {hasChanges && (
                                <button 
                                  onClick={() => handleSaveOrderChanges(order.id)} 
                                  className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold py-1 px-3 rounded-lg hover:neon-glow transition-all w-full"
                                >
                                  Save Fulfillment Status
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-8 text-muted-foreground text-sm font-medium">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="glassmorphism p-6 rounded-3xl overflow-hidden flex flex-col min-h-[70vh] animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Flash Update Alerts</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Publish or edit flash headers visible to all store visitors.</p>
            </div>
            <button 
              onClick={() => {
                setEditingAnn(null);
                setNewAnn({ text: '', type: 'info', is_active: true });
                setIsAnnModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-102"
            >
              + Create Flash Update
            </button>
          </div>

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
                    onClick={() => {
                      setEditingAnn(ann);
                      setNewAnn({ text: ann.text, type: ann.type, is_active: ann.is_active });
                      setIsAnnModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black text-white rounded-lg transition-all text-xs font-bold"
                  >
                    Edit Update
                  </button>
                  <button 
                    onClick={() => handleAnnDelete(ann.id)} 
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-destructive hover:text-white text-white rounded-lg transition-all text-xs font-bold"
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
      </div> {/* Close print:hidden main dashboard container */}

      {/* Fulfillment Docket & Printable Packing Slip Overlay */}
      {selectedFulfillmentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity">
          {/* Print container configuration style */}
          <style>{`
            @media print {
              /* Hide all headers, navbars, footers, and other dashboard menus */
              nav, footer, header, .no-print, .print-hidden {
                display: none !important;
              }
              /* Eliminate modal backdrops and backgrounds */
              .fixed {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
              }
              .relative {
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              /* Print slips full width pure black-on-white text */
              #packing-slip-print-area {
                display: block !important;
                background: white !important;
                color: black !important;
                width: 100% !important;
                border: none !important;
                padding: 20px !important;
                margin: 0 !important;
              }
              #packing-slip-print-area * {
                color: black !important;
                border-color: #ddd !important;
                background: transparent !important;
              }
            }
          `}</style>
          
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setSelectedFulfillmentOrder(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
            {/* Action Bar (No Print) */}
            <div className="flex justify-between items-center no-print border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 font-sans tracking-tight">
                  Fulfillment Docket
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Aha Konaseema SweetVerse Logistics Manager</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-4 py-2 rounded-xl transition-all hover:scale-102 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  🖨️ Print Packing Slip
                </button>
                <button 
                  onClick={() => setSelectedFulfillmentOrder(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div id="packing-slip-print-area" className="flex flex-col gap-6 bg-white/5 text-white rounded-2xl p-6 border border-white/5 print:bg-white print:text-black print:border-none">
              
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b border-white/10 print:border-black/20 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-amber-500 print:text-black font-sans tracking-tight">
                    AHA KONASEEMA
                  </h2>
                  <p className="text-[10px] text-muted-foreground print:text-black/60 uppercase font-black tracking-widest mt-1">Sweets & Savories Fulfillment Slip</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white print:text-black">
                    ORDER ID: #{selectedFulfillmentOrder.id.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-muted-foreground print:text-black/60 mt-1">
                    Date Placed: {new Date(selectedFulfillmentOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10 print:border-black/20 text-xs">
                <div>
                  <h4 className="font-black text-amber-500 print:text-black uppercase tracking-wider mb-2 text-[10px]">Ship To Address</h4>
                  <div className="flex flex-col gap-1 text-muted-foreground print:text-black/80 font-medium">
                    <span className="font-black text-white print:text-black text-sm">
                      {selectedFulfillmentOrder.shipping_address?.firstName} {selectedFulfillmentOrder.shipping_address?.lastName}
                    </span>
                    <span>{selectedFulfillmentOrder.shipping_address?.address}</span>
                    <span>{selectedFulfillmentOrder.shipping_address?.city}, {selectedFulfillmentOrder.shipping_address?.postalCode}</span>
                    <span>{selectedFulfillmentOrder.shipping_address?.country || 'India'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-amber-500 print:text-black uppercase tracking-wider mb-2 text-[10px]">Logistics Info</h4>
                  <div className="flex flex-col gap-1 text-muted-foreground print:text-black/80 font-medium">
                    <span><strong>Carrier:</strong> Ghee Express Courier Service</span>
                    <span><strong>Origin:</strong> Ravulapalem Sweets Kitchen, AP</span>
                    <span><strong>Contact Email:</strong> {selectedFulfillmentOrder.users?.email || 'Guest Customer'}</span>
                    <span><strong>Status:</strong> {selectedFulfillmentOrder.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div className="flex flex-col gap-3">
                <h4 className="font-black text-amber-500 print:text-black uppercase tracking-wider text-[10px]">Order Details</h4>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 print:border-black/20 text-muted-foreground print:text-black/60 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2">Confection Item</th>
                      <th className="py-2 text-center">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFulfillmentOrder.order_items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 print:border-black/10 text-muted-foreground print:text-black/80">
                        <td className="py-2.5 font-bold text-white print:text-black">{item.products?.name}</td>
                        <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 text-right">₹{item.price_at_time}</td>
                        <td className="py-2.5 text-right font-bold text-white print:text-black">₹{item.quantity * item.price_at_time}</td>
                      </tr>
                    ))}
                    <tr className="text-white print:text-black font-bold">
                      <td colSpan="3" className="py-4 text-right uppercase font-black text-[10px]">Grand Payment Total</td>
                      <td className="py-4 text-right text-sm text-primary print:text-black font-black">₹{selectedFulfillmentOrder.total_amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quality Seal Checklist */}
              <div className="p-4 bg-white/5 print:bg-black/5 rounded-xl border border-white/5 print:border-black/10 flex flex-col gap-2 mt-2">
                <span className="text-[10px] text-amber-500 print:text-black font-black uppercase tracking-widest">
                  🛡️ AHA KONASEEMA QUALITY GUARANTEE SEAL
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] text-muted-foreground print:text-black/80 font-medium">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-amber-500" />
                    <span>Pure Milk Ghee Freshness verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-amber-500" />
                    <span>Vacuum Leakage protection sealed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-amber-500" />
                    <span>Konaseema branding seal attached</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal Overlay */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsProductModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10 shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                {editingProduct ? 'Edit Confection Product' : 'Add New Confection'}
              </h2>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white font-black"
              >
                ✕
              </button>
            </div>

            {status && <div className="bg-primary/20 text-primary p-3 rounded-lg text-sm">{status}</div>}
            
            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Product Name</label>
                <input name="name" placeholder="E.g. Ravulapalem Pure Ghee Kajjikayalu" value={formData.name} onChange={handleProductChange} required className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Price (₹ INR)</label>
                <input type="number" step="0.01" name="price" placeholder="E.g. 350.00" value={formData.price} onChange={handleProductChange} required className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white" />
              </div>

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
                        <span className="text-xs text-white font-semibold">Upload sweet photo</span>
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
                    className="bg-background border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary text-xs w-full text-white" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Description</label>
                <textarea name="description" placeholder="Describe the aroma, Ghee texture, and sweetness profile..." value={formData.description} onChange={handleProductChange} rows="3" className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white text-sm"></textarea>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Admin Sweet Badge Alert</label>
                <textarea name="admin_note" placeholder="Admin Note (Shows as a premium banner alert to customers on sweet card, e.g. 'Fresh Kitchen Arrival Today')" value={formData.admin_note} onChange={handleProductChange} rows="2" className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary placeholder:text-primary/50 text-primary text-sm font-semibold"></textarea>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer py-1">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleProductChange} className="accent-primary w-4 h-4" />
                Feature on Homepage Carousel
              </label>
              
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-102">
                  {editingProduct ? 'Update Confection' : 'Publish to Storefront'}
                </button>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flash Update Add / Edit Modal Overlay */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsAnnModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10 shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                {editingAnn ? 'Edit Flash Alert' : 'Create Flash Update Alert'}
              </h2>
              <button 
                onClick={() => setIsAnnModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white font-black"
              >
                ✕
              </button>
            </div>

            {annStatus && <div className="bg-primary/20 text-primary p-3 rounded-lg text-sm">{annStatus}</div>}
            
            <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Alert Message Text</label>
                <textarea 
                  name="text" 
                  placeholder="Type flash update message (e.g. ⚡ FLASH SALE: 20% OFF Ravulapalem Ghee Sweets today only!)" 
                  value={newAnn.text} 
                  onChange={(e) => setNewAnn({ ...newAnn, text: e.target.value })} 
                  required 
                  rows="3" 
                  className="bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white text-sm leading-relaxed"
                ></textarea>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Alert Styling Type</label>
                <select 
                  value={newAnn.type} 
                  onChange={(e) => setNewAnn({ ...newAnn, type: e.target.value })}
                  className="bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-white text-sm"
                >
                  <option value="info">Info Alert (Cyan Glow)</option>
                  <option value="success">Success / Promo (Green Glow)</option>
                  <option value="warning">Warning / Alert (Amber Glow)</option>
                  <option value="critical">Critical / Emergency (Red Glow)</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer py-1">
                <input 
                  type="checkbox" 
                  checked={newAnn.is_active} 
                  onChange={(e) => setNewAnn({ ...newAnn, is_active: e.target.checked })} 
                  className="accent-primary w-4 h-4" 
                />
                Make Active Immediately on Header Announcement Bar
              </label>
              
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-102">
                  {editingAnn ? 'Apply Flash Update Changes' : 'Publish Flash Announcement'}
                </button>
                <button type="button" onClick={() => setIsAnnModalOpen(false)} className="px-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
