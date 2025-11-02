import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Tag, 
  ShoppingCart, 
  Database, 
  Users, 
  Settings,
  Menu,
  X,
  User,
  Key,
  UserPlus
  ,
  TrendingUp
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      exact: true
    },
    {
      name: 'Productos',
      href: '/admin/productos',
      icon: Package
    },
    {
      name: 'Categorías',
      href: '/admin/categorias',
      icon: Tag
    },
    {
      name: 'Pedidos',
      href: '/admin/pedidos',
      icon: ShoppingCart
    },
    {
      name: 'Reportes',
      href: '/admin/reportes',
      icon: TrendingUp
    },
    {
      name: 'Admins',
      href: '/admin/usuarios',
      icon: Users
    },
    {
      name: 'Perfil',
      href: '/admin/perfil',
      icon: User
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          onClick={toggleSidebar}
        />,
        document.body
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-60 w-40 md:w-44 lg:w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0 md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200">
          <Link to="/admin" className="flex items-center justify-center w-full">
            <img src="/images/logos/letras-logo.webp" alt="Zapastroso" className="h-20 md:h-24 lg:h-28 object-contain" />
          </Link>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-1 px-0">
          <div className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={`
                      group flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-md transition-colors duration-200
                      ${active 
                        ? 'bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                >
                  <Icon className={`
                      mr-3 lg:mr-4 shrink-0 h-5 lg:h-6 w-5 lg:w-6 transition-colors duration-200
                      ${active ? 'text-cyan-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                      <span className="truncate text-sm lg:text-base">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <img src="/images/logos/letras-logo.webp" alt="Zapastroso" className="h-12 md:h-16 object-contain" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;