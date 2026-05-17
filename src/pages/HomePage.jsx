import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts } from '../api/products';
import { getStoreSettings } from '../api/admin';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ hero_image_url: '', hero_use_carousel: false, hero_carousel_urls: '' });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchProductsAndSettings = async () => {
      try {
        const [prodData, settingsData] = await Promise.all([
          getFeaturedProducts(),
          getStoreSettings()
        ]);
        setProducts(prodData || []);
        if (settingsData) setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching homepage details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndSettings();
  }, []);

  const heroSlides = Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0 
    ? settings.hero_slides 
    : [
        {
          image_url: 'https://placehold.co/600x600/1E1E1E/8B5CF6?text=Quantum+Macaron',
          title: 'Quantum Macaron',
          description: 'Multi-dimensional luxury confectionery prepared with freeze-dried star dust.'
        },
        {
          image_url: 'https://placehold.co/600x600/1E1E1E/06B6D4?text=Nebula+Truffle',
          title: 'Nebula Truffle',
          description: 'Slow-churned dark cocoa layers infused with premium zero-gravity ganache.'
        },
        {
          image_url: 'https://placehold.co/600x600/1E1E1E/EC4899?text=Supernova+Cake',
          title: 'Supernova Cake',
          description: 'Explosive pink raspberry sponge enveloped in a decadent mirror-glaze shield.'
        }
      ];

  useEffect(() => {
    if (!settings.hero_use_carousel || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [settings.hero_use_carousel, heroSlides.length]);

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-blob mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6 text-center md:text-left min-h-[350px] justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 w-fit mx-auto md:mx-0 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-primary">New Cyber Collection Out Now</span>
            </div>

            {settings.hero_use_carousel ? (
              <div className="relative min-h-[220px]">
                {heroSlides.map((slide, index) => {
                  const titleWords = slide.title ? slide.title.split(' ') : ['Future', 'Sweet'];
                  const firstWord = titleWords[0];
                  const remainingWords = titleWords.slice(1).join(' ') || 'Confection';

                  return (
                    <div 
                      key={index} 
                      className={`transition-all duration-1000 transform absolute inset-x-0 top-0 ${
                        index === activeSlide 
                          ? 'opacity-100 translate-y-0 z-10' 
                          : 'opacity-0 translate-y-4 z-0 pointer-events-none'
                      }`}
                    >
                      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        {firstWord} <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-500">
                          {remainingWords}
                        </span>
                      </h1>
                      <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mt-4 leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                  Taste the <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-500">Future of Sweet</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mt-4 leading-relaxed">
                  Experience our luxury dessert boutique where culinary art meets cyberpunk aesthetics. Handcrafted confections for the modern connoisseur.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <Link to="/products" className="px-8 py-4 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all hover:neon-glow hover:-translate-y-1">
                Explore Menu
              </Link>
              <Link to="/categories" className="px-8 py-4 rounded-full glassmorphism font-bold hover:bg-white/5 transition-all hover:-translate-y-1">
                View Categories
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-lg aspect-square">
             {/* 3D-like Hero Image Container */}
             <div className="w-full h-full glassmorphism rounded-full p-8 border border-white/10 relative overflow-hidden animate-[float_6s_ease-in-out_infinite] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full z-10 pointer-events-none"></div>
                
                {settings.hero_use_carousel && heroSlides.length > 0 ? (
                  heroSlides.map((slide, index) => (
                    <img 
                      key={index} 
                      src={slide.image_url} 
                      alt={slide.title} 
                      className={`absolute inset-0 w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-opacity duration-1000 ${
                        index === activeSlide ? 'opacity-100 z-0' : 'opacity-0'
                      }`} 
                    />
                  ))
                ) : (
                  <img 
                    src={settings.hero_image_url || "https://placehold.co/600x600/1E1E1E/8B5CF6?text=3D+Dessert"} 
                    alt="Featured Dessert" 
                    className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
                  />
                )}
             </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Delights</h2>
            <p className="text-muted-foreground">Our most sought-after quantum confections.</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
            View all <span className="text-xl">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[420px] glassmorphism rounded-2xl animate-pulse"></div>
            ))
          ) : products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">No featured products found in the database.</p>
          )}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container mx-auto px-4">
        <div className="glassmorphism rounded-3xl p-10 md:p-20 text-center relative overflow-hidden border border-primary/20">
          <div className="absolute inset-0 animated-gradient-bg opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6">
            <h2 className="text-3xl md:text-5xl font-bold">Join the SweetVerse</h2>
            <p className="text-muted-foreground text-lg">Subscribe for exclusive access to limited-edition drops and futuristic flavor profiles.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <input type="email" placeholder="Enter your email" className="flex-1 bg-background/50 border border-white/10 rounded-full px-6 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-md" />
              <button className="bg-primary text-white font-bold rounded-full px-8 py-4 hover:bg-primary/90 transition-all hover:neon-glow whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
