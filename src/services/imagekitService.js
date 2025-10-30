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
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Verificar que ImageKit esté configurado
    if (!checkImageKitAvailability()) {
      throw new Error('ImageKit no está configurado correctamente. Verifica las variables de entorno.');
    }

    // Generar nombre único para el archivo
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const fileName = `comprobante_${orderId}_${timestamp}.${fileExtension}`;
    
    console.log('Subiendo comprobante a ImageKit...');
    
    // Convertir File a base64 para ImageKit
    const fileData = await fileToBase64(file);
    
    // Obtener parámetros de autenticación
    const authParams = getAuthenticationParameters();
    
    // Subir archivo a ImageKit
    const uploadResult = await imagekit.upload({
      file: fileData, // archivo en base64
      fileName: fileName,
      folder: `/comprobantes/${userId}/`, // organizar por usuario
      tags: [`order_${orderId}`, `user_${userId}`, 'comprobante_pago'],
      useUniqueFileName: true,
      ...authParams
    });
    
    console.log('Comprobante subido exitosamente a ImageKit:', uploadResult);
    
    return {
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      name: uploadResult.name,
      size: file.size,
      type: file.type,
      isImage: file.type.startsWith('image/'),
      isPDF: file.type === 'application/pdf',
      uploadedAt: new Date(),
      service: 'imagekit'
    };
    
  } catch (error) {
    console.error('Error subiendo comprobante a ImageKit:', error);
    throw new Error(`Error subiendo archivo: ${error.message}`);
  }
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