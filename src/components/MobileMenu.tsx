import React from 'react';
import { X, User, Briefcase, History, Settings, LogOut, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser, userType, logout } = useAppContext();
  const { t } = useLanguage();

  const handleNavigation = (view: string) => {
    onNavigate(view);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const clientMenuItems = [
    { icon: User, label: t('dashboard.title'), view: 'dashboard' },
    { icon: Briefcase, label: t('job.bookService'), view: 'create-job' },
    { icon: History, label: t('dashboard.myJobs'), view: 'dashboard' },
  ];

  const providerMenuItems = [
    { icon: User, label: t('dashboard.title'), view: 'dashboard' },
    { icon: Briefcase, label: t('dashboard.availableJobs'), view: 'dashboard' },
    { icon: History, label: t('dashboard.myJobs'), view: 'dashboard' },
  ];

  const menuItems = userType === 'client' ? clientMenuItems : providerMenuItems;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">{currentUser?.name}</div>
                <div className="text-sm text-gray-500 capitalize">{userType}</div>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        {/* Main Menu Items */}
        <div className="flex-1 mt-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.view}
                variant="ghost"
                className="w-full justify-start h-12 text-left"
                onClick={() => handleNavigation(item.view)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
          
          {/* Settings */}
          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-left"
            onClick={() => handleNavigation('settings')}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          
          {/* Admin Link */}
          <Link to="/admin" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-left"
            >
              <Shield className="w-5 h-5 mr-3" />
              Admin
            </Button>
          </Link>
        </div>
        
        {/* Language Selector */}
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Language</span>
          </div>
          <LanguageSelector />
        </div>
        
        {/* Logout Button */}
        <div className="border-t pt-4">
          <Button
            variant="destructive"
            className="w-full justify-start h-12"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('nav.logout')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
