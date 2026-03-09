'use client';

import { useEffect, useState } from 'react';
import type { DiagnosticResponse } from '@decorai/shared';
import { DiagnosticResult } from '@/components/organisms/DiagnosticResult';
import { createClient } from '@/lib/supabase/client';

interface DiagnosticResultViewProps {
  data: DiagnosticResponse;
}

export function DiagnosticResultView({ data }: DiagnosticResultViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPaidTier, setHasPaidTier] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: authData }) => {
      setIsAuthenticated(!!authData.user);
      const tier = authData.user?.user_metadata?.tier;
      setHasPaidTier(tier === 'pro' || tier === 'business');
    });
  }, []);

  return (
    <DiagnosticResult
      result={data}
      isAuthenticated={isAuthenticated}
      hasPaidTier={hasPaidTier}
    />
  );
}
