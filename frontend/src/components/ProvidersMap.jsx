import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { supabase } from '../lib/supabase';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function ProvidersMap({ 
  onProviderClick, 
  showFemaleOnly = false,
  centerLat = 27.7172,
  centerLng = 85.3240,
  zoom = 12
}) {
  // If Supabase not configured, show placeholder
  if (!supabase) {
    return (
      <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
        Map coming soon — configure Supabase to enable live provider map
      </div>
    )
  }

  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [centerLng, centerLat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.on('load', () => {
      // Register Supabase MVT protocol
      if (!maplibregl.config.REGISTERED_PROTOCOLS?.['supabase']) {
        maplibregl.addProtocol('supabase', async (params) => {
          const re = /supabase:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/;
          const match = params.url.match(re);
          
          if (!match) {
            throw new Error('Invalid Supabase MVT URL');
          }

          const [, fn, z, x, y] = match;

          const { data, error } = await supabase.rpc(fn, {
            z: parseInt(z),
            x: parseInt(x),
            y: parseInt(y),
          });

          if (error) {
            console.error('MVT RPC error:', error);
            throw new Error(error.message);
          }

          // Decode base64 to bytes
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          return { data: bytes.buffer };
        });
      }

      // Add vector tile source
      map.addSource('providers', {
        type: 'vector',
        tiles: ['supabase://mvt/{z}/{x}/{y}'],
        minzoom: 5,
        maxzoom: 16,
      });

      // Heatmap layer for low zoom levels (city overview)
      map.addLayer({
        id: 'providers-heat',
        type: 'heatmap',
        source: 'providers',
        'source-layer': 'providers',
        maxzoom: 11,
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(124,58,237,0)',
            0.5, 'rgba(124,58,237,0.5)',
            1, 'rgba(124,58,237,1)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7,
        },
      });

      // Circle layer for street-level zoom
      map.addLayer({
        id: 'providers-circle',
        type: 'circle',
        source: 'providers',
        'source-layer': 'providers',
        minzoom: 10,
        filter: showFemaleOnly
          ? ['==', ['get', 'is_female'], true]
          : ['literal', true],
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 5, 15, 12
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'is_female'], true], '#7C3AED',
            '#3B82F6'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9,
        },
      });

      // Label layer for high zoom
      map.addLayer({
        id: 'providers-label',
        type: 'symbol',
        source: 'providers',
        'source-layer': 'providers',
        minzoom: 13,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#1F2937',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      // Click handler for circle layer
      map.on('click', 'providers-circle', (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();

        new maplibregl.Popup({ offset: 25, maxWidth: '220px' })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:Inter,sans-serif;padding:8px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <strong style="font-size:14px">${props.name}</strong>
                ${props.is_female
                  ? '<span style="font-size:11px;color:#7C3AED;font-weight:600">Women First</span>'
                  : ''}
              </div>
              <div style="font-size:12px;color:#6B7280;margin-bottom:2px">
                📍 ${props.city || 'Kathmandu'}
              </div>
              <div style="font-size:12px;color:#F59E0B;margin-bottom:8px">
                ⭐ ${props.rating ? parseFloat(props.rating).toFixed(1) : 'New'}
                · Trust: ${props.trust_score ?? '—'}/100
              </div>
              <button
                onclick="window.dispatchEvent(new CustomEvent('viewProvider',{detail:${props.id}}))"
                style="width:100%;padding:6px 0;background:#7C3AED;color:white;
                       border:none;border-radius:6px;cursor:pointer;font-size:12px;
                       font-weight:600">
                View Profile →
              </button>
            </div>
          `)
          .addTo(map);

        if (onProviderClick) onProviderClick(props.id);
      });

      map.on('mouseenter', 'providers-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'providers-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    // Listen for external viewProvider events
    const handleViewProvider = (e) => {
      if (onProviderClick) onProviderClick(e.detail);
    };
    window.addEventListener('viewProvider', handleViewProvider);

    return () => {
      window.removeEventListener('viewProvider', handleViewProvider);
      map.remove();
      mapRef.current = null;
    };
  }, [showFemaleOnly]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-6 left-4 bg-white/90 backdrop-blur-sm 
                      rounded-xl p-3 shadow-lg text-xs space-y-2 border border-gray-100">
        <p className="font-semibold text-gray-700 mb-1">Providers</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block ring-2 ring-white shadow"/>
          <span className="text-gray-600">Women First</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block ring-2 ring-white shadow"/>
          <span className="text-gray-600">All Providers</span>
        </div>
      </div>

      {/* Women First filter indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm 
                      rounded-xl px-3 py-2 shadow-lg border border-purple-300 
                      text-xs font-semibold text-purple-600">
        {showFemaleOnly ? 'Showing Women First' : 'All Providers'}
      </div>
    </div>
  );
}
