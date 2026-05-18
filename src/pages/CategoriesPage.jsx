import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import ProductCard from '../components/ProductCard';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const allProds = prods || [];
        setProducts(allProds);
        // Extract unique categories
        const cats = [...new Set(allProds.map(p => p.category).filter(Boolean))];
        setCategories(cats);
        if (cats.length > 0) setSelected(cats[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = selected ? products.filter(p => p.category === selected) : products;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-[#85161b] to-black text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
        <div className="container mx-auto relative z-10">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-3 block">Our Collection</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-3 leading-tight">Shop by Category</h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg">Explore traditional Godavari confections organized by their delicious type and heritage.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12">
        {/* Category Tabs */}
        {loading ? (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-28 rounded-full bg-black/5 animate-pulse shrink-0" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest border transition-all duration-200 ${
                  selected === cat
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[380px] bg-black/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl font-serif font-black text-[#222]">{selected}</span>
              <span className="text-xs font-bold text-muted-foreground bg-black/5 px-3 py-1 rounded-full">{filtered.length} items</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-black/3 rounded-3xl border border-border/30">
            <span className="text-4xl mb-4 block">🍬</span>
            <p className="text-muted-foreground font-semibold">No products found in this category yet.</p>
            <Link to="/products" className="mt-6 inline-block text-primary font-bold text-sm hover:underline">Browse all products →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
