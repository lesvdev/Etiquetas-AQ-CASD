/**
 * Descarga una imagen o etiqueta de reactivo con un nombre limpio y estandarizado
 */
export async function downloadReagentImage(imageUrl: string, reagentName: string): Promise<boolean> {
  try {
    const cleanName = reagentName
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '_')
      .toUpperCase();

    // Determinar extensión adecuada
    let ext = '.jpeg';
    if (imageUrl.toLowerCase().includes('.png')) ext = '.png';
    else if (imageUrl.toLowerCase().includes('.webp')) ext = '.webp';
    else if (imageUrl.toLowerCase().includes('.jpg')) ext = '.jpg';

    const filename = `${cleanName}${ext}`;

    // Si es Data URL
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // Si es URL o ruta local
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      return true;
    } catch {
      // Fallback a enlace directo
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }
  } catch (error) {
    console.error('Error al descargar imagen:', error);
    return false;
  }
}
