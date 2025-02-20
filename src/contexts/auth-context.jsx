"use client";

import { createContext, useContext, useState } from "react";
import pb from "@/lib/db";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('user') || '{}');
        }
        return null;
    });

    const isLimitedUser = (currentUser = user) => {
        return currentUser?.role === 'Staff' || currentUser?.role === 'StoreManager';
    };

    const login = async (email, password) => {
        try {
            const auth = await pb.collection("users").authWithPassword(email, password);
            const userData = {
                id: auth.record.id,
                username: auth.record.username,
                email: auth.record.email,
                role: auth.record.role,
                avatar: auth.record.avatar,
            };

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            pb.authStore.clear();
            localStorage.removeItem("user");
            setUser(null);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLimitedUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
