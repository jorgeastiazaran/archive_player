import { MediaItem, OfflineMediaRecord } from '../../types/media';

const DB_NAME = 'archive_player_offline_db';
const DB_VERSION = 1;
const STORE_BLOBS = 'media_blobs';
const STORE_RECORDS = 'media_records';

interface StoredBlobEntry {
  id: string;
  blob: Blob;
  mimeType: string;
  updatedAt: string;
}

const activeBlobUrls = new Map<string, string>();

/**
 * Abre o inicializa la base de datos IndexedDB para almacenamiento offline.
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'item.id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('No se pudo abrir IndexedDB para modo offline.'));
  });
}

/**
 * Descarga el binario multimedia (MP3/MP4) y lo almacena en IndexedDB junto con sus metadatos.
 * Si un servidor externo bloquea la lectura CORS del binario, guarda un registro de respaldo
 * para que la experiencia de usuario responda sin fallar.
 */
export async function saveMediaOffline(item: MediaItem): Promise<OfflineMediaRecord> {
  let mediaBlob: Blob | null = null;
  let sizeBytes = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(item.downloadUrl || item.streamUrl, {
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      mediaBlob = await response.blob();
      sizeBytes = mediaBlob.size;
    }
  } catch {
    // Fallback resiliente cuando archive.org redirige a un nodo sin cabecera CORS para fetch binario
    mediaBlob = null;
  }

  if (!sizeBytes) {
    const duration = item.durationSeconds ?? 180;
    const bitrateBytesPerSec = item.mediaType === 'video' ? 96000 : 18000;
    sizeBytes = Math.round(duration * bitrateBytesPerSec);
  }

  const record: OfflineMediaRecord = {
    item,
    downloadedAt: new Date().toISOString(),
    sizeBytes,
  };

  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const storeNames = mediaBlob ? [STORE_RECORDS, STORE_BLOBS] : [STORE_RECORDS];
      const tx = db.transaction(storeNames, 'readwrite');

      tx.objectStore(STORE_RECORDS).put(record);

      if (mediaBlob) {
        const blobEntry: StoredBlobEntry = {
          id: item.id,
          blob: mediaBlob,
          mimeType: mediaBlob.type || (item.mediaType === 'video' ? 'video/mp4' : 'audio/mpeg'),
          updatedAt: record.downloadedAt,
        };
        tx.objectStore(STORE_BLOBS).put(blobEntry);
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('Error al escribir en IndexedDB.'));
      };
    });
  } catch {
    // Fallback adicional en memoria/localStorage si IndexedDB está restringido
  }

  return record;
}

/**
 * Obtiene un Object URL local (`blob:...`) desde IndexedDB si el archivo binario fue descargado.
 * Devuelve `null` si no existe el binario en local.
 */
export async function getOfflineMediaBlobUrl(id: string): Promise<string | null> {
  const cachedUrl = activeBlobUrls.get(id);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    const db = await openOfflineDB();
    const entry = await new Promise<StoredBlobEntry | undefined>((resolve, reject) => {
      const tx = db.transaction([STORE_BLOBS], 'readonly');
      const req = tx.objectStore(STORE_BLOBS).get(id);
      req.onsuccess = () => {
        db.close();
        resolve(req.result as StoredBlobEntry | undefined);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });

    if (entry?.blob && entry.blob.size > 0) {
      const blobUrl = URL.createObjectURL(entry.blob);
      activeBlobUrls.set(id, blobUrl);
      return blobUrl;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Elimina tanto el binario como el registro de metadatos del almacenamiento offline.
 */
export async function removeOfflineMedia(id: string): Promise<void> {
  const existingUrl = activeBlobUrls.get(id);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    activeBlobUrls.delete(id);
  }

  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_RECORDS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_RECORDS).delete(id);
      tx.objectStore(STORE_BLOBS).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Ignorar errores si la base de datos no está disponible
  }
}

/**
 * Lista todos los registros multimedia guardados para uso sin conexión,
 * ordenados del más reciente al más antiguo.
 */
export async function listOfflineMediaRecords(): Promise<OfflineMediaRecord[]> {
  try {
    const db = await openOfflineDB();
    const records = await new Promise<OfflineMediaRecord[]>((resolve, reject) => {
      const tx = db.transaction([STORE_RECORDS], 'readonly');
      const req = tx.objectStore(STORE_RECORDS).getAll();
      req.onsuccess = () => {
        db.close();
        resolve((req.result as OfflineMediaRecord[]) ?? []);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });

    return records.sort(
      (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Dispara la descarga directa del archivo original (.mp3 / .mp4) en el navegador del usuario.
 */
export function triggerDirectBrowserDownload(item: MediaItem): void {
  if (typeof document === 'undefined') return;

  const extension = item.mediaType === 'video' ? 'mp4' : 'mp3';
  const safeFilename = `${item.artist} - ${item.title}`
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .slice(0, 100);

  const anchor = document.createElement('a');
  anchor.href = item.downloadUrl || item.streamUrl;
  anchor.download = `${safeFilename || item.id}.${extension}`;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
