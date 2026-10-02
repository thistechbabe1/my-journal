'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { identityService } from '@/services/identity-service';
import { LifeArea } from '@/types';

export function useLifeAreas() {
  const { user } = useAuth();
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    identityService.getLifeAreas(user.id).then(({ data }) => {
      if (isMounted) {
        setLifeAreas(data || []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { lifeAreas, loading };
}
