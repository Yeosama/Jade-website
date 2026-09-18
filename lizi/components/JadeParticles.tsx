
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// Vertex Shader: Maps 2D texture brightness to Z-depth to create a 3D relief effect
const vertexShader = `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uPointSize;

attribute vec2 aUv;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Sample texture at the particle's UV position
  vec4 texColor = texture2D(uTexture, aUv);
  
  // Calculate luminance (brightness)
  float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // 3D Displacement:
  // We map the particle's position based on its UVs to create a plane,
  // then displace Z based on brightness.
  // - Center the object (aUv - 0.5)
  // - Scale XY to world size (e.g., 8.0 units wide)
  vec3 pos = vec3((aUv.x - 0.5) * 8.0, (aUv.y - 0.5) * 8.0, 0.0);
  
  // Extrude Z based on brightness. Jade is translucent/bright, so it pops out.
  pos.z = brightness * 2.5; 

  // --- Background Removal Heuristics ---
  
  // 1. Radial Fade: Objects are usually centered. Fade out edges.
  float distFromCenter = distance(aUv, vec2(0.5));
  float radialMask = 1.0 - smoothstep(0.35, 0.5, distFromCenter);
  
  // 2. Brightness Threshold: Dark background pixels are hidden.
  float brightnessMask = smoothstep(0.15, 0.25, brightness);
  
  // Combine masks
  vAlpha = radialMask * brightnessMask;

  vColor = texColor.rgb;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Size attenuation (particles smaller when further away)
  gl_PointSize = uPointSize * (15.0 / -mvPosition.z);
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Fragment Shader: Renders the colored particle
const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Discard fully transparent particles to save rendering cost and clean edges
  if (vAlpha < 0.01) discard;

  // Make particles round
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;

  // Soft glow edge for each particle
  float glow = 1.0 - r; 

  gl_FragColor = vec4(vColor, vAlpha * glow); 
}
`;

interface JadeParticlesProps {
  imageUrl: string;
  hovered: boolean;
}

const JadeParticles: React.FC<JadeParticlesProps> = ({ imageUrl }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Load texture with suspense. 
  // We don't need to manually assign it in useEffect if we pass it via uniforms correctly, 
  // but explicitly setting it helps with hot-reload consistency.
  const texture = useTexture(imageUrl);

  const { positions, uvs } = useMemo(() => {
    // Increase density for better 3D shape approximation
    // 200x200 = 40,000 particles
    const count = 200; 
    const positions = [];
    const uvs = [];

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        // We actually only need UVs to determine position in the Vertex Shader now,
        // but Three.js Points needs a position attribute to render anything at all.
        // We set dummy positions here; the real position is calculated in Vertex Shader.
        positions.push(0, 0, 0); 
        
        uvs.push(i / (count - 1), j / (count - 1));
      }
    }

    return {
      positions: new Float32Array(positions),
      uvs: new Float32Array(uvs),
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: null },
      uPointSize: { value: 3.5 }, // Slightly smaller points for higher density
    }),
    []
  );

  useEffect(() => {
    if (meshRef.current) {
      // @ts-ignore
      meshRef.current.material.uniforms.uTexture.value = texture;
    }
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // @ts-ignore
    meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aUv"
          count={uvs.length / 2}
          array={uvs}
          itemSize={2}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false} // Important for particle sorting/transparency
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default JadeParticles;
