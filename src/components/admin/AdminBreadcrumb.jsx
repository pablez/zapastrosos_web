import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumb = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap = {
      'admin': 'Dashboard',
      'productos': 'Productos',
      'categorias': 'Categorías', 
      'pedidos': 'Pedidos',
      'usuarios': 'Administradores',
      'perfil': 'Mi Perfil'
    };

    let breadcrumbs = [{ name: 'Inicio', href: '/admin', icon: Home }];
    
    if (segments.length > 1) {
      segments.slice(1).forEach((segment, index) => {
        const name = breadcrumbMap[segment] || segment;
        const href = '/' + segments.slice(0, index + 2).join('/');
        breadcrumbs.push({ name, href });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
          {breadcrumb.icon && <breadcrumb.icon className="w-3 h-3 mr-1" />}
          <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-700'}>
            {breadcrumb.name}
          </span>
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;