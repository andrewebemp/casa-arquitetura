/**
 * Material Catalog Registry (Story 3.1, Task 3)
 * Curated materials per element type, following staging-styles.registry.ts pattern.
 */

import type { ElementCategory } from './element-classifier';

export interface Material {
  id: string;
  name: string;
  description: string;
  prompt_descriptor: string;
  negative_prompt: string;
  category: ElementCategory;
}

const MATERIALS: Material[] = [
  // Wall materials
  { id: 'wall-white-paint', name: 'Tinta Branca', description: 'Pintura branca lisa', prompt_descriptor: 'clean white painted wall, smooth matte finish', negative_prompt: 'textured, rough, dirty', category: 'wall' },
  { id: 'wall-light-gray', name: 'Cinza Claro', description: 'Pintura cinza claro', prompt_descriptor: 'light gray wall paint, smooth elegant finish', negative_prompt: 'dark, rough, dirty', category: 'wall' },
  { id: 'wall-beige', name: 'Bege', description: 'Pintura bege quente', prompt_descriptor: 'warm beige wall paint, soft neutral tone', negative_prompt: 'cold, dark, rough', category: 'wall' },
  { id: 'wall-exposed-brick', name: 'Tijolo Aparente', description: 'Parede de tijolos aparentes', prompt_descriptor: 'exposed red brick wall, rustic texture', negative_prompt: 'smooth, painted, modern', category: 'wall' },
  { id: 'wall-concrete', name: 'Concreto Aparente', description: 'Concreto aparente estilo industrial', prompt_descriptor: 'exposed concrete wall, industrial raw finish', negative_prompt: 'painted, smooth, colorful', category: 'wall' },

  // Floor materials
  { id: 'floor-hardwood', name: 'Madeira de Lei', description: 'Piso de madeira de lei', prompt_descriptor: 'dark hardwood floor, polished wood planks', negative_prompt: 'carpet, tile, concrete', category: 'floor' },
  { id: 'floor-light-wood', name: 'Madeira Clara', description: 'Piso de madeira clara', prompt_descriptor: 'light oak wood floor, natural grain pattern', negative_prompt: 'dark, carpet, tile', category: 'floor' },
  { id: 'floor-marble', name: 'Marmore', description: 'Piso de marmore branco', prompt_descriptor: 'white marble floor, polished luxury stone', negative_prompt: 'wood, carpet, rough', category: 'floor' },
  { id: 'floor-porcelain-tile', name: 'Porcelanato', description: 'Porcelanato retificado', prompt_descriptor: 'large format porcelain tile floor, clean modern finish', negative_prompt: 'wood, carpet, rough', category: 'floor' },
  { id: 'floor-vinyl', name: 'Vinilico', description: 'Piso vinilico', prompt_descriptor: 'vinyl plank flooring, wood-look modern surface', negative_prompt: 'carpet, stone, rough', category: 'floor' },
  { id: 'floor-concrete', name: 'Concreto Polido', description: 'Piso de concreto polido', prompt_descriptor: 'polished concrete floor, industrial smooth finish', negative_prompt: 'wood, carpet, tile', category: 'floor' },

  // Countertop materials
  { id: 'counter-white-marble', name: 'Marmore Branco', description: 'Bancada de marmore branco', prompt_descriptor: 'white marble countertop with subtle gray veining', negative_prompt: 'wood, dark, rough', category: 'countertop' },
  { id: 'counter-black-granite', name: 'Granito Preto', description: 'Bancada de granito preto', prompt_descriptor: 'polished black granite countertop, reflective surface', negative_prompt: 'light, wood, matte', category: 'countertop' },
  { id: 'counter-quartz', name: 'Quartzo', description: 'Bancada de quartzo branco', prompt_descriptor: 'white quartz countertop, uniform smooth surface', negative_prompt: 'veined, rough, dark', category: 'countertop' },
  { id: 'counter-butcher-block', name: 'Madeira Macica', description: 'Bancada de madeira macica', prompt_descriptor: 'butcher block wood countertop, natural warm tone', negative_prompt: 'stone, cold, dark', category: 'countertop' },

  // Cabinet materials
  { id: 'cabinet-white-lacquer', name: 'Laca Branca', description: 'Armario em laca branca', prompt_descriptor: 'white lacquered cabinet doors, high gloss modern finish', negative_prompt: 'rustic, dark, wood grain', category: 'cabinet' },
  { id: 'cabinet-natural-wood', name: 'Madeira Natural', description: 'Armario em madeira natural', prompt_descriptor: 'natural wood cabinet, visible grain, warm tone', negative_prompt: 'painted, glossy, white', category: 'cabinet' },
  { id: 'cabinet-dark-wood', name: 'Madeira Escura', description: 'Armario em madeira escura', prompt_descriptor: 'dark stained wood cabinet, rich espresso finish', negative_prompt: 'light, white, painted', category: 'cabinet' },
  { id: 'cabinet-gray-matte', name: 'Cinza Fosco', description: 'Armario cinza fosco', prompt_descriptor: 'matte gray cabinet doors, modern minimal finish', negative_prompt: 'glossy, wood, rustic', category: 'cabinet' },

  // Ceiling materials
  { id: 'ceiling-white', name: 'Branco Liso', description: 'Teto branco liso', prompt_descriptor: 'smooth white ceiling, clean flat finish', negative_prompt: 'textured, dark, beams', category: 'ceiling' },
  { id: 'ceiling-wood-beams', name: 'Vigas de Madeira', description: 'Teto com vigas de madeira', prompt_descriptor: 'exposed wood beam ceiling, rustic warm tone', negative_prompt: 'smooth, modern, white', category: 'ceiling' },

  // Furniture materials (large)
  { id: 'furniture-leather', name: 'Couro', description: 'Estofado em couro', prompt_descriptor: 'premium leather upholstery, rich warm brown', negative_prompt: 'fabric, velvet, rough', category: 'furniture_large' },
  { id: 'furniture-linen', name: 'Linho', description: 'Estofado em linho', prompt_descriptor: 'natural linen fabric upholstery, soft neutral tone', negative_prompt: 'leather, glossy, dark', category: 'furniture_large' },
  { id: 'furniture-velvet', name: 'Veludo', description: 'Estofado em veludo', prompt_descriptor: 'plush velvet upholstery, rich deep color', negative_prompt: 'leather, rough, matte', category: 'furniture_large' },

  // Furniture materials (small)
  { id: 'small-wood', name: 'Madeira', description: 'Movel em madeira', prompt_descriptor: 'natural wood furniture, clean minimal design', negative_prompt: 'metal, glass, plastic', category: 'furniture_small' },
  { id: 'small-metal', name: 'Metal', description: 'Movel em metal', prompt_descriptor: 'metal furniture, industrial modern design', negative_prompt: 'wood, fabric, rustic', category: 'furniture_small' },

  // Window
  { id: 'window-clear', name: 'Vidro Transparente', description: 'Vidro transparente', prompt_descriptor: 'clear glass window, bright natural light', negative_prompt: 'frosted, dark, opaque', category: 'window' },

  // Door
  { id: 'door-white', name: 'Porta Branca', description: 'Porta branca lisa', prompt_descriptor: 'white painted door, clean modern panel', negative_prompt: 'dark, rustic, glass', category: 'door' },
  { id: 'door-wood', name: 'Porta de Madeira', description: 'Porta de madeira natural', prompt_descriptor: 'natural wood door, warm grain visible', negative_prompt: 'painted, white, metal', category: 'door' },

  // Decoration
  { id: 'decor-green-plant', name: 'Planta Verde', description: 'Planta decorativa verde', prompt_descriptor: 'lush green indoor plant, natural decorative foliage', negative_prompt: 'artificial, dead, dry', category: 'decoration' },

  // Other/generic
  { id: 'other-neutral', name: 'Neutro', description: 'Acabamento neutro', prompt_descriptor: 'neutral tone surface, clean minimal finish', negative_prompt: 'colorful, rough, textured', category: 'other' },
];

export const materialCatalog = {
  getAll(): Material[] {
    return MATERIALS;
  },

  getById(id: string): Material | undefined {
    return MATERIALS.find((m) => m.id === id);
  },

  getByCategory(category: ElementCategory): Material[] {
    return MATERIALS.filter((m) => m.category === category);
  },

  getSuggested(category: ElementCategory): Material[] {
    return this.getByCategory(category);
  },
};
