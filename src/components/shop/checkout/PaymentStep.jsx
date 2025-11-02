import React from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';

const PaymentStep = ({
  selectedPaymentMethod,
  onPaymentMethodChange,
  formData,
  errors,
  receiptFile,
  onFormDataChange,
  onReceiptUpload,
  onReceiptRemove,
  userId,
  orderId,
  onBack,
  onNext
}) => {
  const handleNext = () => {
    if (selectedPaymentMethod) {
      // Normalizar: el id del método QR es 'qr'
      if (selectedPaymentMethod === 'qr' && !receiptFile) {
        // Si es QR, requerir comprobante
        return;
      }
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector de Método de Pago */}
      <PaymentMethodSelector
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
        formData={formData}
        errors={errors}
        receiptFile={receiptFile}
        onFormDataChange={onFormDataChange}
        onReceiptUpload={onReceiptUpload}
        onReceiptRemove={onReceiptRemove}
      />

      {/* El QR y el uploader se muestran dentro del selector para un flujo único */}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Volver
        </button>
        <button
          onClick={handleNext}
    disabled={selectedPaymentMethod === 'qr' && !receiptFile}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar a Confirmación
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;