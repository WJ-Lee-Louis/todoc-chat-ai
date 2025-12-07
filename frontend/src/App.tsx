import { useState } from 'react';
import Header from './components/common/Header';
import DialNavigation from './screens/Navigation/DialNavigation';
import HomeScreen from './screens/Home/HomeScreen';
import RecordScreen from './screens/Record/RecordScreen';
import ChatScreen from './screens/Chat/ChatScreen';
import CommunityScreen from './screens/Community/CommunityScreen';
import LoginScreen from './screens/Login/LoginScreen';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedBaby, setSelectedBaby] = useState('1');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('home');
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  const handleAddRecord = () => {
    setCurrentTab('record');
  };

  const handleOpenChat = () => {
    setCurrentTab('chat');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen onAddRecord={handleAddRecord} onOpenChat={handleOpenChat} />;
      case 'record':
        return <RecordScreen isDarkMode={isDarkMode} />;
      case 'chat':
        return <ChatScreen />;
      case 'community':
        return <CommunityScreen />;
      default:
        return <HomeScreen onAddRecord={handleAddRecord} onOpenChat={handleOpenChat} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        selectedBaby={selectedBaby}
        onBabyChange={setSelectedBaby}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />

      {/* Main Content Area - Add bottom padding to prevent dial overlap */}
      <main className="flex-1 pt-16 pb-24 overflow-hidden bg-background">
        {renderScreen()}
      </main>

      {/* Dial Navigation */}
      <DialNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}
