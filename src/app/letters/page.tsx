'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LettersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/library/letters');
  }, [router]);
  return null;
}
