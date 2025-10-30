// Firebase Storage service para manejar subida de archivos
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

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
 * Verifica si Firebase Storage está disponible y configurado
 * @returns {Promise<boolean>} - True si Storage está disponible
 */
export const checkStorageAvailability = async () => {
  try {
    if (!storage) {
      console.error('Firebase Storage no está inicializado');
      return false;
    }

    // Intentar hacer una operación simple para verificar conectividad
    const testRef = ref(storage, 'test/connectivity-check');
    
    try {
      // Intentar listar archivos en una carpeta (operación de lectura)
      await listAll(testRef);
      return true;
    } catch (error) {
      console.error('Error verificando Storage:', error);
      
      // Si es error de Storage no configurado
      if (error.code === 'storage/project-not-found' || 
          error.message?.includes('project not found') ||
          error.message?.includes('Storage bucket not found')) {
        return false;
      }
      
      // Si es error de permisos pero Storage existe, retornar true
      if (error.code === 'storage/unauthorized') {
        return true; // Storage existe pero no tenemos permisos para test folder
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error general verificando Storage:', error);
    return false;
  }
};

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
 * Sube un comprobante de pago a Firebase Storage
 * @param {File} file - Archivo del comprobante
 * @param {string} userId - ID del usuario que sube el comprobante
 * @param {string} orderId - ID del pedido
 * @returns {Promise<string>} - URL de descarga del archivo
 */
export const uploadPaymentProof = async (file, userId, orderId) => {
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Verificar que Firebase Storage esté configurado
    if (!storage) {
      throw new Error('Firebase Storage no está configurado correctamente');
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${orderId}_${uuidv4()}.${fileExtension}`;
    
    // Crear referencia en Storage: comprobantes/{userId}/{fileName}
    const storageRef = ref(storage, `comprobantes/${userId}/${fileName}`);
    
    // Subir archivo
    console.log('Subiendo comprobante a Firebase Storage...');
    
    // Intentar subir con manejo de errores específicos
    try {
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Comprobante subido exitosamente:', downloadURL);
      return downloadURL;
      
    } catch (uploadError) {
      console.error('Error específico de subida:', uploadError);
      
      // Verificar si es un error de Storage no configurado
      if (uploadError.code === 'storage/project-not-found' || 
          uploadError.code === 'storage/invalid-project-id' ||
          uploadError.message?.includes('project not found') ||
          uploadError.message?.includes('CORS') ||
          uploadError.message?.includes('does not have HTTP ok status')) {
        throw new Error('Firebase Storage no está activado. Ve a Firebase Console → Storage → "Get Started" para activarlo.');
      }
      
      // Otros errores de permisos
      if (uploadError.code === 'storage/unauthorized') {
        throw new Error('No tienes permisos para subir archivos. Verifica las reglas de Storage.');
      }
      
      // Error genérico
      throw new Error(`Error subiendo archivo: ${uploadError.message}`);
    }
    
  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    throw error;
  }
};

/**
 * Elimina un comprobante de Firebase Storage
 * @param {string} downloadURL - URL del archivo a eliminar
 */
export const deletePaymentProof = async (downloadURL) => {
  try {
    // Extraer la ruta del archivo desde la URL
    const decodedURL = decodeURIComponent(downloadURL);
    const pathMatch = decodedURL.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch) {
      throw new Error('No se pudo extraer la ruta del archivo');
    }
    
    const filePath = pathMatch[1];
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    console.log('Comprobante eliminado exitosamente');
    
  } catch (error) {
    console.error('Error eliminando comprobante:', error);
    throw error;
  }
};

/**
 * Obtiene información del archivo desde la URL
 * @param {string} downloadURL - URL del archivo
 * @returns {object} - { fileName, fileType, isImage, isPDF }
 */
export const getFileInfo = (downloadURL) => {
  try {
    const url = new URL(downloadURL);
    const pathParts = url.pathname.split('/');
    const fileName = decodeURIComponent(pathParts[pathParts.length - 1]);
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    return {
      fileName,
      fileType: fileExtension,
      isImage: ['png', 'jpg', 'jpeg'].includes(fileExtension),
      isPDF: fileExtension === 'pdf'
    };
  } catch (error) {
    console.error('Error obteniendo info del archivo:', error);
    return {
      fileName: 'Archivo desconocido',
      fileType: 'unknown',
      isImage: false,
      isPDF: false
    };
  }
};