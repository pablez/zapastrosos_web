import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, CheckCircle, X, AlertCircle, ExternalLink } from 'lucide-react';
import { uploadPaymentProofToImageKit, validateFile, getImageKitFileInfo, checkImageKitAvailability } from '../../services/imagekitService';

const PaymentProofUploader = ({ userId, orderId, onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [imagekitAvailable, setImagekitAvailable] = useState(null); // null = checking, true = available, false = not available

  // Verificar disponibilidad de ImageKit al montar el componente
  useEffect(() => {
    const checkImageKit = () => {
      try {
        const available = checkImageKitAvailability();
        setImagekitAvailable(available);
        
        if (!available) {
          setError('ImageKit no está configurado. Se necesita configurar las credenciales para subir comprobantes.');
        }
      } catch (error) {
        console.error('Error verificando ImageKit:', error);
        setImagekitAvailable(false);
        setError('Error verificando la disponibilidad del servicio de ImageKit.');
      }
    };

    checkImageKit();
  }, []);

  // Manejar selección de archivo
  const handleFileSelect = async (file) => {
    setError('');
    
    // Verificar que ImageKit esté disponible
    if (imagekitAvailable === false) {
      setError('ImageKit no está configurado. No se pueden subir comprobantes.');
      return;
    }

    if (imagekitAvailable === null) {
      setError('Verificando disponibilidad del servicio... Intenta de nuevo en un momento.');
      return;
    }
    
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setUploading(true);
      
      // Subir archivo a ImageKit
      const uploadResult = await uploadPaymentProofToImageKit(file, userId, orderId);
      
      // Guardar información del archivo subido
      setUploadedFile({
        url: uploadResult.url,
        name: file.name,
        size: file.size,
        fileId: uploadResult.fileId,
        ...uploadResult
      });

      // Notificar éxito al componente padre
      if (onUploadSuccess) {
        onUploadSuccess(uploadResult.url, file.name, uploadResult);
      }

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      
      // Mostrar mensaje específico según el tipo de error
      let errorMessage = error.message || 'Error al subir el comprobante';
      
      if (error.message?.includes('ImageKit no está configurado')) {
        setImagekitAvailable(false);
      }
      
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  // Manejar cambio en input file
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Quitar archivo subido
  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Upload className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Subir Comprobante de Pago</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">ImageKit</span>
        {imagekitAvailable === null && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>

      {/* Mensaje de ImageKit no disponible */}
      {imagekitAvailable === false && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-amber-900 mb-2">ImageKit no está configurado</h5>
              <p className="text-sm text-amber-700 mb-3">
                Para poder subir comprobantes de pago, necesitas configurar ImageKit en las variables de entorno.
              </p>
              <div className="bg-amber-100 p-2 rounded text-xs text-amber-800 mb-3">
                <p><strong>Instrucciones:</strong></p>
                <p>1. Crea cuenta gratuita en imagekit.io</p>
                <p>2. Copia las credenciales al archivo .env</p>
                <p>3. Reinicia el servidor</p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://imagekit.io/registration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Registrarse en ImageKit
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de subida - deshabilitada si ImageKit no está disponible */}
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            imagekitAvailable === false 
              ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
              : dragActive 
                ? 'border-cyan-400 bg-cyan-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={imagekitAvailable !== false ? handleDrag : undefined}
          onDragLeave={imagekitAvailable !== false ? handleDrag : undefined}
          onDragOver={imagekitAvailable !== false ? handleDrag : undefined}
          onDrop={imagekitAvailable !== false ? handleDrop : undefined}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex space-x-2 text-gray-400">
                <Image className="w-8 h-8" />
                <FileText className="w-8 h-8" />
              </div>
            </div>
            
            <div>
              <p className={`mb-2 ${imagekitAvailable === false ? 'text-gray-400' : 'text-gray-600'}`}>
                {imagekitAvailable === false 
                  ? 'Subida no disponible - ImageKit no configurado'
                  : 'Arrastra tu comprobante aquí o haz clic para seleccionar'
                }
              </p>
              <p className={`text-sm ${imagekitAvailable === false ? 'text-gray-400' : 'text-gray-500'}`}>
                PNG, JPG o PDF • Máximo 5MB
              </p>
            </div>

            <div>
              <input
                type="file"
                id="proof-upload"
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleInputChange}
                disabled={uploading || imagekitAvailable === false}
              />
              <label
                htmlFor="proof-upload"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                  uploading || imagekitAvailable === false
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subiendo...
                  </>
                ) : imagekitAvailable === false ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    ImageKit no configurado
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      ) : (
        // Archivo subido exitosamente
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-green-900">Comprobante subido exitosamente</h5>
              <div className="mt-2 text-sm text-green-700">
                <p className="flex items-center space-x-2">
                  {uploadedFile.isImage ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{uploadedFile.name}</span>
                  <span className="text-green-600">({formatFileSize(uploadedFile.size)})</span>
                </p>
              </div>
              {uploadedFile.isImage && (
                <div className="mt-3">
                  <img
                    src={uploadedFile.url}
                    alt="Comprobante de pago"
                    className="h-20 w-auto rounded border border-green-200"
                  />
                </div>
              )}
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-green-600 hover:text-green-800"
              title="Quitar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        {imagekitAvailable === false ? (
          <>
            <p>• <strong>ImageKit no está configurado</strong></p>
            <p>• Regístrate gratis en imagekit.io (20GB gratuitos)</p>
            <p>• Configura las credenciales en el archivo .env</p>
            <p>• Reinicia el servidor para aplicar cambios</p>
          </>
        ) : (
          <>
            <p>• Los comprobantes se guardan de forma segura en ImageKit</p>
            <p>• Solo tú y los administradores pueden ver tus comprobantes</p>
            <p>• Los archivos se asocian automáticamente a tu pedido</p>
            <p>• Servicio CDN global para carga rápida</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentProofUploader;