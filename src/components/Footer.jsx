import logoImg from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-16 w-full">
      {/* Top Red Section - Traditions */}
      <div className="bg-primary text-white py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12">Our Sweet Traditions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4">
              <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3" />
                <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4h-2.1c-.46-2.28-2.48-4-4.9-4s-4.44 1.72-4.9 4H4v2h2v10h12V9h2V7z" />
              </svg>
              <h3 className="text-xl font-serif font-bold">Traditional</h3>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                From humble beginnings in a small town to a beloved household name. We have been crafting traditional Indian delicacies with love and expertise for generations. Each sweet tells a story of heritage, flavor, and sweet memories.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-4">
              <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8c-.6 0-1 .4-1 1v4H6V9c0-.6-.4-1-1-1s-1 .4-1 1v11h16V9c0-.6-.4-1-1-1zm-6-3c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" />
              </svg>
              <h3 className="text-xl font-serif font-bold">Purity</h3>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                Crafted with purity and tradition, our sweets are made with our finest cattle ghee, ensuring each bite is a taste of pure bliss.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-4">
              <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
              <h3 className="text-xl font-serif font-bold">Social Responsibility</h3>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                We not only delighted taste buds but also nurtured minds. By establishing schools and colleges for students, we embody a commitment to uplift the community and pave the way for a brighter future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="bg-[#fcfafa] py-16 px-4 md:px-8 border-t border-border">
        <div className="container mx-auto">
          {/* Top of bottom footer */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-16 pb-8 border-b border-black/5">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white rounded-full w-20 h-20 flex flex-col items-center justify-center border-2 border-white shadow-[0_0_0_2px_theme(colors.primary)] shrink-0">
                <span className="text-[6px] tracking-widest font-serif italic">Since 1948</span>
                <span className="text-[10px] font-black font-serif tracking-tight text-center leading-tight">AHA<br />KONASEEMA</span>
              </div>
              <div className="max-w-xs">
                <h4 className="text-primary font-bold text-xs tracking-wider mb-2 uppercase">A Sweet Tradition</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rooted in our sweet traditions, we draw inspiration from the cherished practices of our ancestors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-muted-foreground tracking-widest">FOLLOW US</span>
              <div className="flex gap-2">
                {['fb', 'ig', 'in', 'wa'].map((social, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#4a4a4a] text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                    <span className="text-[10px] font-bold uppercase">{social}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-muted-foreground tracking-wider uppercase mb-2">Products</h4>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">All Products</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Cake and Cookie Treats</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Classic Baklavas</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Jaggery Sweets</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Khara & Snacks</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-muted-foreground tracking-wider uppercase mb-2">Shop Online</h4>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Pan India</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">International</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Hyderabad</Link>
              <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">Store Locations</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-muted-foreground tracking-wider uppercase mb-2">Quick Links</h4>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Contact Us</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Store Locations</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Gifting</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Brand Gallery</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-muted-foreground tracking-wider uppercase mb-2">Policies</h4>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Terms and Conditions</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Shipping Policy</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Payment Policy</Link>
              <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Refund Policy</Link>
            </div>

            <div className="flex flex-col gap-8 col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl font-serif font-bold text-[#333] mb-2">Corporate Office</h4>
                <p className="text-sm font-bold text-[#333]">Aha Konaseema Sweets</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span>🏢</span>
                  <p>Ravulapalem, East Godavari District, Andhra Pradesh - 533238</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <span>📞</span>
                  <p>+91 9988776655</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>✉️</span>
                  <p>support@ahakonaseema.com</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-xl font-serif font-bold text-[#333] mb-2">Customer Care</h4>
                <a href="tel:+919988776655" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors flex items-center gap-2 w-fit">
                  📞 +91 9988776655
                </a>
                <a href="mailto:support@ahakonaseema.com" className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-4 rounded transition-colors flex items-center gap-2 w-fit">
                  ✉️ support@ahakonaseema.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright & Developer Bar */}
          <div className="border-t border-black/5 mt-16 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Aha Konaseema. All Rights Reserved.</p>
            <p className="flex items-center gap-1 font-medium">
              Designed & Developed with <span className="text-primary animate-pulse">❤️</span> by{' '}
              <a
                href="https://rameshayyala.online"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:text-primary transition-colors border-b border-dashed border-foreground/30 hover:border-primary pb-0.5"
              >
                Ramesh Naidu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
