import { CreditCard, Check, Upload, X } from "lucide-react";

const PaymentMethodSelector = ({ 
  selectedPaymentMethod, 
  onPaymentMethodChange,
  formData,
  errors,
  receiptFile,
  onFormDataChange,
  onReceiptUpload,
  onReceiptRemove
}) => {
  const paymentMethods = [
    {
      id: 'qr',
      name: 'QR Yape/Plin',
      description: 'Pago rápido con código QR',
      icon: '📱'
    },
    {
      id: 'cash',
      name: 'Contraentrega',
      description: 'Pagar al recibir el producto',
      icon: '💵'
    },
    // Tarjeta eliminada según solicitud
  ];

  const handleInputChange = (e) => {
    onFormDataChange(e.target.name, e.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
        <CreditCard className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
        Método de Pago
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => onPaymentMethodChange(method.id)}
            className={`flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPaymentMethod === method.id
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedPaymentMethod === method.id
                  ? "border-cyan-500 bg-cyan-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}>
                {selectedPaymentMethod === method.id && (
                  <div className="w-full h-full rounded-full bg-white" />
                )}
              </div>
              <div className="text-lg sm:text-xl">{method.icon}</div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {method.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              </div>
            </div>
            {selectedPaymentMethod === method.id && (
              <Check className="w-5 h-5 text-cyan-500" />
            )}
          </div>
        ))}
      </div>

      {/* Formulario de comprobante QR - Responsivo */}
      {selectedPaymentMethod === 'qr' && (
        <div className="mt-4 sm:mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {/* Mostrar el QR primero, luego número de transacción y finalmente el comprobante */}
          <div className="text-center mb-4">
            <img
              src="/images/qr-pago.png"
              alt="QR de Pago"
              className="mx-auto w-48 h-48 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <h3 className="font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            Sube tu comprobante de pago
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de transacción *
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                name="transactionNumber"
                value={formData.transactionNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 sm:py-3 border rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors ${
                  errors.transactionNumber
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-500"
                }`}
                placeholder="Ej: 1234567890"
              />
              {errors.transactionNumber && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.transactionNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comprobante de pago *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center bg-white dark:bg-gray-600">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onReceiptUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">
                    Haz clic para subir tu comprobante
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG hasta 5MB
                  </p>
                </label>
              </div>
              
              {receiptFile && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        {receiptFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onReceiptRemove}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.receipt && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.receipt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;