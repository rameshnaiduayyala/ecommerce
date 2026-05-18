import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getProducts } from '../api/products';
import { getStoreSettings } from '../api/admin';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const TRUST_BADGES = [
  { icon: '🐄', label: 'Pure Cattle Ghee', sub: '100% native cow' },
  { icon: '🔒', label: 'Vacuum Sealed', sub: 'Freshness locked in' },
  { icon: '🚚', label: 'Fast Delivery', sub: 'Pan India shipping' },
  { icon: '🏺', label: 'Since 1948', sub: 'Godavari Heritage' },
];

const WHY_US = [
  {
    num: '01',
    title: 'Pure Milk Ghee',
    desc: 'Every sweet is crafted using 100% pure milk ghee sourced directly from native Konaseema cattle — never adulterated.'
  },
  {
    num: '02',
    title: 'Zero Preservatives',
    desc: 'No artificial colours, flavours, or additives. What you taste is pure nature — exactly as our ancestors intended.'
  },
  {
    num: '03',
    title: 'Vacuum Sealed Freshness',
    desc: 'Our proprietary multi-layer vacuum sealing locks in aroma, taste and hygiene for weeks — delivered fresh every time.'
  },
  {
    num: '04',
    title: 'Generational Recipes',
    desc: 'Recipes perfected over 75 years, prepared in small artisanal batches by master sweet-makers in Konaseema daily.'
  },
];

