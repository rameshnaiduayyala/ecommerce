import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 glassmorphism mt-20">
      <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left items-center md:items-start">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Aha Konaseema Logo" className="w-8 h-8 object-contain" />
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">Aha Konaseema</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">Experience authentic Indian sweets & savories from the heart of Konaseema.</p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Aha Konaseema. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
