'use client';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { getAttributeTheme } from '@/lib/cardTheme';

// Custom texture hook that sets crossOrigin before loading
function useCardTexture(imageUrl) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    const loader = new THREE.TextureLoader();
    
    // We try to load with anonymous CORS. If it fails, we fall back to a standard load or local placeholder
    loader.setCrossOrigin('anonymous');
    
    loader.load(
      imageUrl,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('CORS texture load failed, retrying without CORS...');
        // Retry without crossOrigin
        const fallbackLoader = new THREE.TextureLoader();
        fallbackLoader.load(
          imageUrl,
          (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            setTexture(tex);
          },
          undefined,
          () => {
            console.error('All texture loads failed for:', imageUrl);
          }
        );
      }
    );
  }, [imageUrl]);

  return texture;
}

function CardMesh({ imageUrl, attribute }) {
  const meshRef = useRef();
  const { mouse } = useThree();
  const theme = getAttributeTheme(attribute);
  const [hovered, setHovered] = useState(false);
  const timeRef = useRef(0);
  const texture = useCardTexture(imageUrl);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    meshRef.current.rotation.y = Math.sin(timeRef.current * 0.4) * 0.05;
  });

  const glowColor = new THREE.Color(theme?.primary || '#7c3aed');

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={meshRef}>
        {/* Card face */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <planeGeometry args={[2.5, 3.6, 32, 32]} />
          <meshStandardMaterial
            map={texture || undefined}
            color={texture ? undefined : '#201035'}
            roughness={0.15}
            metalness={0.3}
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Foil iridescent overlay */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[2.5, 3.6, 1, 1]} />
          <meshBasicMaterial
            transparent
            opacity={hovered ? 0.15 : 0.06}
            color="#ffffff"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Attribute colored rim glow */}
        <mesh position={[0, 0, -0.01]} scale={[1.025, 1.025, 1]}>
          <planeGeometry args={[2.5, 3.6, 1, 1]} />
          <meshBasicMaterial
            transparent
            opacity={0.25}
            color={glowColor}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Card back */}
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.005]}>
          <planeGeometry args={[2.5, 3.6, 1, 1]} />
          <meshStandardMaterial color="#050015" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ imageUrl, attribute, glowColor }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={2} castShadow color="#ffffff" />
      <pointLight position={[-4, 3, 4]} intensity={2} color={glowColor} />
      <pointLight position={[4, -3, 4]} intensity={1.5} color={glowColor} />
      <spotLight position={[0, 6, 3]} intensity={3} angle={0.4} penumbra={0.8} color="#ffffff" />
      <Environment preset="night" />
      <CardMesh imageUrl={imageUrl} attribute={attribute} />
      <OrbitControls
        enableZoom
        enablePan={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        maxDistance={8}
        minDistance={3}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export default function CardScene({ card }) {
  const theme = getAttributeTheme(card?.attribute);
  const imageUrl = card?.card_images?.[0]?.image_url;
  const glowColor = theme?.primary || '#7c3aed';

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        shadows={false}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene imageUrl={imageUrl} attribute={card?.attribute} glowColor={glowColor} />
        </Suspense>
      </Canvas>

      {/* Attribute ambient glow */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, ${glowColor}60 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}
