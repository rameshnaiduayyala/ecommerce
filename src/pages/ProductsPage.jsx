import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">Discover our complete collection of futuristic confections.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="glassmorphism flex-1 md:w-64 px-4 py-2 rounded-full focus:outline-none focus:border-primary/50 text-sm"
          />
          <select className="glassmorphism px-4 py-2 rounded-full focus:outline-none text-sm appearance-none bg-background cursor-pointer">
            <option>All Categories</option>
            <option>Macarons</option>
            <option>Truffles</option>
            <option>Pastries</option>
            <option>Cakes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[420px] glassmorphism rounded-2xl animate-pulse"></div>
          ))
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-20">No products found in the database.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
