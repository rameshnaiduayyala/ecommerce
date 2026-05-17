import { supabase } from '../supabase/client';

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) throw error;
  return data;
};

export const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4);
    
  if (error) throw error;
  return data;
};

export const addProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
    
  if (error) throw error;
  return data;
};
