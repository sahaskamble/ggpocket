'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Wrapper({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLimitedUser } = useAuth();

    useEffect(() => {
        // Handle routing based on user role
        if (user) {
            if (isLimitedUser() && !pathname.startsWith('/booking')) {
                router.push('/booking');
            }
        } else if (pathname !== '/login') {
            router.push('/login');
        }
    }, [pathname, user, isLimitedUser, router]);

    return children;
}