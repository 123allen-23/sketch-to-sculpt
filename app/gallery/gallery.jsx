import { supabase } from './lib/supabase';

export default async function GalleryPage() {
  const { data: gallery, error } = await supabase
    .from('art_gallery')
    .select('id, title, user_id')
    .limit(10);

  return (
    <main style={{ padding: '2rem', color: '#eee' }}>
      <h1>🎨 Art Gallery</h1>
      {error && <p style={{ color: 'tomato' }}>Error: {error.message}</p>}

      {!gallery?.length ? (
        <p>No art pieces found.</p>
      ) : (
        <ul style={{ lineHeight: 1.8 }}>
          {gallery.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> — uploaded by{' '}
              <code>{item.user_id || 'unknown artist'}</code>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}