const HERITAGE_STATS = [
  { value: '75+', label: 'Years of Heritage' },
  { value: '50+', label: 'Sweet Varieties' },
  { value: '10K+', label: 'Happy Families' },
  { value: '100%', label: 'Pure Ghee Guarantee' },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ hero_image_url: '', hero_use_carousel: false });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4500, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodData, allProds, settingsData] = await Promise.all([
          getFeaturedProducts(),
          getProducts(),
          getStoreSettings(),
        ]);
        setProducts(prodData || []);
        const cats = [...new Set((allProds || []).map(p => p.category).filter(Boolean))];
        setAllCategories(cats);
        if (settingsData) setSettings(settingsData);
      } catch (err) {
        console.error('Error fetching homepage details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const heroSlides = Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0
    ? settings.hero_slides
    : [
      {
        image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1920',
        title: 'Authentic Godavari Sweets',
        description: 'Experience the rich heritage of Konaseema with pure milk ghee confections.',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1920',
        title: 'Premium Quality',
        description: 'Prepared with utmost hygiene, vacuum sealed to lock in freshness.',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=1920',
        title: 'Festive Delights',
        description: 'Celebrate your special moments with handcrafted traditional treats.',
      },
    ];

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="flex flex-col">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#0f0505]">
        <div className="relative min-h-[580px] sm:min-h-[650px] md:min-h-[720px]">

          {/* Full background image (always visible) */}
          <div className="absolute inset-0 z-0">
            {(settings.hero_use_carousel && heroSlides.length > 0 ? heroSlides[selectedIndex] : null)?.image_url ? (
              <img
                key={selectedIndex}
                src={heroSlides[selectedIndex].image_url}
                alt={heroSlides[selectedIndex].title}
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <img
                src={settings.hero_image_url || 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1920'}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            )}
            {/* Dark gradient — stronger on left for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full container mx-auto px-6 md:px-12 flex flex-col justify-center py-20 md:py-28">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-amber-400">
                Aha Konaseema Specials
              </span>
              {settings.hero_use_carousel && heroSlides.length > 1 && (
                <span className="ml-auto text-[9px] font-black text-white/40 tracking-wider tabular-nums">
                  {String(selectedIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-serif font-black text-white leading-[1.04] mb-5 max-w-2xl drop-shadow-2xl">
              {settings.hero_use_carousel && heroSlides.length > 0
                ? heroSlides[selectedIndex]?.title || 'Authentic Godavari Sweets'
                : <>Authentic<br />Godavari Sweets</>
              }
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-white/75 font-medium leading-relaxed max-w-md mb-8">
              {settings.hero_use_carousel && heroSlides.length > 0
                ? heroSlides[selectedIndex]?.description || 'Experience the rich heritage of Konaseema with our premium confections made from pure organic cow ghee.'
                : 'Experience the rich heritage of Konaseema with our premium confections made from pure organic cow ghee.'
              }
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link to="/products" className="bg-primary hover:bg-amber-500 text-white font-black py-3.5 px-8 rounded-full transition-all duration-300 uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-0.5">
                Shop Now
              </Link>
              <Link to="/categories" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-3.5 px-8 rounded-full border border-white/25 transition-all duration-300 uppercase tracking-widest text-[10px] hover:-translate-y-0.5">
                Explore Categories
              </Link>
            </div>

            {/* Carousel controls */}
          </div>

          {/* Hidden embla container (for autoplay + API only) */}
          {settings.hero_use_carousel && heroSlides.length > 0 && (
            <div className="hidden" ref={emblaRef}>
              <div className="flex">
                {heroSlides.map((_, i) => <div key={i} className="flex-[0_0_100%]" />)}
              </div>
            </div>
          )}

          {/* ── BOTTOM CENTRE CONTROLS ── */}
          {settings.hero_use_carousel && heroSlides.length > 1 && (
            <div className="absolute bottom-7 left-0 right-0 z-20 flex items-center justify-center gap-4">
              {/* Prev arrow */}
              <button
                onClick={scrollPrev}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {scrollSnaps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${i === selectedIndex
                      ? 'w-8 h-2 bg-amber-400'
                      : 'w-2 h-2 bg-white/35 hover:bg-white/65'
                      }`}
                  />
                ))}
              </div>

              {/* Next arrow */}
              <button
                onClick={scrollNext}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}

          {/* Bottom decorative amber line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent z-10" />
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#9e1e23] to-black text-white py-6 px-4">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
        <div className="absolute right-0 top-0 w-60 h-60 bg-amber-400/10 rounded-full blur-[70px] pointer-events-none"></div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/15">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-3 py-3 md:py-0 md:px-6 first:md:pl-0 last:md:pr-0">
                <span className="text-2xl shrink-0 drop-shadow-sm">{b.icon}</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em]">{b.label}</p>
                  <p className="text-[9px] text-white/65 font-medium mt-0.5">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 mt-20 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-primary"></div>
              <span className="text-[9px] font-black tracking-[0.4em] uppercase text-primary">Hand Picked</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-[#222] leading-tight">
              Our Best<br />
              <span className="text-primary">Sellers</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed md:text-right">
              Crafted with absolute purity and love — the most cherished Godavari traditional delicacies.
            </p>
            <Link to="/products" className="shrink-0 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2.5 px-7 rounded-full transition-all uppercase tracking-widest text-xs">
              View All
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[420px] bg-black/5 rounded-3xl animate-pulse" />)
            : products.length > 0
              ? products.map(p => <ProductCard key={p.id} product={p} />)
              : <p className="text-muted-foreground col-span-full text-center py-16 bg-black/3 rounded-3xl border border-border/30">No featured products found in the database yet.</p>
          }
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ──────────────────────────────────────── */}
      {allCategories.length > 0 && (
        <section className="container mx-auto px-4 md:px-8 mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 bg-primary"></div>
                <span className="text-[9px] font-black tracking-[0.4em] uppercase text-primary">Collections</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-[#222] leading-tight">
                Shop by<br />
                <span className="text-primary">Category</span>
              </h2>
            </div>
            <Link to="/categories" className="shrink-0 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2.5 px-7 rounded-full transition-all uppercase tracking-widest text-xs self-start md:self-auto">
              All Categories
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allCategories.map((cat, idx) => {
              const catIcons = ['🍮', '🧆', '🍯', '🫙', '🍛', '🎁', '🍡', '🥮'];
              const catIcon = catIcons[idx % catIcons.length];
              return (
                <Link
                  key={cat}
                  to={`/categories`}
                  className="group relative bg-gradient-to-br from-[#fdf9f5] to-[#f5ede3] border border-border/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-500" />
                  <span className="text-3xl">{catIcon}</span>
                  <span className="text-xs font-black text-[#333] uppercase tracking-wider group-hover:text-primary transition-colors leading-snug">{cat}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── OUR SWEET TRADITIONS ──────────────────────────────────── */}
      <section className="mt-20 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">

          {/* Section heading above the split card */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 bg-primary"></div>
                <span className="text-[9px] font-black tracking-[0.4em] uppercase text-primary">Since 1948</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-[#222] leading-tight">
                Our Sweet<br />
                <span className="text-primary">Traditions</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed md:text-right">
              The story of Aha Konaseema is rooted in heritage, purity, and an unwavering commitment to the authentic taste of Godavari.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] rounded-3xl overflow-hidden shadow-2xl border border-border/30">

            {/* LEFT — Dark Heritage Panel */}
            <div className="relative bg-gradient-to-br from-[#1a0404] via-primary to-[#6e0f13] p-10 md:p-12 flex flex-col justify-between gap-10 text-white overflow-hidden">
              {/* Decorative patterns */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-[60px]"></div>
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-[60px]"></div>

              <div className="relative z-10">
                <span className="inline-block text-[9px] font-black tracking-[0.4em] uppercase text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/25 mb-6">
                  Our Sweet Traditions
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-black leading-tight mb-5">
                  Over 75 Years of<br />
                  <span className="text-amber-400">Pure Ghee</span> Tradition
                </h2>
                <p className="text-white/70 text-sm leading-relaxed font-medium max-w-xs">
                  From the fertile banks of the Godavari river, Aha Konaseema has been delivering the irreplaceable taste of authentic, handcrafted sweets since 1948.
                </p>
              </div>

              {/* Heritage Stats Grid */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {HERITAGE_STATS.map(s => (
                  <div key={s.label} className="bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-serif font-black text-amber-400 leading-none mb-1">{s.value}</p>
                    <p className="text-[10px] font-bold text-white/65 uppercase tracking-widest leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Signature */}
              <div className="relative z-10 border-t border-white/15 pt-5">
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Founded & Operated by</p>
                <p className="text-base font-serif font-black text-white mt-0.5">Ramesh Naidu Ayyala</p>
                <p className="text-[10px] text-amber-400/80 font-semibold tracking-wider">Ravulapalem, East Godavari, AP</p>
              </div>
            </div>

            {/* RIGHT — Feature Cards */}
            <div className="bg-[#faf7f3] p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
              {WHY_US.map((item, i) => (
                <div
                  key={item.num}
                  className="group relative bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className="text-3xl font-serif font-black text-[#f0e6e6] group-hover:text-primary/20 transition-colors leading-none select-none">
                      {item.num}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center border border-primary/15 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-serif font-black text-[#222] text-base mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── BANNER CTA ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 mt-20">
        <div className="relative bg-gradient-to-br from-primary via-[#9e1e23] to-black rounded-3xl overflow-hidden p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
          <div className="absolute right-0 top-0 w-72 h-72 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 text-center md:text-left">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-400 mb-3 block">Limited Time Offer</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black leading-tight mb-3">
              Free Shipping on<br />Orders Above ₹{settings.free_shipping_threshold || 2000}
            </h2>
            <p className="text-white/75 text-sm font-medium max-w-md">
              Order today and experience the premium taste of authentic Godavari ghee sweets delivered right to your doorstep.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link to="/products" className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-black py-4 px-10 rounded-full transition-all duration-300 uppercase tracking-widest text-xs shadow-xl hover:-translate-y-0.5">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
