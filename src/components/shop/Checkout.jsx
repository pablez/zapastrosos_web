import React, { useState } from "react";
import CheckoutHeader from "./checkout/CheckoutHeader";
import CheckoutSteps from "./checkout/CheckoutSteps";
import CheckoutForm from "./checkout/CheckoutForm";
import PaymentStep from "./checkout/PaymentStep";
import OrderConfirmation from "./checkout/OrderConfirmation";
import useCheckout from "../../hooks/useCheckout";

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const {
    // Form state
    formData,
    errors,
    isLoading,
    selectedPaymentMethod,
    receiptFile,
    selectedLocation,

    // Carrito y totales
    cartItems,
    subtotal,
    shipping,
    total,

    // Handlers
    updateFormData,
    setSelectedPaymentMethod,
    setReceiptFile,
    handleLocationSelect,
    handleReceiptUpload,
    handleSubmit,
    // Resultado de la orden
    orderCreated,
    orderCreatedId,
    navigateToCart,
  } = useCheckout();

  // Handlers de navegación entre pasos
  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CheckoutHeader
        cartItemsCount={Array.isArray(cartItems) ? cartItems.length : 0}
        total={typeof total === 'number' ? total : 0}
        onBackToCart={navigateToCart}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pasos del checkout */}
        <CheckoutSteps currentStep={currentStep} />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          {/* Columna izquierda - Formularios */}
          <div className="lg:col-span-7">
            {currentStep === 1 && (
              <CheckoutForm
                formData={formData}
                errors={errors}
                selectedLocation={selectedLocation}
                onChange={updateFormData}
                onLocationSelect={handleLocationSelect}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <PaymentStep
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                formData={formData}
                errors={errors}
                receiptFile={receiptFile}
                onFormDataChange={updateFormData}
                onReceiptUpload={handleReceiptUpload}
                onReceiptRemove={() => setReceiptFile(null)}
                userId={formData.userId}
                orderId={formData.orderId}
                onBack={handlePrevStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 3 && (
              <OrderConfirmation
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                receiptFile={receiptFile}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onBack={handlePrevStep}
                formData={formData}
                selectedPaymentMethod={selectedPaymentMethod}
                orderCreated={orderCreated}
                orderId={orderCreatedId}
              />
            )}
          </div>

          {/* Columna derecha - Resumen del pedido */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de tu Pedido
              </h3>
              <div className="space-y-4">
                {/* Items */}
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-gray-500">
                        Cantidad: {item.quantity} × Bs. {item.price}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Totales */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>Bs. {shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total</span>
                    <span>Bs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
