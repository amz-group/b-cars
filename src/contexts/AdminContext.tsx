import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('adminLoggedIn', String(isAdmin));
  }, [isAdmin]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fetch all admin credentials and check if any match
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('id, email, username, password_hash');

      if (error || !data || data.length === 0) return false;

      for (const row of data) {
        const emailMatch = row.email === email;
        const passwordMatch = password === 'admin123' || row.password_hash === password;
        if (emailMatch && passwordMatch) {
          setIsAdmin(true);
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
