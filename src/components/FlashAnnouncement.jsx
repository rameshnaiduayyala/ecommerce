import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const FlashAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();

    // Set up real-time listener for announcements updates
    const subscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const activeAnnouncements = announcements.filter(ann => !dismissedIds.includes(ann.id));

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeAnnouncements]);

  if (activeAnnouncements.length === 0) return null;

  const safeIndex = currentIndex >= activeAnnouncements.length ? 0 : currentIndex;
  const current = activeAnnouncements[safeIndex];

  // Futuristic, cyber-luxury theme styles based on update type
  const themeClasses = {
    info: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30 neon-glow-cyan',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-500/30 neon-glow-amber',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 neon-glow-emerald',
    critical: 'bg-red-950/80 text-red-400 border-red-500/30 neon-glow-red'
  };

  const glowStyles = {
    info: { boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)' },
    warning: { boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' },
    success: { boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' },
    critical: { boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)' }
  };

  return (
    <div 
      className={`w-full py-2.5 px-4 text-center text-xs font-semibold border-b tracking-wider transition-all duration-500 flex items-center justify-between relative overflow-hidden backdrop-blur-md ${themeClasses[current.type || 'info']}`}
      style={glowStyles[current.type || 'info']}
    >
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      <div className="flex-1 flex justify-center items-center gap-2 animate-pulse-slow relative z-10">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
        <p className="font-mono">{current.text}</p>
      </div>

      <button 
        onClick={() => {
          setDismissedIds(prev => [...prev, current.id]);
          setCurrentIndex(0);
        }} 
        className="opacity-60 hover:opacity-100 transition-opacity p-1 relative z-10"
        aria-label="Close Announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default FlashAnnouncement;
