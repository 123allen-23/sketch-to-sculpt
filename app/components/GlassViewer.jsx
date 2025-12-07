'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function GlassModel(props) {
  const { scene } = useGLTF('/models/glass.glb');
  return <primitive object={scene} {...props} />;
}

useGLTF.preload('/models/glass.glb');

export default function GlassViewer() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        margin: '1.5rem auto',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #1f2937',
        background: '#020617',
      }}
    >
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <Suspense fallback={null}>
          <GlassModel />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
