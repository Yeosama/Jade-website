import * as THREE from 'three';

export interface JadeItem {
  id: string;
  name: string;
  chineseName: string;
  imageUrl: string;
  period: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ParticleUniforms {
  uTime: { value: number };
  uTexture: { value: THREE.Texture | null };
  uMouse: { value: THREE.Vector3 };
  uResolution: { value: THREE.Vector2 };
  uPointSize: { value: number };
  uColor: { value: THREE.Color };
}