'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import type { OnsenMapPoint } from '@web/lib/onsenMap';
import styles from './results.module.css';

type OnsenResultsMapProps = {
  points: OnsenMapPoint[];
  resizeSignal: number;
  onSelectPoint: (targetId: string) => void;
};

const koreanFirstName = [
  'coalesce',
  ['get', 'name:ko'],
  ['get', 'name_ko'],
  ['get', 'name_en'],
  ['get', 'name:en'],
  ['get', 'name'],
  ['get', 'name:latin'],
];

export function OnsenResultsMap({ points, resizeSignal, onSelectPoint }: OnsenResultsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let disposed = false;

    async function initializeMap() {
      if (!containerRef.current || points.length === 0) {
        setStatus('ready');
        return;
      }

      try {
        const maplibregl = await import('maplibre-gl');
        if (disposed || !containerRef.current) return;

        const map = new maplibregl.Map({
          attributionControl: false,
          center: [137.2, 36.4],
          container: containerRef.current,
          keyboard: true,
          localIdeographFontFamily: 'Pretendard, "Noto Sans KR", sans-serif',
          scrollZoom: false,
          style: 'https://tiles.openfreemap.org/styles/bright',
          zoom: 4.4,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        const bounds = new maplibregl.LngLatBounds();
        for (const point of points) {
          const markerElement = document.createElement('button');
          markerElement.type = 'button';
          markerElement.className = styles.mapMarker;
          markerElement.textContent = String(point.count);
          markerElement.dataset.pointId = point.id;
          markerElement.setAttribute('aria-label', `${point.label} ${point.count}곳`);

          const popupContent = document.createElement('div');
          const popupTitle = document.createElement('strong');
          const popupCount = document.createElement('span');
          popupContent.className = styles.mapPopup;
          popupTitle.textContent = point.label;
          popupCount.textContent = `${point.count}곳`;
          popupContent.append(popupTitle, popupCount);

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: true,
            focusAfterOpen: false,
            offset: 18,
          }).setDOMContent(popupContent);
          const marker = new maplibregl.Marker({ element: markerElement })
            .setLngLat([point.longitude, point.latitude])
            .setPopup(popup)
            .addTo(map);

          markerElement.addEventListener('click', () => onSelectPoint(point.targetId));
          markersRef.current.push(marker);
          bounds.extend([point.longitude, point.latitude]);
        }

        map.on('load', () => {
          const layers = map.getStyle().layers ?? [];
          let localizedLayers = 0;
          for (const layer of layers) {
            if (layer.type !== 'symbol') continue;
            const textField = layer.layout?.['text-field'];
            if (!textField || !JSON.stringify(textField).includes('name')) continue;
            map.setLayoutProperty(layer.id, 'text-field', koreanFirstName);
            localizedLayers += 1;
          }
          if (containerRef.current) containerRef.current.dataset.localizedLayers = String(localizedLayers);

          if (points.length === 1) {
            map.jumpTo({ center: bounds.getCenter(), zoom: 8 });
          } else {
            map.fitBounds(bounds, { duration: 0, maxZoom: 8, padding: 28 });
          }
          containerRef.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
          setStatus('ready');
        });
        map.on('error', (event) => {
          if (!event.error?.message.includes('Failed to fetch')) return;
          setStatus('error');
        });
      } catch {
        setStatus('error');
      }
    }

    initializeMap();

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSelectPoint, points]);

  useEffect(() => {
    const timer = window.setTimeout(() => mapRef.current?.resize(), 300);
    return () => window.clearTimeout(timer);
  }, [resizeSignal]);

  return (
    <div className={styles.mapCanvasWrap} data-map-status={status}>
      <div ref={containerRef} className={styles.mapCanvas} aria-label="검색 결과 온천지 지도" />
      {status === 'loading' ? <span className={styles.mapStatus}>지도를 불러오는 중입니다.</span> : null}
      {status === 'error' ? <span className={styles.mapStatus}>지도를 불러오지 못했습니다.</span> : null}
      {status === 'ready' && points.length === 0 ? <span className={styles.mapStatus}>표시할 온천지가 없습니다.</span> : null}
    </div>
  );
}
