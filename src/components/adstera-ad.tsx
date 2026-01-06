'use client';

import React, { useEffect, useRef } from 'react';

interface AdsteraAdProps {
  adKey: string;
  width: number;
  height: number;
}

export function AdsteraAd({ adKey, width, height }: AdsteraAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      
      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;

      adRef.current.innerHTML = '';
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(adScript);
    }
  }, [adKey, width, height]);

  return <div ref={adRef} className="flex justify-center items-center my-4" />;
}
