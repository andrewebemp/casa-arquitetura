'use client';

import { BeforeAfterSlider } from '@/components/molecules/BeforeAfterSlider';

interface PublicSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export function PublicSlider({ beforeUrl, afterUrl }: PublicSliderProps) {
  return (
    <BeforeAfterSlider
      beforeUrl={beforeUrl}
      afterUrl={afterUrl}
      className="aspect-video w-full"
    />
  );
}
