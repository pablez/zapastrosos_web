import { ShoppingBag } from "lucide-react";

const OrderSummary = ({ 
  cartItems, 
  subtotal, 
  shipping, 
  total, 
  isLoading, 
  onSubmit 
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
            Resumen del Pedido
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item, idx) => {
              // Compatibilidad con la forma del carrito (es posible que los campos sean en español)
              const tenisId = item.tenisId ?? item.id ?? `item-${idx}`;
              const variantId = item.variantId ?? item.variantId ?? idx;
              const key = `${tenisId}-${variantId}`;

              const image = item.imagenPrincipal || item.image || '';
              const name = item.nombre || item.name || 'Producto';
              const size = item.talla || item.size || '-';
              const quantity = item.quantity ?? item.cantidad ?? 1;
              const precio = typeof item.precio === 'number' ? item.precio : (item.price ?? item.precioOriginal ?? 0);
              const lineTotal = precio * quantity;

              return (
                <div key={key} className="flex items-center space-x-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <img
                    src={image}
                    alt={name}
                    onError={(e) => { e.currentTarget.src = '/placeholder-100.png'; }}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Talla: {size} • Cantidad: {quantity}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Bs. {lineTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span>Bs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <span>Envío:</span>
                <span>Bs. {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                <span>Total:</span>
                <span>Bs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botón de finalizar compra - Responsivo */}
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full mt-6 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm sm:text-base">Finalizar Compra - Bs. {total.toFixed(2)}</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Al realizar el pedido, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;