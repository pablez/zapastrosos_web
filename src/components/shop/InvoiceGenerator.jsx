import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText } from 'lucide-react';

const InvoiceGenerator = ({ orderData, customerData, onInvoiceGenerated }) => {
  // Generar número de comprobante único
  const generateInvoiceNumber = () => {
    const timestamp = new Date().getTime();
    const orderPrefix = orderData.id?.slice(-4) || '0000';
    return `COMP-${orderPrefix}-${timestamp.toString().slice(-6)}`;
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = orderData.items?.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0) || 0;

    const delivery = orderData.deliveryFee || 0;
    const total = subtotal + delivery;

    return { subtotal, delivery, total };
  };

  // Generar PDF del comprobante
  const generateInvoicePDF = async () => {
    try {
      const invoiceNumber = generateInvoiceNumber();
      const { subtotal, delivery, total } = calculateTotals();
      
      // Crear contenido HTML del comprobante para tamaño carta completo
      const invoiceHTML = `
        <div id="invoice-content" style="
          font-family: 'Arial', sans-serif;
          width: 800px;
          margin: 0 auto;
          padding: 30px;
          background: white;
          color: #333;
          line-height: 1.5;
          font-size: 14px;
          box-sizing: border-box;
        ">
          <!-- Header que ocupa todo el ancho -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; border-bottom: 3px solid #ff6b35; padding-bottom: 20px;">
            <div style="display: flex; align-items: center;">
              <img src="/images/logos/zapastroso-logo.png" alt="Zapastroso Logo" style="width: 80px; height: 80px; margin-right: 20px; object-fit: contain;" />
              <div>
                <h1 style="color: #ff6b35; margin: 0; font-size: 2.2em; font-weight: bold;">Zapastroso</h1>
                <p style="margin: 5px 0; color: #666; font-size: 1.1em;">Tienda de Zapatos Premium</p>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">RUC: 20123456789</p>
              </div>
            </div>
            <div style="text-align: right; font-size: 1em; color: #666; border-left: 2px solid #ff6b35; padding-left: 20px;">
              <p style="margin: 5px 0; font-weight: bold;">CONTACTO</p>
              <p style="margin: 3px 0;">📧 info@zapastroso.com</p>
              <p style="margin: 3px 0;">📱 WhatsApp: +1234567890</p>
              <p style="margin: 3px 0;">🌐 www.zapastroso.com</p>
            </div>
          </div>

          <!-- Info de Comprobante y Cliente ocupando todo el ancho -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="width: 45%;">
              <h3 style="color: #ff6b35; margin: 0 0 12px 0; font-size: 1.3em; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">📋 COMPROBANTE</h3>
              <p style="margin: 8px 0; font-size: 1em;"><strong>Número:</strong> ${invoiceNumber}</p>
              <p style="margin: 8px 0; font-size: 1em;"><strong>Fecha:</strong> ${formatDate(orderData.createdAt || new Date())}</p>
              <p style="margin: 8px 0; font-size: 1em;"><strong>Pedido:</strong> #${orderData.id?.slice(-8) || 'N/A'}</p>
              <p style="margin: 8px 0; font-size: 1em;"><strong>Método Pago:</strong> ${orderData.paymentMethod || 'Pago por QR'}</p>
            </div>
            <div style="width: 50%; background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
              <h3 style="color: #ff6b35; margin: 0 0 12px 0; font-size: 1.3em; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">👤 DATOS DEL CLIENTE</h3>
              <p style="margin: 8px 0; font-size: 1.1em;"><strong>${customerData.firstName} ${customerData.lastName}</strong></p>
              <p style="margin: 6px 0; font-size: 1em;">📧 ${customerData.email}</p>
              <p style="margin: 6px 0; font-size: 1em;">📱 ${customerData.phone}</p>
              <p style="margin: 6px 0; font-size: 1em;">📍 ${customerData.address}</p>
              ${customerData.district ? `<p style="margin: 6px 0; font-size: 1em;">🏙️ ${customerData.district}</p>` : ''}
            </div>
          </div>

          <!-- Tabla de Productos ocupando todo el ancho -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 1em; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(135deg, #ff6b35, #ff8c5a); color: white;">
                <th style="padding: 15px 12px; text-align: left; border: none; font-weight: bold; font-size: 1.1em;">🛍️ Producto</th>
                <th style="padding: 15px 12px; text-align: center; border: none; font-weight: bold; width: 80px;">📏 Talla</th>
                <th style="padding: 15px 12px; text-align: center; border: none; font-weight: bold; width: 80px;">📦 Cant.</th>
                <th style="padding: 15px 12px; text-align: right; border: none; font-weight: bold; width: 120px;">💰 Precio Unit.</th>
                <th style="padding: 15px 12px; text-align: right; border: none; font-weight: bold; width: 120px;">💵 Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items?.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'}; border-bottom: 1px solid #eee;">
                  <td style="padding: 15px 12px; border: none;">
                    <strong style="font-size: 1.1em; color: #333;">${item.name || 'Producto'}</strong>
                    ${item.brand ? `<br><span style="color: #666; font-size: 0.9em; font-style: italic;">Marca: ${item.brand}</span>` : ''}
                    ${item.color ? `<br><span style="color: #666; font-size: 0.9em;">Color: ${item.color}</span>` : ''}
                  </td>
                  <td style="padding: 15px 12px; text-align: center; border: none; font-weight: bold; font-size: 1.1em;">${item.size || '-'}</td>
                  <td style="padding: 15px 12px; text-align: center; border: none; font-weight: bold; font-size: 1.1em;">${item.quantity || 1}</td>
                  <td style="padding: 15px 12px; text-align: right; border: none; font-size: 1em;">Bs. ${(item.price || 0).toFixed(2)}</td>
                  <td style="padding: 15px 12px; text-align: right; border: none; font-weight: bold; font-size: 1.1em; color: #ff6b35;">Bs. ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="padding: 20px; text-align: center; border: none; font-style: italic; color: #666;">No hay productos</td></tr>'}
            </tbody>
          </table>

          <!-- Totales y Resumen ocupando el ancho disponible -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
            <!-- Info de Pago -->
            <div style="width: 45%; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35;">
              <h4 style="margin: 0 0 15px 0; color: #ff6b35; font-size: 1.2em;">💳 INFORMACIÓN DE PAGO</h4>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Estado del Pedido:</span>
                <span style="color: #28a745; font-weight: bold;">${orderData.status || 'Pendiente'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Comprobante:</span>
                ${orderData.paymentProofs && orderData.paymentProofs.length > 0 ? 
                  `<span style="color: #28a745; font-weight: bold;">✅ Adjunto</span>` : 
                  `<span style="color: #ffc107; font-weight: bold;">⏳ Pendiente</span>`
                }
              </div>
            </div>

            <!-- Totales -->
            <div style="width: 50%;">
              <table style="width: 100%; border-collapse: collapse; font-size: 1.1em; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">Bs. ${subtotal.toFixed(2)}</td>
                </tr>
                ${delivery > 0 ? `
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">Delivery:</td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">Bs. ${delivery.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr style="background: linear-gradient(135deg, #ff6b35, #ff8c5a); color: white;">
                  <td style="padding: 18px 20px; text-align: right; font-weight: bold; font-size: 1.3em;">TOTAL:</td>
                  <td style="padding: 18px 20px; text-align: right; font-weight: bold; font-size: 1.3em;">Bs. ${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Footer que ocupa todo el ancho -->
          <div style="margin-top: 30px; text-align: center; background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; border-top: 3px solid #ff6b35;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <div style="text-align: left;">
                <p style="margin: 0; font-size: 1.1em; font-weight: bold; color: #ff6b35;">¡Gracias por tu compra en Zapastroso! 🦶</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;">Este documento es válido como comprobante de compra</p>
              </div>
              <div style="text-align: right; font-size: 0.85em; color: #666;">
                <p style="margin: 0;">Documento generado el:</p>
                <p style="margin: 0; font-weight: bold;">${new Date().toLocaleString('es-PE')}</p>
              </div>
            </div>
            <div style="border-top: 1px solid #ddd; padding-top: 15px;">
              <p style="margin: 0; color: #ff6b35; font-weight: bold; font-size: 1.1em;">Zapastroso - Siempre un paso adelante</p>
              <p style="margin: 5px 0; color: #666; font-size: 0.9em;">Síguenos en redes sociales para ofertas exclusivas</p>
            </div>
          </div>
        </div>
      `;

      // Crear elemento temporal para el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Capturar como imagen optimizada para tamaño carta
      const canvas = await html2canvas(tempDiv.querySelector('#invoice-content'), {
        scale: 2, // Alta calidad para aprovechar toda la hoja
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800, // Ancho fijo para tamaño carta
        height: null // Altura automática
      });

      // Generar PDF en tamaño carta (Letter: 8.5" x 11")
      const pdf = new jsPDF('p', 'mm', 'letter');
      const imgWidth = 195; // Carta: 215.9mm - márgenes de 10mm a cada lado
      const pageHeight = 258; // Carta: 279.4mm - márgenes de 10mm arriba y abajo
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 12; // Margen superior
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 12;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);

      // Descargar PDF
      const fileName = `Comprobante_${invoiceNumber}_${orderData.id || 'pedido'}.pdf`;
      pdf.save(fileName);

      // Notificar que se generó el comprobante
      if (onInvoiceGenerated) {
        onInvoiceGenerated({
          invoiceNumber,
          fileName,
          generatedAt: new Date(),
          total: total
        });
      }

      return { success: true, invoiceNumber, fileName };

    } catch (error) {
      console.error('Error generando comprobante:', error);
      alert('Error al generar el comprobante. Por favor, intenta de nuevo.');
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Comprobante de Compra</h3>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <p>Descarga tu comprobante oficial en tamaño carta completo con logo de Zapastroso y diseño profesional.</p>
        <p className="text-xs mt-1">Documento optimizado para impresión en hoja carta (8.5" x 11") y válido como comprobante de compra.</p>
      </div>

      <button
        onClick={generateInvoicePDF}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Descargar Comprobante (PDF)</span>
      </button>
    </div>
  );
};

export default InvoiceGenerator;