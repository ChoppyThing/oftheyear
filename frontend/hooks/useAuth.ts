'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isVerified: boolean;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = getCookie('authToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        setIsLoading(false);
        return;
      }

      const url = `${apiUrl}/user/me`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });


      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        document.cookie = 'authToken=; path=/; max-age=0';
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    document.cookie = 'authToken=; path=/; max-age=0';
    setUser(null);
  };

  return { user, isLoading, logout, refetch: checkAuth };
}
