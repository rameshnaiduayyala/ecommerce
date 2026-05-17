import logoImg from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 glassmorphism mt-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Box */}
          <div className="flex flex-col gap-4 text-left items-start">
            <div className="flex items-center gap-2.5">
              <img 
                src={logoImg} 
                alt="Aha Konaseema Logo" 
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse" 
              />
              <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 font-sans">
                Aha Konaseema
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Experience the true taste of Andhra heritage. Pure ghee sweets and crispy savories made from generations-old family recipes in the heart of Konaseema.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore links */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-black text-white tracking-widest uppercase">Explore Shop</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-amber-500 transition-colors w-fit">Authentic Sweets</Link>
              <Link to="/products" className="hover:text-amber-500 transition-colors w-fit">Savory Hot Mixtures</Link>
              <Link to="/products" className="hover:text-amber-500 transition-colors w-fit">Special Festive Hampers</Link>
              <Link to="/categories" className="hover:text-amber-500 transition-colors w-fit">Explore Categories</Link>
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-black text-white tracking-widest uppercase">Customer Care</h4>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/orders" className="hover:text-amber-500 transition-colors w-fit">Track My Order</Link>
              <a href="#" className="hover:text-amber-500 transition-colors w-fit">Shipping & Ghee Fresh Delivery</a>
              <a href="#" className="hover:text-amber-500 transition-colors w-fit">Ingredients Promise</a>
              <a href="#" className="hover:text-amber-500 transition-colors w-fit">Get Support</a>
            </div>
          </div>

          {/* Column 4: Contact & Promise */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-black text-white tracking-widest uppercase">Our Promise</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every confection is hand-crafted with pure milk ghee, zero artificial additives, and absolute love in Godavari.
            </p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
              <span className="font-bold text-white flex items-center gap-1">
                📍 Head Kitchens:
              </span>
              <span>Ravulapalem, East Godavari District,</span>
              <span>Andhra Pradesh - 533238</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} Aha Konaseema. Crafted with Godavari Heritage.
          </div>
          <div className="flex gap-8 text-xs">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
