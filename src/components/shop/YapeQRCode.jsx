import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import PaymentProofUploader from './PaymentProofUploader';

const YapeQRCode = ({ userId, orderId, onProofUploaded }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleUploadSuccess = (downloadURL, fileName, uploadResult) => {
    console.log('Comprobante subido exitosamente:', { downloadURL, fileName, uploadResult });
    if (onProofUploaded) {
      // Pasar toda la información del resultado de upload a Checkout
      onProofUploaded(downloadURL, fileName, uploadResult);
    }
  };

  const handleUploadError = (error) => {
    console.error('Error subiendo comprobante:', error);
    // Aquí podrías mostrar una notificación de error si tienes un sistema de notificaciones
  };

  return (
    <div className="text-center">
      {/* QR Code real de Yape */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg mb-4 inline-block shadow-sm">
        {!imageError ? (
          <img 
            src="/images/qr-pago.png" 
            alt="QR de Yape para pago a Gerardo Pablo Moya Grageda"
            className="w-48 h-48 mx-auto object-contain"
            onError={handleImageError}
          />
        ) : (
          // Fallback si la imagen no carga
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">QR de Yape</p>
            <p className="text-xs text-gray-400">Imagen no disponible</p>
          </div>
        )}
      </div>

      {/* Uploader de comprobantes - solo si tenemos userId y orderId */}
      {userId && orderId && (
        <PaymentProofUploader
          userId={userId}
          orderId={orderId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      )}
    </div>
  );
};

export default YapeQRCode;