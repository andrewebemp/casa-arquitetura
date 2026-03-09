import type { DecorStyle } from '@decorai/shared';

export interface StagingStyle {
  id: DecorStyle;
  name: string;
  description: string;
  preview_url: string;
  prompt_modifier: string;
  negative_prompt: string;
}

export const STAGING_STYLES: StagingStyle[] = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Linhas retas, cores neutras e mobiliario contemporaneo com acabamentos em metal e vidro',
    preview_url: '/styles/moderno.jpg',
    prompt_modifier: 'modern interior design, clean lines, neutral colors, contemporary furniture, metal and glass accents, minimalist decor, well-lit space',
    negative_prompt: 'cluttered, ornate, rustic, vintage, dark, low quality, blurry',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Elementos urbanos com tijolo aparente, metal escuro e madeira bruta',
    preview_url: '/styles/industrial.jpg',
    prompt_modifier: 'industrial interior design, exposed brick walls, dark metal fixtures, raw wood, concrete floor, loft style, Edison bulbs, open ductwork',
    negative_prompt: 'colorful, ornate, delicate, traditional, low quality, blurry',
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Espacos limpos com poucos elementos, paleta monocromatica e funcionalidade maxima',
    preview_url: '/styles/minimalista.jpg',
    prompt_modifier: 'minimalist interior design, monochromatic palette, sparse furniture, clean surfaces, geometric shapes, plenty of negative space, natural light',
    negative_prompt: 'cluttered, ornate, busy patterns, colorful, decorative, low quality, blurry',
  },
  {
    id: 'classico',
    name: 'Classico',
    description: 'Elegancia atemporal com molduras, moveis torneados e tecidos nobres',
    preview_url: '/styles/classico.jpg',
    prompt_modifier: 'classic interior design, elegant moldings, turned furniture legs, rich fabrics, chandeliers, symmetry, warm wood tones, traditional patterns',
    negative_prompt: 'modern, industrial, minimalist, contemporary, low quality, blurry',
  },
  {
    id: 'escandinavo',
    name: 'Escandinavo',
    description: 'Simplicidade nordica com madeira clara, tons pasteis e texturas acolhedoras',
    preview_url: '/styles/escandinavo.jpg',
    prompt_modifier: 'scandinavian interior design, light wood, pastel tones, cozy textiles, white walls, functional furniture, hygge atmosphere, natural materials',
    negative_prompt: 'dark, ornate, heavy, cluttered, industrial, low quality, blurry',
  },
  {
    id: 'rustico',
    name: 'Rustico',
    description: 'Aconchego campestre com pedra natural, madeira envelhecida e fibras naturais',
    preview_url: '/styles/rustico.jpg',
    prompt_modifier: 'rustic interior design, natural stone, aged wood, natural fibers, woven textures, warm earth tones, farmhouse style, cozy fireplace',
    negative_prompt: 'modern, industrial, minimalist, sleek, glossy, low quality, blurry',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Frescor tropical com plantas, rattan, cores vibrantes e elementos naturais',
    preview_url: '/styles/tropical.jpg',
    prompt_modifier: 'tropical interior design, lush green plants, rattan furniture, vibrant colors, bamboo accents, natural light, palm leaf patterns, airy space',
    negative_prompt: 'cold, industrial, dark, monochromatic, heavy, low quality, blurry',
  },
  {
    id: 'contemporaneo',
    name: 'Contemporaneo',
    description: 'Design atual com mix de materiais, arte moderna e iluminacao sofisticada',
    preview_url: '/styles/contemporaneo.jpg',
    prompt_modifier: 'contemporary interior design, mixed materials, modern art, sophisticated lighting, bold accents, open floor plan, sleek surfaces, curated decor',
    negative_prompt: 'traditional, rustic, vintage, cluttered, dark, low quality, blurry',
  },
  {
    id: 'boho',
    name: 'Boho',
    description: 'Estilo boho-chic com padroes etnicos, macrame, plantas e cores terrosas',
    preview_url: '/styles/boho.jpg',
    prompt_modifier: 'bohemian interior design, ethnic patterns, macrame wall hangings, indoor plants, earthy colors, layered textiles, vintage rugs, eclectic decor',
    negative_prompt: 'minimalist, modern, industrial, sterile, monochromatic, low quality, blurry',
  },
  {
    id: 'luxo',
    name: 'Luxo',
    description: 'Opulencia sofisticada com marmore, dourado, veludos e iluminacao dramatica',
    preview_url: '/styles/luxo.jpg',
    prompt_modifier: 'luxury interior design, marble surfaces, gold accents, velvet upholstery, dramatic lighting, crystal chandeliers, high-end finishes, opulent decor',
    negative_prompt: 'cheap, industrial, rustic, simple, minimal, low quality, blurry',
  },
];

export const stylesRegistry = {
  getAll(): StagingStyle[] {
    return STAGING_STYLES;
  },

  getById(id: DecorStyle): StagingStyle | undefined {
    return STAGING_STYLES.find((s) => s.id === id);
  },
};
