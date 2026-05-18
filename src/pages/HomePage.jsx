import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts } from '../api/products';
import { getStoreSettings } from '../api/admin';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ hero_image_url: '', hero_use_carousel: false, hero_carousel_urls: '' });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4500, stopOnInteraction: false })]);

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
          image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1920',
          title: 'Authentic Sweets',
          description: 'Experience the rich heritage of Godavari with our pure ghee confections.'
        },
        {
          image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1920',
          title: 'Premium Quality',
          description: 'Prepared with utmost hygiene and vacuum sealed to lock in freshness.'
        },
        {
          image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=1920',
          title: 'Festive Delights',
          description: 'Celebrate your special moments with our handcrafted traditional treats.'
        }
      ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section - Full width carousel */}
      <section className="relative w-full h-[600px] md:h-[700px] bg-[#f5f5f5] overflow-hidden group">
        {settings.hero_use_carousel && heroSlides.length > 0 ? (
          <>
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {heroSlides.map((slide, index) => (
                  <div key={index} className="relative flex-[0_0_100%] min-w-0 h-full flex items-center">
                    <img 
                      src={slide.image_url} 
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div> {/* overlay */}
                    
                    <div className="container mx-auto px-4 md:px-8 relative z-20 flex justify-start">
                      <div className="md:w-[70%] lg:w-[60%] flex flex-col items-start text-left text-white ml-0 md:ml-8 lg:ml-16">
                        <span className="text-sm font-bold tracking-[0.3em] uppercase mb-4 text-primary bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">Aha Konaseema Specials</span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 drop-shadow-2xl leading-tight">
                          {slide.title || 'Authentic Sweets'}
                        </h1>
                        <p className="text-lg md:text-2xl font-medium mb-10 drop-shadow-xl text-white/90">
                          {slide.description || 'Experience the rich heritage of Godavari with our pure ghee confections.'}
                        </p>
                        <Link to="/products" className="bg-primary hover:bg-black text-white font-bold py-4 px-10 rounded-full transition-all duration-300 uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1">
                          Explore Collection
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 z-30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 z-30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === selectedIndex 
                      ? 'w-10 h-2 bg-primary' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={settings.hero_image_url || "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1920"} 
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="container mx-auto px-4 md:px-8 relative z-20 flex justify-start">
              <div className="md:w-[70%] lg:w-[60%] flex flex-col items-start text-left text-white ml-0 md:ml-8 lg:ml-16">
                <span className="text-sm font-bold tracking-[0.3em] uppercase mb-4 text-primary bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">Aha Konaseema Specials</span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 drop-shadow-2xl leading-tight">
                  Authentic <br />Godavari Sweets
                </h1>
                <p className="text-lg md:text-2xl font-medium mb-10 drop-shadow-xl text-white/90">
                  Experience the rich heritage of Konaseema with our premium confections made from pure organic cow ghee.
                </p>
                <Link to="/products" className="bg-primary hover:bg-black text-white font-bold py-4 px-10 rounded-full transition-all duration-300 uppercase tracking-widest text-sm shadow-xl hover:-translate-y-1">
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-8 mt-24 mb-16">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-black shimmer-text mb-4 relative inline-block">
            Our Best Sellers
            {/* Floral/Leaf Accent (Placeholder) */}
            <svg className="absolute -top-6 -right-8 w-8 h-8 text-primary opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/><path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4h-2.1c-.46-2.28-2.48-4-4.9-4s-4.44 1.72-4.9 4H4v2h2v10h12V9h2V7z"/></svg>
          </h2>
          <p className="text-muted-foreground max-w-2xl">Discover our most loved and cherished Godavari traditional delicacies, crafted with absolute purity and love.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[420px] bg-black/5 rounded-3xl animate-pulse"></div>
            ))
          ) : products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No featured products found in the database.</p>
          )}
        </div>
        
        <div className="flex justify-center mt-12">
          <Link to="/products" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-10 rounded-full transition-all uppercase tracking-widest text-xs">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
