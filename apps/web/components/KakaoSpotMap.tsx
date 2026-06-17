'use client';

import { useEffect, useRef, useState } from 'react';

type SpotMapItem = {
  name: string;
  region: string;
  typeLabel: string;
  iconLabel?: string;
  lat: number;
  lng: number;
  mapUrl?: string;
};

type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoMapInstance = {
  setBounds(bounds: unknown): void;
};

type KakaoMaps = {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => { extend(latlng: KakaoLatLng): void };
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Marker: new (options: { map: KakaoMapInstance; position: KakaoLatLng; title?: string }) => unknown;
  CustomOverlay: new (options: { map: KakaoMapInstance; position: KakaoLatLng; content: string; yAnchor?: number }) => unknown;
};

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
    __bathtimeKakaoMapSdkLoading?: Promise<void>;
  }
}

function loadKakaoMapSdk(appKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.kakao?.maps) {
    return new Promise((resolve) => window.kakao?.maps?.load(resolve));
  }
  if (window.__bathtimeKakaoMapSdkLoading) return window.__bathtimeKakaoMapSdkLoading;

  window.__bathtimeKakaoMapSdkLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao?.maps?.load(resolve);
    script.onerror = () => reject(new Error('Kakao Map SDK load failed'));
    document.head.appendChild(script);
  });

  return window.__bathtimeKakaoMapSdkLoading;
}

function overlayContent(item: SpotMapItem): string {
  const label = item.iconLabel ?? item.typeLabel.slice(0, 2);
  return `<div class="spot-map-marker"><span>${label}</span><strong>${item.name}</strong></div>`;
}

export function KakaoSpotMap({
  title,
  description,
  items,
}: {
  title?: string;
  description?: string;
  items: SpotMapItem[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'missing-key' | 'failed'>('idle');
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY?.trim();

  useEffect(() => {
    if (!appKey) {
      setStatus('missing-key');
      return;
    }
    const validItems = items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    if (!containerRef.current || validItems.length === 0) return;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.kakao?.maps) return;

        const { maps } = window.kakao;
        const center = new maps.LatLng(validItems[0].lat, validItems[0].lng);
        const map = new maps.Map(containerRef.current, { center, level: 13 });
        const bounds = new maps.LatLngBounds();

        validItems.forEach((item) => {
          const position = new maps.LatLng(item.lat, item.lng);
          bounds.extend(position);
          new maps.Marker({ map, position, title: item.name });
          new maps.CustomOverlay({
            map,
            position,
            content: overlayContent(item),
            yAnchor: 1.35,
          });
        });

        map.setBounds(bounds);
        setStatus('ready');
      })
      .catch(() => setStatus('failed'));

    return () => {
      cancelled = true;
    };
  }, [appKey, items]);

  return (
    <section className="spot-map-block">
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      <div className="spot-map-canvas" ref={containerRef}>
        {status === 'missing-key' ? <span>지도 키가 등록되면 후보 분포가 표시됩니다.</span> : null}
        {status === 'failed' ? <span>지도를 불러오지 못했습니다. 후보 카드의 지도 링크를 이용해주세요.</span> : null}
      </div>
      <div className="spot-map-link-row">
        {items.slice(0, 6).map((item) => (
          <a key={`${item.region}-${item.name}`} href={item.mapUrl ?? `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer">
            {item.name}
          </a>
        ))}
      </div>
    </section>
  );
}
