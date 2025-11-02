import React, { useState } from 'react';
import OrderSummary from './OrderSummary';
import { Download } from 'lucide-react';
import InvoiceGenerator from '../InvoiceGenerator';

const OrderConfirmation = ({
  cartItems,
  subtotal,
  shipping,
  total,
  receiptFile,
  isLoading,
  onSubmit,
  onBack,
  formData,
  selectedPaymentMethod
  ,
  orderCreated,
  orderId
}) => {
  return (
    <div className="space-y-8">
      {/* Resumen del Pedido */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumen del Pedido
        </h3>
        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          isLoading={isLoading}
          hideSubmitButton
        />
      </div>

      {/* Comprobante subido (si existe) */}
      {/* Generador de comprobante PDF (factura) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <InvoiceGenerator
          orderData={{
            id: orderCreated ? orderId : `TEMP-${Date.now()}`,
            items: cartItems,
            createdAt: new Date(),
            deliveryFee: shipping,
            status: 'Pendiente',
            paymentMethod: selectedPaymentMethod
          }}
          customerData={{
            firstName: formData.fullName || '',
            lastName: '',
            email: formData.email || '',
            phone: formData.phone || '',
            address: formData.address || ''
          }}
        />
      </div>

      {/* Botones de navegación / Mensaje de confirmación */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Volver
        </button>

        {!orderCreated ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium inline-flex items-center"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center space-x-4">
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Pedido registrado correctamente</h4>
              <p className="text-sm text-green-800">Número de pedido: <strong>{orderId}</strong></p>
              <p className="text-sm text-green-800 mt-1">Por favor comunícate con el administrador si necesitas asistencia.</p>
            </div>
            <AdminContact />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;

// Component para manejar la descarga con barra de progreso
const DownloadableReceipt = ({ receiptFile }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const streamDownload = async (url, filename) => {
    try {
      setDownloading(true);
      setProgress(0);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error descargando el archivo');

      const contentLength = response.headers.get('content-length');
      if (!response.body || !contentLength) {
        // Fallback: no streaming available or no content-length
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, filename);
        URL.revokeObjectURL(objectUrl);
        setProgress(100);
        return;
      }

      const total = parseInt(contentLength, 10);
      const reader = response.body.getReader();
      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setProgress(Math.round((received / total) * 100));
      }

      // Concatenate chunks
      const blob = new Blob(chunks);
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      URL.revokeObjectURL(objectUrl);
      setProgress(100);
    } catch (err) {
      console.error('Download error', err);
      // Intentar abrir en nueva pestaña como fallback
      window.open(receiptFile.url || '#', '_blank');
    } finally {
      // pequeña pausa para que el usuario vea 100%
      setTimeout(() => {
        setDownloading(false);
        setProgress(0);
      }, 800);
    }
  };

  const triggerDownload = (objectUrl, filename) => {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || 'comprobante';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownload = async () => {
    // Si receiptFile es un File (no subido), usar URL.createObjectURL
    if (receiptFile instanceof File) {
      const objectUrl = URL.createObjectURL(receiptFile);
      triggerDownload(objectUrl, receiptFile.name || 'comprobante');
      URL.revokeObjectURL(objectUrl);
      return;
    }

    // Si tiene url, usar streaming con progreso
    const url = receiptFile.url || receiptFile;
    const filename = receiptFile.name || 'comprobante';
    await streamDownload(url, filename);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Comprobante
        </button>
        {receiptFile.name && (
          <span className="text-sm text-gray-700">{receiptFile.name}</span>
        )}
      </div>

      {downloading && (
        <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
          <div className="h-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

// Componente para mostrar contacto del administrador
const AdminContact = () => {
  const adminPhone = import.meta.env.VITE_CONTACT_WHATSAPP || '+1234567890';
  const phoneDigits = adminPhone.replace(/\D/g, '');
  const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent('Hola, necesito asistencia con mi pedido')}`;

  return (
    <div className="flex flex-col items-end space-y-2">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
      >
        Contactar Admin
      </a>
      <a href={`tel:${phoneDigits}`} className="text-sm text-gray-700">{adminPhone}</a>
    </div>
  );
};