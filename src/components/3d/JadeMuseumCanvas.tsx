import React, { useRef, useEffect, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// 顶点着色器
const jadeVertexShader = `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uPointSize;
uniform float uDissolve;

attribute vec2 aUv;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 texColor = texture2D(uTexture, aUv);
  float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

  vec3 pos = vec3((aUv.x - 0.5) * 5.4, (aUv.y - 0.5) * 5.4, 0.0);
  pos.z = brightness * 2.7;

  float distFromCenter = distance(aUv, vec2(0.5));
  float radialMask = 1.0 - smoothstep(0.27, 0.40, distFromCenter);
  float brightnessMask = smoothstep(0.10, 0.20, brightness);
  vAlpha = radialMask * brightnessMask * uDissolve;

  vColor = texColor.rgb;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uPointSize * (14.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// 片元着色器
const jadeFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  if (vAlpha < 0.01) discard;

  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;

  float glow = 1.0 - r;
  gl_FragColor = vec4(vColor, vAlpha * glow);
}
`;

// 点云组件（内部使用）
const JadePointCloud = ({
  imageUrl,
  dissolve,
}: {
  imageUrl: string;
  dissolve: number;
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const texture = useTexture(imageUrl);

  const { positions, uvs } = useMemo(() => {
    const count = 200;
    const positions: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
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
      uTexture: { value: texture },
      uPointSize: { value: 4.4 },
      uDissolve: { value: 1 },
    }),
    [texture]
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

  useEffect(() => {
    if (!meshRef.current) return;
    // @ts-ignore
    meshRef.current.material.uniforms.uDissolve.value = dissolve;
  }, [dissolve]);

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
        vertexShader={jadeVertexShader}
        fragmentShader={jadeFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 主组件
const JadeMuseumCanvas = ({
  imageUrl,
  modelUrl,
}: {
  imageUrl: string;
  modelUrl: string;
}) => {
  const [contextLost, setContextLost] = useState(false);

  const JadeModel = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url);

    const centered = useMemo(() => {
      const cloned = scene.clone();
      const box = new THREE.Box3().setFromObject(cloned);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxSize = Math.max(size.x, size.y, size.z);
      const target = 4.5;
      const scale = maxSize > 0 ? target / maxSize : 1;
      cloned.scale.setScalar(scale);
      cloned.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );
      return cloned;
    }, [scene]);

    const materials = useMemo(() => {
      const mats: THREE.Material[] = [];
      centered.traverse((obj: any) => {
        if (obj.isMesh) {
          const mat = obj.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              m.transparent = true;
              m.depthWrite = false;
              mats.push(m);
            });
          } else if (mat) {
            mat.transparent = true;
            mat.depthWrite = false;
            mats.push(mat);
          }
        }
      });
      return mats;
    }, [centered]);

    useEffect(() => {
      materials.forEach((mat) => {
        mat.transparent = false;
        mat.depthWrite = true;
        mat.opacity = 1;
      });
    }, [materials]);

    return <primitive object={centered} />;
  };

  useGLTF.preload(modelUrl);

  const RotatingModel = ({ url }: { url: string }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.25; // slow spin around vertical (Y) axis
      }
    });

    return (
      <group ref={groupRef} rotation={[0.55, 0.2, 0]}>
        <JadeModel url={url} />
      </group>
    );
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#050805]">
      <Canvas
        camera={{ position: [0, 0.3, 4.2], fov: 42 }}
        dpr={[1, 1.25]}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          alpha: true,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.55,
        }}
        onCreated={({ gl }) => {
          // ensure SRGB output
          // @ts-ignore
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const canvas = gl.domElement;
          const handleLost = (e: Event) => {
            e.preventDefault();
            setContextLost(true);
          };
          const handleRestore = () => setContextLost(false);
          canvas.addEventListener("webglcontextlost", handleLost, false);
          canvas.addEventListener("webglcontextrestored", handleRestore, false);
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="text-xs tracking-[0.3em] text-emerald-200/70">
                LOADING
              </div>
            </Html>
          }
        >
          <color attach="background" args={["#050805"]} />
          <ambientLight intensity={1.15} color="#f5fff8" />
          <hemisphereLight args={["#e8fff2", "#0a0f0d", 0.9]} />
          <directionalLight
            position={[5, 6, 7]}
            intensity={3.4}
            color="#ffffff"
          />
          <directionalLight
            position={[-4, -2, -5]}
            intensity={2.0}
            color="#8ff3d4"
          />
          <pointLight
            position={[2.5, 1.5, 3]}
            intensity={5.5}
            color="#c8ffd8"
          />
          <pointLight position={[-2, -1, -3]} intensity={2.4} color="#6be0c0" />
          <pointLight position={[0, 4, 0]} intensity={2.9} color="#ffffff" />

          <RotatingModel url={modelUrl} />

          <OrbitControls
            enablePan
            enableZoom={true}
            minDistance={1.8}
            maxDistance={8}
            autoRotate={false}
            rotateSpeed={1.0}
            panSpeed={0.8}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,12,10,0)_0%,rgba(5,8,5,0.8)_80%)]" />
      <div className="pointer-events-none absolute inset-0 border border-white/5 rounded-3xl" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050805] text-emerald-100 text-sm">
          WebGL 上下文丢失，请刷新页面（或关闭其他占用显卡的标签）后重试。
        </div>
      )}
    </div>
  );
};

export default JadeMuseumCanvas;