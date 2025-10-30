import React from 'react';
import { FileText, Image, Download, Calendar, ExternalLink } from 'lucide-react';

const PaymentProofViewer = ({ paymentProofs = [] }) => {
  if (!paymentProofs || paymentProofs.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Comprobantes de Pago
        </h3>
        <p className="text-sm text-gray-500 italic">
          No se han subido comprobantes de pago para este pedido.
        </p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadFile = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'comprobante';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileInfo = (proof) => {
    // Si ya tiene la información del servicio (ImageKit), usarla
    if (proof.service === 'imagekit') {
      return {
        isImage: proof.type?.startsWith('image/') || false,
        isPDF: proof.type === 'application/pdf' || false,
        service: 'imagekit'
      };
    }
    
    // Fallback para archivos antiguos o sin información de servicio
    const fileExtension = proof.fileName?.split('.').pop()?.toLowerCase() || '';
    return {
      isImage: ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension),
      isPDF: fileExtension === 'pdf',
      service: proof.service || 'unknown'
    };
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <FileText className="w-4 h-4 mr-2" />
        Comprobantes de Pago ({paymentProofs.length})
      </h3>
      
      <div className="space-y-3">
        {paymentProofs.map((proof, index) => {
          const fileInfo = getFileInfo(proof);
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Ícono del tipo de archivo */}
                  <div className="mt-0.5">
                    {fileInfo.isImage ? (
                      <Image className="w-5 h-5 text-blue-500" />
                    ) : fileInfo.isPDF ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {proof.fileName || fileInfo.fileName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Subido: {formatDate(proof.uploadedAt)}
                    </p>
                    {proof.uploadedBy && (
                      <p className="text-xs text-gray-500">
                        Por: {proof.uploadedBy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón de descarga */}
                <button
                  onClick={() => downloadFile(proof.url, proof.fileName)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Descargar comprobante"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Vista previa para imágenes */}
              {fileInfo.isImage && (
                <div className="mt-3">
                  <img
                    src={proof.url}
                    alt="Comprobante de pago"
                    className="max-w-full h-32 object-contain rounded border border-gray-200 cursor-pointer"
                    onClick={() => window.open(proof.url, '_blank')}
                    title="Clic para ver en tamaño completo"
                  />
                </div>
              )}

              {/* Indicador para PDFs */}
              {fileInfo.isPDF && (
                <div className="mt-3">
                  <button
                    onClick={() => window.open(proof.url, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver PDF en nueva ventana
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentProofViewer;