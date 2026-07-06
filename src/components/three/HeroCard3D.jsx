'use client';
import { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// CORS-safe texture loader for external YGOProDeck images
function useCrossOriginTexture(imageUrl) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!imageUrl) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      imageUrl,
      (tex) => { tex.minFilter = THREE.LinearFilter; setTexture(tex); },
      undefined,
      () => { /* silent fallback */ }
    );
    return () => setTexture(null);
  }, [imageUrl]);
  return texture;
}

// Holographic foil shader material
function HolographicCard({ imageUrl, onLoaded }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHovered] = useState(false);
  const timeRef = useRef(0);

  const texture = useCrossOriginTexture(imageUrl);
  useEffect(() => { if (texture && onLoaded) onLoaded(); }, [texture]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    // Smooth mouse tracking tilt
    const targetRotX = mouse.y * -0.25;
    const targetRotY = mouse.x * 0.35;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x, targetRotX, 0.08
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y, targetRotY, 0.08
    );

    // Idle float
    meshRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.08;
    meshRef.current.position.x = Math.sin(timeRef.current * 0.5) * 0.02;

    // Foil shimmer — update UV offset based on mouse
    if (materialRef.current?.uniforms) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
      materialRef.current.uniforms.uMouse.value.set(
        (mouse.x + 1) / 2,
        (mouse.y + 1) / 2
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef}>
        {/* Main card face */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <planeGeometry args={[2.1, 3.1, 32, 32]} />
          <meshStandardMaterial
            map={texture || undefined}
            color={texture ? undefined : '#0d0025'}
            roughness={0.15}
            metalness={0.3}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Foil holographic overlay */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[2.1, 3.1, 1, 1]} />
          <meshBasicMaterial
            transparent
            opacity={0.08}
            color={hovered ? '#ffffff' : '#aaaaff'}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Glow rim effect */}
        <mesh position={[0, 0, -0.01]} scale={[1.02, 1.02, 1]}>
          <planeGeometry args={[2.1, 3.1, 1, 1]} />
          <meshBasicMaterial
            transparent
            opacity={hovered ? 0.4 : 0.15}
            color="#7c3aed"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Card back */}
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.005]}>
          <planeGeometry args={[2.1, 3.1, 1, 1]} />
          <meshStandardMaterial color="#0d0020" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ imageUrl, onLoaded }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-3, 2, 3]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[3, -2, 3]} intensity={1.0} color="#06b6d4" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#f59e0b" />
      <Environment preset="night" />
      <HolographicCard imageUrl={imageUrl} onLoaded={onLoaded} />
    </>
  );
}

export default function HeroCard3D({ card }) {
  const imageUrl = card?.card_images?.[0]?.image_url || null;
  const [loaded, setLoaded] = useState(false);

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-48 h-72 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        shadows
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene imageUrl={imageUrl} onLoaded={() => setLoaded(true)} />
        </Suspense>
      </Canvas>

      {/* Glow beneath card */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)',
          filter: 'blur(15px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
    </div>
  );
}
