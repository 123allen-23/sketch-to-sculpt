'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const BASE_TITLE = 'Glass Study';

const STAGE_ORDER = [
  { label: 'Sketch', category: 'Original' },
  { label: 'Refined Print', category: 'Refined Print' },
  { label: '3D Render', category: 'Digital Render' },
  { label: 'Real Photo', category: 'Real Photo' },
];

export default function GlassPipelinePage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Loading…');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('art_gallery')
        .select('*')
        .ilike('title', `${BASE_TITLE}%`);

      if (error) {
        console.error(error);
        setStatus('Failed to load pipeline.');
        return;
      }

      setItems(data || []);
      setStatus('');
    };

    load();
  }, []);

  // for a given stage, pick the artwork matching its category
  const getStageItem = (stage) => {
    return (
      items.find(
        (item) =>
          (item.category || '').toLowerCase() ===
          stage.category.toLowerCase()
      ) || null
    );
  };

  return (
    <main className="page">
      <h1>{BASE_TITLE} – Pipeline</h1>
      <p>
        Follow this glass piece from sketch to refined print, 3D render, and final photo.
      </p>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}

      {!status && items.length === 0 && (
        <p style={{ marginTop: '1rem' }}>
          No stages found yet. Make sure you’ve uploaded:
          Sketch, Refined Print, 3D Render, and Real Photo
          with titles starting with &quot;{BASE_TITLE}&quot;.
        </p>
      )}

      {/* Side-by-side layout */}
      {!status && items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          {STAGE_ORDER.map((stage, index) => {
            const item = getStageItem(stage);

            return (
              <section
                key={stage.label}
                style={{
                  padding: '0.75rem',
                  borderRadius: '1rem',
                  border: '1px solid #1f2937',
                  background: '#020617',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                  }}
                >
                  Step {index + 1}: {stage.label}
                </h2>
                <p
                  style={{
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    marginBottom: '0.25rem',
                  }}
                >
                  Category: {stage.category}
                </p>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '100%',
                    overflow: 'hidden',
                    borderRadius: '0.75rem',
                    background: '#030712',
                  }}
                >
                  {item && item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title || stage.label}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        opacity: 0.5,
                        padding: '0.5rem',
                        textAlign: 'center',
                      }}
                    >
                      No image for this stage yet.
                    </div>
                  )}
                </div>

                {item && item.description && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      marginTop: '0.25rem',
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
