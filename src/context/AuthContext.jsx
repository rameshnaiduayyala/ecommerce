import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session) => {
      const currentUser = session?.user ?? null;
      
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .single();
          
        console.log("Supabase Auth Fetch:", { data, error, currentUser });
          
        if (data?.role === 'admin' || 
            currentUser.email === 'admin@sweetverse.com' || 
            currentUser.email === 'ayyalarameshnaidu@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setIsAdmin(
          currentUser.email === 'admin@sweetverse.com' || 
          currentUser.email === 'ayyalarameshnaidu@gmail.com'
        );
      }
      
      setUser(currentUser);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    signOut: () => supabase.auth.signOut(),
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
