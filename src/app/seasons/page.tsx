'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeasonsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/identity/seasons');
  }, [router]);
  return null;
}
