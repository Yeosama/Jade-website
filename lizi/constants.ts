import { JadeItem } from './types';

// Using placeholder images that resemble jade colors/textures for the demo
// In a real app, these would be real museum artifact photos
export const JADE_COLLECTION: JadeItem[] = [
  {
    id: 'jade-1',
    name: 'Imperial Jade Bi Disk',
    chineseName: '御制玉璧',
    imageUrl: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=1000&auto=format&fit=crop', // Abstract green texture
    period: 'Han Dynasty (202 BC – 220 AD)',
    description: 'A circular jade disk symbolizing heaven. The intricate grain pattern suggests high-status ownership.',
  },
  {
    id: 'jade-2',
    name: 'Dragon Pendant',
    chineseName: '龙形玉佩',
    imageUrl: 'https://images.unsplash.com/photo-1599696879858-a92c454e9a8f?q=80&w=1000&auto=format&fit=crop', // Deep green stone
    period: 'Warring States Period (475–221 BC)',
    description: 'Carved in the shape of a coiled dragon, representing power, strength, and good luck.',
  },
  {
    id: 'jade-3',
    name: 'White Jade Cabbage',
    chineseName: '翠玉白菜',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83c48006cbc6?q=80&w=1000&auto=format&fit=crop', // Lighter jade tone
    period: 'Qing Dynasty (1644–1911)',
    description: 'A masterful carving utilizing the natural color variations of the stone to depict a fresh cabbage with insects.',
  },
  {
    id: 'jade-4',
    name: 'Ancient Ritual Axe',
    chineseName: '玉钺',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=1000&auto=format&fit=crop', // Dark textured stone
    period: 'Neolithic Period',
    description: 'A ceremonial weapon symbolizing military authority, found in the tombs of high-ranking officials.',
  },
];
