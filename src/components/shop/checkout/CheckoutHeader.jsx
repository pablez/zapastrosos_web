import { Link } from "react-router-dom";
import { Store, ShoppingCart, ArrowLeft } from "lucide-react";
import ThemeToggle from "../../ui/ThemeToggle";

const CheckoutHeader = ({ cartItemsCount, total, onBackToCart }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Zapastrosos
              </span>
            </Link>
          </div>

          {/* Logo móvil */}
          <div className="md:hidden flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Zapastrosos
              </span>
            </Link>
          </div>

          {/* Info del pedido - Desktop */}
          <div className="hidden md:block text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Finalizar Compra
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {cartItemsCount} producto{cartItemsCount !== 1 ? "s" : ""} • Total: Bs. {total.toFixed(2)}
            </p>
          </div>

          {/* Botones de navegación */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <button
              onClick={onBackToCart}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Link
              to="/"
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Inicio
            </Link>
          </div>
        </div>

        {/* Info del pedido - Móvil */}
        <div className="md:hidden pb-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Finalizar Compra
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cartItemsCount} producto{cartItemsCount !== 1 ? "s" : ""} • Total: Bs. {total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutHeader;