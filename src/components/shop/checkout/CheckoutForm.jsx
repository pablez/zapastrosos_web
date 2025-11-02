import React from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import ShippingAddressForm from './ShippingAddressForm';

const CheckoutForm = ({ 
  formData, 
  errors, 
  selectedLocation,
  onChange,
  onLocationSelect,
  onNext
}) => {
  const handleNext = () => {
    // Validar que todos los campos requeridos estén completos
    const required = [
      { key: 'fullName', label: 'Nombre completo' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'address', label: 'Dirección' },
      { key: 'city', label: 'Ciudad' },
      { key: 'zipCode', label: 'Código Postal' }
    ];

    const missing = required.filter(r => !formData[r.key] || String(formData[r.key]).trim() === '');
    if (missing.length > 0) {
      const labels = missing.map(m => m.label).join(', ');
      alert('Completa los siguientes campos antes de continuar: ' + labels);
      return;
    }

    // Email básico
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Ingresa un email válido');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Información Personal */}
      <PersonalInfoForm
        formData={formData}
        errors={errors}
        onChange={onChange}
      />

      {/* Dirección de Envío */}
      <ShippingAddressForm
        formData={formData}
        errors={errors}
        selectedLocation={selectedLocation}
        onChange={onChange}
        onLocationSelect={onLocationSelect}
      />

      {/* Botón Continuar */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
        >
          Continuar al Pago
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;