import { supabase } from '../supabase/client';

// Product APIs
export const getAdminProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// Order APIs
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users(email, full_name),
      order_items(quantity, price_at_time, products(name))
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteOrder = async (id) => {
  // First delete associated order_items to avoid foreign key constraint errors
  const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
  if (itemsError) throw itemsError;

  // Then delete the order
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
};

// Settings APIs
export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default_settings').single();
  if (error) throw error;
  return data;
};

export const updateStoreSettings = async (updates) => {
  const payload = { id: 'default_settings', ...updates };
  const { data, error } = await supabase.from('store_settings').upsert(payload).select();
  if (error) throw error;
  return data;
};

// Announcement APIs
export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addAnnouncement = async (announcement) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select();
  if (error) throw error;
  return data;
};

export const updateAnnouncement = async (id, updates) => {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};

export const deleteAnnouncement = async (id) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Coupons APIs
export const getCoupons = async () => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addCoupon = async (coupon) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([coupon])
    .select();
  if (error) throw error;
  return data;
};

export const deleteCoupon = async (code) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('code', code);
  if (error) throw error;
};

export const validateCoupon = async (code) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
};
