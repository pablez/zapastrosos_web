import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

const YapeQRCode = () => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
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
    </div>
  );
};

export default YapeQRCode;