const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive neon-glow mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Void Reached</h2>
      <p className="text-muted-foreground max-w-md mb-8">The dessert you are looking for has been consumed by a black hole or doesn't exist in this universe.</p>
      <a href="/" className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all hover:neon-glow">
        Return to Base
      </a>
    </div>
  );
};

export default NotFoundPage;
