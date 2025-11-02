import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp, Sparkles, Percent, Recycle, Menu, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ThemeToggle from '../ui/ThemeToggle';

// Componentes de iconos de redes sociales
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const Home = () => {
  const { getCartItemsCount } = useCart();
  const totalItems = getCartItemsCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [productCounts, setProductCounts] = useState({
    nuevos: 0,
    ofertas: 0,
    medioUso: 0
  });

  // Cargar estadísticas de productos
  useEffect(() => {
    const loadProductStats = async () => {
      try {
        // Cargar productos nuevos
        const nuevosQuery = query(collection(db, 'products'), where('tipo', '==', 'nuevo'));
        const nuevosSnapshot = await getDocs(nuevosQuery);
        
        // Cargar productos de medio uso
        const medioUsoQuery = query(collection(db, 'products'), where('tipo', '==', 'medio uso'));
        const medioUsoSnapshot = await getDocs(medioUsoQuery);
        
        // Cargar productos en oferta (con descuento > 0)
        const ofertasQuery = query(collection(db, 'products'), where('descuento', '>', 0));
        const ofertasSnapshot = await getDocs(ofertasQuery);
        
        setProductCounts({
          nuevos: nuevosSnapshot.docs.length,
          ofertas: ofertasSnapshot.docs.length,
          medioUso: medioUsoSnapshot.docs.length
        });
      } catch (error) {
        console.error('Error cargando estadísticas de productos:', error);
      }
    };

    loadProductStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/images/logos/zapastroso-logo.png" 
                  alt="Zapastroso Logo" 
                  className="h-10 sm:h-12 w-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    // Fallback si no existe el logo
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center space-x-2" style={{display: 'none'}}>
                  <span className="text-2xl sm:text-3xl">👟</span>
                  <span className="text-lg sm:text-2xl font-bold bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    Zapastroso
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Redes Sociales */}
              <div className="flex items-center space-x-2">
                <a 
                  href="https://www.instagram.com/zapastrozosdm?igsh=OGE1d2ZidW1zMm9q" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors duration-300 p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  title="Síguenos en Instagram"
                >
                  <InstagramIcon size={24} />
                </a>
                <a 
                  href="https://www.tiktok.com/@zapastrozos?_t=ZN-90zDfdt6bl0&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Síguenos en TikTok"
                >
                  <TikTokIcon size={24} />
                </a>
                <ThemeToggle size={20} />
              </div>
              
              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link to="/catalogo" className="text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 transition duration-300 font-medium">
                  Catálogo
                </Link>
                <Link to="/firebase-test" className="text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 transition duration-300 font-medium">
                  🔧 Setup
                </Link>
                <Link to="/carrito" className="text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 transition duration-300 relative">
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="bg-linear-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-md hover:from-cyan-600 hover:to-teal-700 transition duration-300 font-semibold shadow-md whitespace-nowrap">
                  Admin
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Cart Icon for Mobile */}
              <Link to="/carrito" className="text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 transition duration-300 relative p-2">
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              
              {/* Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300 p-2"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Social Links */}
                <div className="flex items-center justify-center space-x-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <a 
                    href="https://www.instagram.com/zapastrozosdm?igsh=OGE1d2ZidW1zMm9q" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors duration-300 p-3 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                    title="Síguenos en Instagram"
                  >
                    <InstagramIcon size={28} />
                  </a>
                  <a 
                    href="https://www.tiktok.com/@zapastrozos?_t=ZN-90zDfdt6bl0&_r=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 p-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Síguenos en TikTok"
                  >
                    <TikTokIcon size={28} />
                  </a>
                  <ThemeToggle size={24} />
                </div>

                {/* Navigation Links */}
                <Link 
                  to="/catalogo" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📚 Catálogo
                </Link>
                <Link 
                  to="/firebase-test" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔧 Setup
                </Link>
                <Link 
                  to="/carrito" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🛒 Carrito {totalItems > 0 && `(${totalItems})`}
                </Link>
                <Link 
                  to="/login" 
                  className="block mx-3 my-2 px-4 py-3 text-center bg-linear-to-r from-cyan-500 to-teal-600 text-white rounded-md hover:from-cyan-600 hover:to-teal-700 transition duration-300 font-semibold shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

  {/* Hero Section */}
  <div className="bg-linear-to-r from-cyan-600 via-teal-600 to-blue-700 text-white py-4 md:py-6 lg:py-8 xl:py-10">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 text-center">
          {/* Logo de Letras Principal - Máximo Tamaño y Responsivo */}
          <div className="mb-4 md:mb-6 lg:mb-8 xl:mb-10 flex justify-center items-center min-h-[20vh] md:min-h-[30vh] lg:min-h-[35vh]">
            <img 
              src="/images/logos/letras-logo.webp" 
              alt="Zapastroso - Logo Letras" 
                className="
                w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]
                h-auto
                max-h-[220px] sm:max-h-[280px] md:max-h-[420px] lg:max-h-[420px]
                drop-shadow-2xl 
                hover:scale-[1.02] 
                transition-all duration-700 ease-in-out
                filter brightness-110
                object-contain
                mx-auto
              "
              style={{
                filter: 'drop-shadow(0 30px 80px rgba(0,0,0,0.7)) brightness(1.3) contrast(1.15) saturate(1.1)',
                aspectRatio: 'auto',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              onError={(e) => {
                // Fallback si no se encuentra la imagen
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback text responsivo mejorado */}
            <h1 className="
              hidden 
              text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-10xl 2xl:text-11xl
              font-black text-white 
              leading-none
              tracking-widest
              drop-shadow-2xl
              text-center
              w-full
            " style={{display: 'none'}}>
              ZAPASTROSO
            </h1>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Zapastrozos
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

      {/* Categorías de Productos */}
      <div className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explora Nuestras Categorías
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Encuentra exactamente lo que buscas en nuestras colecciones especializadas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Zapatos Nuevos */}
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center">
                  <Sparkles className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {productCounts.nuevos} productos
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Zapatos Nuevos</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Los últimos modelos y tendencias en calzado deportivo. Productos completamente nuevos con garantía total.
              </p>
              <Link 
                to="/catalogo?tipo=nuevo"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Ver Colección
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Zapatos en Oferta */}
            <div className="bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-red-100 dark:border-red-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 dark:bg-red-800 w-12 h-12 rounded-full flex items-center justify-center">
                  <Percent className="text-red-600 dark:text-red-300" size={24} />
                </div>
                <span className="bg-red-600 dark:bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {productCounts.ofertas} productos
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Zapatos en Oferta</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Increíbles descuentos en productos seleccionados. ¡Aprovecha estas oportunidades únicas!
              </p>
              <Link 
                to="/catalogo?ofertas=true"
                className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors"
              >
                Ver Ofertas
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Zapatos Medio Uso */}
            <div className="bg-linear-to-br from_green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 dark:bg-green-800 w-12 h-12 rounded-full flex items-center justify-center">
                  <Recycle className="text-green-600 dark:text-green-300" size={24} />
                </div>
                <span className="bg-green-600 dark:bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {productCounts.medioUso} productos
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Zapatos Medio Uso</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Calzado de segunda mano en excelente estado. Calidad garantizada a precios accesibles.
              </p>
              <Link 
                to="/catalogo?tipo=medio uso"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors"
              >
                Ver Colección
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              ¿Por qué elegir Zapastroso?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-cyan-100 dark:bg-cyan-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-cyan-600 dark:text-cyan-300" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Calidad Garantizada</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Solo trabajamos con las mejores marcas y productos de calidad superior
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 dark:bg-teal-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-teal-600 dark:text-teal-300" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Últimas Tendencias</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mantente al día con los modelos más nuevos y populares del mercado
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-cyan-100 dark:bg-cyan-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-cyan-600 dark:text-cyan-300" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Compra Segura</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Múltiples opciones de pago y entrega para tu comodidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
  <div className="bg-linear-to-r from-teal-600 to-cyan-600 text-white py-16">
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
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Zapastroso. Todos los derechos reservados.</p>
          <p className="mt-2 text-gray-400 dark:text-gray-500">
            La mejor tienda de calzado deportivo - Desarrollado con React, Firebase & Passion for Great UX
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;