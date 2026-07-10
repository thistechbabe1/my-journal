'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/growth/reviews');
  }, [router]);
  return null;
}
