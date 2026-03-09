import { DECOR_STYLES, DecorStyle } from '../constants/styles';

export function isValidDecorStyle(value: string): value is DecorStyle {
  return (DECOR_STYLES as readonly string[]).includes(value);
}

export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
