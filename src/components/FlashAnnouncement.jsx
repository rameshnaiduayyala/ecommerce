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

  return (
    <div 
      className="bg-primary text-white text-[10px] sm:text-xs font-bold text-center py-2 px-4 uppercase tracking-wider transition-all duration-500 flex items-center justify-center relative overflow-hidden"
    >
      <div className="flex-1 flex justify-center items-center gap-2">
        <p className="font-sans">{current.text}</p>
      </div>

      <button 
        onClick={() => {
          setDismissedIds(prev => [...prev, current.id]);
          setCurrentIndex(0);
        }} 
        className="absolute right-4 opacity-60 hover:opacity-100 transition-opacity p-1 z-10"
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
