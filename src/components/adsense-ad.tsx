
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdsenseAdProps {
  adClient: string;
  adSlot: string;
  style?: React.CSSProperties;
  adFormat?: string;
  fullWidthResponsive?: string;
}

export function AdsenseAd({
  adClient,
  adSlot,
  style,
  adFormat = 'auto',
  fullWidthResponsive = 'false',
}: AdsenseAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    ></ins>
  );
}
