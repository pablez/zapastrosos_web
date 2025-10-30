import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Componentes de páginas (los crearemos después)
import Home from './components/shop/Home';
import ProductCatalog from './components/shop/ProductCatalog';
import ProductDetail from './components/shop/ProductDetail';
import Cart from './components/shop/Cart';
import Checkout from './components/shop/Checkout';
import Login from './components/auth/Login';
import AdminPanel from './components/admin/AdminPanel';
import AdminSetup from './components/admin/AdminSetup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FirebaseTest from './components/admin/FirebaseTest';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
              {/* Rutas públicas de la tienda */}
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<ProductCatalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Rutas de autenticación */}
              <Route path="/login" element={<Login />} />
              
              {/* Ruta de configuración inicial */}
              <Route path="/admin-setup" element={<AdminSetup />} />
              
              {/* Ruta de configuración Firebase */}
              <Route path="/firebase-test" element={<FirebaseTest />} />
              
              {/* Rutas protegidas del admin */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App
