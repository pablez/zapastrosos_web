// ImageKit service para manejar subida de comprobantes de pago
import ImageKit from 'imagekit';

// Configuración de ImageKit (estas credenciales van en .env)
const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "your_public_key_here",
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || "your_private_key_here", 
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_imagekit_id"
});

// Tipos de archivos permitidos para comprobantes
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg', 
  'image/jpg',
  'application/pdf'
];

// Tamaño máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Valida si el archivo es válido para comprobantes
 * @param {File} file - Archivo a validar
 * @returns {object} - { isValid: boolean, error?: string }
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No se seleccionó ningún archivo' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Tipo de archivo no permitido. Solo se permiten PNG, JPG y PDF' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: 'El archivo es demasiado grande. Máximo 5MB' 
    };
  }

  return { isValid: true };
};

/**
 * Verifica si ImageKit está configurado correctamente
 * @returns {boolean} - True si ImageKit está configurado
 */
export const checkImageKitAvailability = () => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  
  if (!publicKey || publicKey === "your_public_key_here") {
    console.error('ImageKit Public Key no está configurado');
    return false;
  }
  
  if (!urlEndpoint || urlEndpoint === "https://ik.imagekit.io/your_imagekit_id") {
    console.error('ImageKit URL Endpoint no está configurado');
    return false;
  }
  
  return true;
};

/**
 * Obtiene el token de autenticación para ImageKit
 * Esta función debe llamar a tu backend para obtener un token seguro
 * Por simplicidad, aquí generamos uno básico (en producción usa tu backend)
 */
const getAuthenticationParameters = () => {
  // En producción, esto debe ser una llamada a tu backend
  // Por ahora, usamos una implementación básica para desarrollo
  const token = Date.now().toString();
  const expire = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hora
  
  return {
    token: token,
    expire: expire,
    signature: token // En producción, esto debe ser una firma HMAC generada en el backend
  };
};

/**
 * Sube un comprobante de pago a ImageKit
 * @param {File} file - Archivo del comprobante
 * @param {string} userId - ID del usuario que sube el comprobante
 * @param {string} orderId - ID del pedido
 * @returns {Promise<object>} - Información del archivo subido
 */
export const uploadPaymentProofToImageKit = async (file, userId, orderId) => {
  // Wrapper that delegates to uploadWithProgress without progress callback
  return uploadFileToImageKitWithProgress(file, userId, orderId, null);
};

/**
 * Sube un archivo a ImageKit usando XHR para permitir seguimiento de progreso.
 * @param {File} file
 * @param {string} userId
 * @param {string} orderId
 * @param {(percent:number)=>void|null} onProgress
 * @returns {Promise<object>} upload result
 */
export const uploadFileToImageKitWithProgress = (file, userId, orderId, onProgress = null) => {
  return new Promise((resolve, reject) => {
    try {
      const validation = validateFile(file);
      if (!validation.isValid) return reject(new Error(validation.error));

      if (!checkImageKitAvailability()) return reject(new Error('ImageKit no está configurado correctamente.'));

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const fileExtension = file.name.split('.').pop();
      const fileName = `comprobante_${orderId}_${timestamp}.${fileExtension}`;

      const uploadUrl = (import.meta.env.VITE_IMAGEKIT_UPLOAD_ENDPOINT || 'https://upload.imagekit.io/api/v1/files/upload');

      const form = new FormData();
      form.append('file', file);
      form.append('fileName', fileName);
      form.append('folder', `/comprobantes/${userId}/`);
      form.append('tags', `order_${orderId},user_${userId},comprobante_pago`);
      form.append('useUniqueFileName', 'true');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      // Basic auth with private key (NOTE: exposing privateKey client-side is insecure; for prod use backend signing)
      const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '';
      if (privateKey) {
        const basic = btoa(`${privateKey}:`);
        xhr.setRequestHeader('Authorization', `Basic ${basic}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          const percent = Math.round((e.loaded / e.total) * 100);
          try { onProgress(percent); } catch (err) {}
        }
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve({
                fileId: res.fileId,
                url: res.url,
                name: res.name,
                size: file.size,
                type: file.type,
                isImage: file.type.startsWith('image/'),
                isPDF: file.type === 'application/pdf',
                uploadedAt: new Date(),
                service: 'imagekit'
              });
            } catch (err) {
              reject(new Error('Respuesta inesperada de ImageKit'));
            }
          } else {
            reject(new Error(`Error subiendo archivo: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
          }
        }
      };

      xhr.onerror = (err) => reject(new Error('Network error al subir archivo'));
      xhr.send(form);

    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Convierte un File a base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} - Archivo en base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Elimina un comprobante de ImageKit
 * @param {string} fileId - ID del archivo en ImageKit
 */
export const deletePaymentProofFromImageKit = async (fileId) => {
  try {
    if (!checkImageKitAvailability()) {
      throw new Error('ImageKit no está configurado correctamente');
    }
    
    await imagekit.deleteFile(fileId);
    console.log('Comprobante eliminado exitosamente de ImageKit');
    
  } catch (error) {
    console.error('Error eliminando comprobante de ImageKit:', error);
    throw error;
  }
};

/**
 * Obtiene información del archivo desde los datos de ImageKit
 * @param {object} fileData - Datos del archivo de ImageKit
 * @returns {object} - { fileName, fileType, isImage, isPDF }
 */
export const getImageKitFileInfo = (fileData) => {
  return {
    fileName: fileData.name || 'Archivo desconocido',
    fileType: fileData.type || 'unknown',
    isImage: fileData.isImage || false,
    isPDF: fileData.isPDF || false,
    service: 'imagekit'
  };
};