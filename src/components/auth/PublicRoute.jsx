'use client';

import { useEffect } from 'react';
import { useSession } from '@/app/context/SessionContext';
import { useRouter } from 'next/navigation';

export default function PublicRoute({ children }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return children;
} 