import { Home, FileText, MessageCircle, Users } from 'lucide-react';
import { Button } from './ui/button';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'record', label: 'Record', icon: FileText },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 px-2 bg-white border-t border-[#6AA6FF]/20 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 h-16 ${
              isActive ? 'text-[#6AA6FF]' : 'text-gray-400'
            }`}
          >
            <Icon className={`h-6 w-6 ${isActive ? 'fill-[#6AA6FF]/20' : ''}`} />
            <span className="text-xs">{tab.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}