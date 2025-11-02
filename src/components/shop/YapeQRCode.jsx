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
      {/* Imagen QR removida de aquí; el QR se muestra en el selector para mantener un solo lugar visible */}

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