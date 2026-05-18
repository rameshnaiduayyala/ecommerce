import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products dynamically
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || 
                            (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
                            
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12 retro-grid-bg min-h-screen relative">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black shimmer-text tracking-tight pb-1 mb-2">All Products</h1>
          <p className="text-muted-foreground">Discover our complete collection of traditional & authentic confections.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glassmorphism flex-1 md:w-64 px-4 py-2 rounded-full focus:outline-none focus:border-primary/50 text-sm bg-background/30"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glassmorphism px-4 py-2 rounded-full focus:outline-none text-sm bg-background cursor-pointer text-foreground border border-border"
          >
            <option value="All Categories">All Categories</option>
            <option value="Macarons">Macarons</option>
            <option value="Truffles">Truffles</option>
            <option value="Pastries">Pastries</option>
            <option value="Cakes">Cakes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[320px] glassmorphism rounded-2xl animate-pulse"></div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-20 bg-black/5 rounded-2xl border border-white/5">
            No products found matching your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
