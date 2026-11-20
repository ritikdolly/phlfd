/**
 * Resolves a food item image URL.
 * If the image is stored on the backend (e.g., "/api/images/food-xyz.jpg"),
 * this prefixes the backend host (http://localhost:8080 or VITE_API_URL origin)
 * so it loads reliably across all devices and dev/prod modes.
 */
export const DEFAULT_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80';

export function getImageUrl(url, fallback = DEFAULT_FOOD_IMAGE) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const trimmed = url.trim();

  // Already absolute or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Relative backend image path
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const backendBase = apiUrl.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${backendBase}${cleanPath}`;
}
