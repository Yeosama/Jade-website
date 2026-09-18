
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import JadeParticles from './JadeParticles';

interface ExperienceProps {
  imageUrl: string;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-jade-400 font-serif text-xl tracking-widest animate-pulse">
        LOADING {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

const Experience: React.FC<ExperienceProps> = ({ imageUrl }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-neutral-950">
      <Canvas camera={{ position: [0, -2, 6], fov: 50 }}>
        <Suspense fallback={<Loader />}>
            <color attach="background" args={['#050805']} />
            
            {/* Soft ambient lighting for mood, though shader is unlit/emissive */}
            <ambientLight intensity={0.5} />
            
            {/* The Artifact */}
            <group rotation={[0.5, 0, 0]}> 
              {/* Tilted slightly to show 3D depth immediately */}
              <JadeParticles 
                  imageUrl={imageUrl} 
                  hovered={true}
              />
            </group>
            
            <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                maxDistance={12}
                minDistance={2}
                rotateSpeed={0.8}
                autoRotate={true}
                autoRotateSpeed={1.0}
            />
        </Suspense>
      </Canvas>
      {/* Vignette Overlay for focus */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_90%)]"></div>
    </div>
  );
};

export default Experience;
