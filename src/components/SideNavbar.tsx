import { FileText, Home, Settings, HelpCircle, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SideNavbarProps {
  currentPage: string;
}

const SideNavbar = ({ currentPage }: SideNavbarProps) => {

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      href: '/',
      isActive: currentPage === 'home'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      href: '/documents',
      isActive: currentPage === 'documents'
    },
    {
      id: 'portal',
      label: 'Portal',
      icon: <FileText className="w-5 h-5" />,
      href: '/portal',
      isActive: currentPage === 'portal'
    }
  ];

  const bottomNavItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      href: '#',
      isActive: false
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '#',
      isActive: false
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="w-5 h-5" />,
      href: '#',
      isActive: false
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50">
      {/* Logo Section */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">HR Portal</span>
      </div>

      {/* Main Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="space-y-2">
          {bottomNavItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
          
          {/* Logout */}
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
