import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const Home = () => {
  const { getCartItemsCount } = useCart();
  const totalItems = getCartItemsCount();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/images/logos/zapastroso-logo.png" 
                  alt="Zapastroso Logo" 
                  className="h-12 w-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    // Fallback si no existe el logo
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center space-x-2" style={{display: 'none'}}>
                  <span className="text-3xl">👟</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    Zapastroso
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/catalogo" className="text-gray-700 hover:text-cyan-600 transition duration-300">
                Catálogo
              </Link>
              <Link to="/firebase-test" className="text-gray-700 hover:text-cyan-600 transition duration-300">
                🔧 Setup
              </Link>
              <Link to="/carrito" className="text-gray-700 hover:text-cyan-600 transition duration-300 relative">
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              <Link to="/login" className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-md hover:from-cyan-600 hover:to-teal-700 transition duration-300 font-semibold shadow-md">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Zapastroso
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Los mejores tenis y calzado deportivo. Encuentra tu estilo perfecto con la mejor calidad y precios increíbles
          </p>
          <Link 
            to="/catalogo"
            className="bg-white text-cyan-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              ¿Por qué elegir Zapastroso?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-cyan-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Solo trabajamos con las mejores marcas y productos de calidad superior
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-teal-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Últimas Tendencias</h3>
              <p className="text-gray-600">
                Mantente al día con los modelos más nuevos y populares del mercado
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-cyan-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compra Segura</h3>
              <p className="text-gray-600">
                Múltiples opciones de pago y entrega para tu comodidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para encontrar tu par perfecto?
          </h2>
          <p className="text-xl mb-8">
            Explora nuestro catálogo completo y encuentra los tenis de tus sueños
          </p>
          <Link 
            to="/catalogo"
            className="bg-white text-teal-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Zapastroso. Todos los derechos reservados.</p>
          <p className="mt-2 text-gray-400">
            La mejor tienda de calzado deportivo - Desarrollado con React, Firebase & Passion for Great UX
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;