import React from 'react';

const CheckoutSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'Información Personal' },
    { id: 2, title: 'Pago' },
    { id: 3, title: 'Confirmación' }
  ];

  return (
    <div className="py-4">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Línea conectora */}
            {index > 0 && (
              <div 
                className={`h-1 w-16 ${
                  currentStep >= step.id ? 'bg-cyan-600' : 'bg-gray-200'
                }`}
              />
            )}
            
            {/* Círculo de paso */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id 
                    ? 'border-cyan-600 bg-cyan-600 text-white'
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                {step.id}
              </div>
              <span 
                className={`mt-2 text-sm ${
                  currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;