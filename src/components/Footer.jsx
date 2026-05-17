const Footer = () => {
  return (
    <footer className="border-t border-white/10 glassmorphism mt-20">
      <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">SweetVerse</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Experience the future of luxury desserts. Premium sweets for premium moments.</p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SweetVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
