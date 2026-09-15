/**
 * Extrae el ID de un archivo de Google Drive desde diversos formatos de enlace.
 */
export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Si ya es un ID alfanumérico directo de ~25-45 caracteres
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  // /file/d/ID/view o /file/d/ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // ?id=ID o &id=ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // /d/ID (lh3.googleusercontent.com/d/ID)
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  // /open?id=ID
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (openMatch && openMatch[1]) {
    return openMatch[1];
  }

  return null;
}

/**
 * Transforma cualquier URL de Google Drive, GitHub o ruta local en un enlace de imagen renderizable directamente.
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Si es Data URL o SVG o blob
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Si ya comienza con / o http
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Revisar si es Google Drive
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    // lh3.googleusercontent.com/d/ID es la forma más rápida y sin problemas de CORS para imágenes públicas de Drive
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // Si es un enlace de GitHub blob
  if (trimmed.includes('github.com') && trimmed.includes('/blob/')) {
    return trimmed
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }

  // Si es Dropbox
  if (trimmed.includes('dropbox.com') && trimmed.includes('?dl=0')) {
    return trimmed.replace('?dl=0', '?raw=1');
  }

  // Si no tiene protocolo y termina en extensión de imagen, es un archivo local en /reactivos/
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.match(/\.(jpeg|jpg|png|webp|svg|gif)$/i)) {
      return `/reactivos/${encodeURIComponent(trimmed)}`;
    }
  }

  return trimmed;
}

/**
 * Obtiene el enlace de fallback para Google Drive si la imagen primaria falla
 */
export function getDriveThumbnailUrl(url: string, size = 1200): string {
  const driveId = extractDriveFileId(url);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
  }
  return url;
}

/**
 * Devuelve el enlace oficial para abrir directamente en Google Drive
 */
export function getDriveViewerUrl(url: string): string | null {
  const driveId = extractDriveFileId(url);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
  }
  if (url.includes('drive.google.com')) return url;
  return null;
}

/**
 * Determina el tipo de origen del enlace
 */
export function getUrlSourceType(url: string): 'drive' | 'github' | 'web' | 'local' {
  if (!url) return 'web';
  if (extractDriveFileId(url) || url.includes('drive.google.com')) return 'drive';
  if (url.includes('github.com') || url.includes('raw.githubusercontent.com')) return 'github';
  if (url.startsWith('data:') || url.startsWith('blob:')) return 'local';
  return 'web';
}
