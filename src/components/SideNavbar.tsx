import { FileText, Pen, Settings, HelpCircle, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

interface SideNavbarProps {
  currentPage: string;
}

const SideNavbar = ({ currentPage }: SideNavbarProps) => {
  const navItems = [
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5 text-gray-600" />,
      href: '/documents',
      isActive: currentPage === 'documents'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5 text-gray-600" />,
      href: '/templates',
      isActive: currentPage === 'templates'
    },
    {
      id: 'portal',
      label: 'Portal',
      icon: <Pen className="w-5 h-5 text-gray-600" />,
      href: '/portal',
      isActive: currentPage === 'portal'
    }
  ];

  const bottomNavItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5 text-gray-600" />,
      href: '#',
      isActive: false
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      href: '#',
      isActive: false
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="w-5 h-5 text-gray-600" />,
      href: '#',
      isActive: false
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-50 transition-all duration-300 w-20 hover:w-64 group">
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">HR Portal</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 mt-8">
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
              title={item.label}
            >
              <div className={item.isActive ? 'text-blue-700' : 'text-gray-600'}>
                {React.cloneElement(item.icon, { 
                  className: `w-5 h-5 ${item.isActive ? 'text-blue-700' : 'text-gray-600'}`
                })}
              </div>
              <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
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
              title={item.label}
            >
              <div className={item.isActive ? 'text-blue-700' : 'text-gray-600'}>
                {React.cloneElement(item.icon, { 
                  className: `w-5 h-5 ${item.isActive ? 'text-blue-700' : 'text-gray-600'}`
                })}
              </div>
              <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
            </a>
          ))}
          
          {/* Logout */}
          <button 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 hover:text-red-700" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
