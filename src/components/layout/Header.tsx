import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Search } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useNotifications } from '../../contexts/NotificationContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeByUserId } = useData();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  
  const employee = user ? getEmployeeByUserId(user.id) : null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, {employee?.name || user?.username}!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          {/* Notifications Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;