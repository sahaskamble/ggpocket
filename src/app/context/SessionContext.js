'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { pb, isUserValid, getCurrentUser } from '@/app/lib/db';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState(null);

  useEffect(() => {
    // Listen to authentication state changes
    pb.authStore.onChange(() => {
      setUser(getCurrentUser());
    });

    // Check if we have a valid session on load
    const loadSession = async () => {
      try {
        if (pb.authStore.isValid) {
          await pb.collection('users').authRefresh();
          setUser(getCurrentUser());
        }
      } catch (error) {
        console.error('Auth refresh failed:', error);
        pb.authStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (username, password, branchId) => {
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      
      // Create a login record
      await pb.collection('staff_logins').create({
        user_id: authData.record.id,
        branch_id: branchId,
        login_time: new Date().toISOString(),
        status: 'active'
      });

      // Fetch user data with branch info
      const userData = await pb.collection('users').getOne(authData.record.id, {
        expand: 'role,branch_id'
      });

      setCurrentBranch(branchId);
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Update the login record status
      const activeLogin = await pb.collection('staff_logins').getFirstListItem(
        pb.filter('user_id = {:user} && status = "active"', {
          user: user.id
        })
      );

      if (activeLogin) {
        await pb.collection('staff_logins').update(activeLogin.id, {
          status: 'completed',
          logout_time: new Date().toISOString()
        });
      }

      await pb.authStore.clear();
      setCurrentBranch(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      pb.authStore.clear();
      window.location.href = '/login';
    }
  };

  // Method to update user profile
  const updateProfile = async (data) => {
    try {
      const updated = await pb.collection('users').update(user.id, data);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Method to check specific permissions
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return (
    <SessionContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      updateProfile,
      hasPermission,
      isAuthenticated: isUserValid(),
      currentBranch,
      setCurrentBranch
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext); 