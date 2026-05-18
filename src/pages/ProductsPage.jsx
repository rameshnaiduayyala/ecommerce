import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Dynamic categories from actual product data
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' ||
                            (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Page Banner */}
      <div className="bg-gradient-to-br from-primary via-[#85161b] to-black text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
        <div className="container mx-auto relative z-10">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-3 block">Aha Konaseema</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-3 leading-tight">All Products</h1>
          <p className="text-white/70 text-sm md:text-base max-w-xl">
            Discover our complete collection of handcrafted, authentic Godavari confections — made with pure milk ghee.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8">
        {/* Search + Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search sweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-full bg-white text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Result count */}
          {!loading && (
            <span className="text-xs font-bold text-muted-foreground bg-black/5 px-3 py-2 rounded-full border border-border/30 shrink-0">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Category Pills */}
        {!loading && categories.length > 1 && (
          <div className="flex gap-2.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest border transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[380px] bg-black/5 rounded-3xl animate-pulse" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-black/[0.02] rounded-3xl border border-border/30">
              <span className="text-4xl mb-3 block">🍬</span>
              <p className="text-muted-foreground font-semibold">No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

