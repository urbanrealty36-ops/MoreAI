'use client';

import React, { useState } from 'react';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientBottomNav, ClientTab } from '@/components/client/ClientBottomNav';
import { ClientHome } from '@/components/client/ClientHome';
import { ClientChat } from '@/components/client/ClientChat';
import { ClientAgents } from '@/components/client/ClientAgents';
import { ClientTools } from '@/components/client/ClientTools';
import { ClientWallet } from '@/components/client/ClientWallet';
import { ClientSubscriptions } from '@/components/client/ClientSubscriptions';
import { ClientPartnerAccess } from '@/components/client/ClientPartnerAccess';
import { ClientAccount } from '@/components/client/ClientAccount';
import { ClientMemory } from '@/components/client/ClientMemory';
import { ClientHistory } from '@/components/client/ClientHistory';
import { ClientNotifications } from '@/components/client/ClientNotifications';
import { ClientSettings } from '@/components/client/ClientSettings';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { RegisterScreen } from '@/components/screens/RegisterScreen';
import { PostAuthAccessChoiceScreen } from '@/components/screens/PostAuthAccessChoiceScreen';
import { CaptivePortalScreen } from '@/components/screens/CaptivePortalScreen';
import { ClientFilesModal } from '@/components/client/ClientFilesModal';
import { ManusAgentWorkflowView } from '@/components/manus/ManusAgentWorkflowView';
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner';
import { SuperAdminView } from '@/components/admin/SuperAdminView';
import { PartnerPortalView } from '@/components/partner/PartnerPortalView';
import { NetworkAccessExperience } from '@/components/network-flow/NetworkAccessExperience';
import {
  Smartphone,
  Laptop,
  Shield,
  Coffee,
  Workflow,
  Sparkles,
  Bot,
  UserCheck,
  Compass,
  Wifi,
  HardDrive,
} from 'lucide-react';

export type SurfaceView =
  | 'client'
  | 'captive'
  | 'manus'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'access-choice'
  | 'admin'
  | 'partner'
  | 'flow';

export default function Home() {
  const [currentSurface, setCurrentSurface] = useState<SurfaceView>('client');
  const [activeClientTab, setActiveClientTab] = useState<ClientTab>('beranda');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // App State
  const [userName, setUserName] = useState('Budi Santoso');
  const [creditBalance, setCreditBalance] = useState(2500);
  const [partnerActive, setPartnerActive] = useState(true);
  const [partnerName, setPartnerName] = useState('Cafe MoreAI Kemang');
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);

  // Modals for in-workspace quick views
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavigateClient = (tab: ClientTab, preset?: string) => {
    setActiveClientTab(tab);
    if (preset) {
      setInitialChatPrompt(preset);
    }
  };

  const handleDeductCredit = (amt: number) => {
    setCreditBalance((prev) => Math.max(0, prev - amt));
  };

  const handleTopUpCredit = (amt: number) => {
    setCreditBalance((prev) => prev + amt);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-[#171817]' : 'bg-[#F7F4EC]'}`}>
      {/* PWA In-App Install Prompt & Offline Banner */}
      <PWAInstallBanner />

      {/* Top Universal Ecosystem Switcher Bar */}
      <nav className="bg-white dark:bg-[#1E201D] border-b-2 border-[#171717] dark:border-[#4A4A46] px-3 py-2 z-40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Surface View Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* 1. Web Client PWA */}
            <button
              onClick={() => setCurrentSurface('client')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'client'
                  ? 'bg-[#C9F2D5] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Web Client (PWA)</span>
            </button>

            {/* 2. Chat & Agen Otonom */}
            <button
              onClick={() => {
                setCurrentSurface('client');
                setActiveClientTab('chat');
              }}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'client' && activeClientTab === 'chat'
                  ? 'bg-[#D9D5FF] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-700" />
              <span>Chat & Agen Otonom</span>
            </button>

            {/* 3. Captive Portal (Wi-Fi Gateway Splash) */}
            <button
              onClick={() => setCurrentSurface('captive')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'captive'
                  ? 'bg-[#C9F2D5] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              <span>Captive Portal (Wi-Fi)</span>
            </button>

            {/* 4. Onboarding Page */}
            <button
              onClick={() => setCurrentSurface('onboarding')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'onboarding'
                  ? 'bg-[#FBE7B2] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Onboarding (4 Layar)</span>
            </button>

            {/* 4. Login Page */}
            <button
              onClick={() => setCurrentSurface('login')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'login'
                  ? 'bg-[#F9D8E5] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-pink-600" />
              <span>Login / Masuk</span>
            </button>

            {/* 5. Access Choice Page */}
            <button
              onClick={() => setCurrentSurface('access-choice')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'access-choice'
                  ? 'bg-[#FFDCCB] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-orange-600" />
              <span>Pilihan Akses (Mitra / Pro)</span>
            </button>

            {/* 6. Web SuperAdmin */}
            <button
              onClick={() => setCurrentSurface('admin')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'admin'
                  ? 'bg-[#FBE7B2] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>SuperAdmin (17 Modul)</span>
            </button>

            {/* 7. Web Portal Mitra */}
            <button
              onClick={() => setCurrentSurface('partner')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'partner'
                  ? 'bg-[#D9D5FF] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Portal Mitra (Venue)</span>
            </button>

            {/* 8. Alur Pengalaman Mitra */}
            <button
              onClick={() => setCurrentSurface('flow')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition border-2 border-[#171717] flex items-center gap-1.5 shrink-0 ${
                currentSurface === 'flow'
                  ? 'bg-[#D8ECFF] text-[#171717] neo-shadow-sm'
                  : 'bg-white dark:bg-[#2A2C28] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Simulasi Alur 9 Tahap</span>
            </button>
          </div>

          {/* Viewport Frame Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="neo-btn bg-white dark:bg-[#2A2C28] text-xs px-2.5 py-1 flex items-center gap-1.5 text-gray-800 dark:text-gray-200"
              title="Toggle Mobile Mockup Frame"
            >
              {isPhoneFrame ? (
                <>
                  <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Frame HP PWA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 flex justify-center items-start">
        <div
          className={`w-full transition-all duration-200 ${
            isPhoneFrame
              ? 'max-w-[420px] my-4 mx-auto border-4 border-[#171717] dark:border-[#555] rounded-[2.5rem] bg-[#F7F4EC] dark:bg-[#1E201D] neo-shadow-xl overflow-hidden min-h-[780px]'
              : 'w-full'
          }`}
        >
          {/* Phone Frame Speaker Notch (only shown when phone frame is active) */}
          {isPhoneFrame && (
            <div className="h-5 bg-[#171717] flex items-center justify-center">
              <div className="w-16 h-1 bg-gray-600 rounded-full" />
            </div>
          )}

          {/* CAPTIVE PORTAL MULTI-TENANT SPLASH SCREEN */}
          {currentSurface === 'captive' && (
            <CaptivePortalScreen
              onSuccessConnect={(venue, bonus) => {
                setPartnerActive(true);
                setPartnerName(venue);
                setCreditBalance((prev) => prev + bonus);
              }}
              onGoToPwa={() => {
                setCurrentSurface('client');
                setActiveClientTab('beranda');
              }}
            />
          )}

          {/* 1. ONBOARDING FULL SCREEN */}
          {currentSurface === 'onboarding' && (
            <OnboardingScreen
              onComplete={() => setCurrentSurface('access-choice')}
              onGoToLogin={() => setCurrentSurface('login')}
            />
          )}

          {/* 2. LOGIN FULL SCREEN */}
          {currentSurface === 'login' && (
            <LoginScreen
              onSuccess={(name) => {
                setUserName(name);
                setCurrentSurface('access-choice');
              }}
              onGoToRegister={() => setCurrentSurface('register')}
              onBackToOnboarding={() => setCurrentSurface('onboarding')}
            />
          )}

          {/* 3. REGISTER FULL SCREEN */}
          {currentSurface === 'register' && (
            <RegisterScreen
              onSuccess={(name) => {
                setUserName(name);
                setCurrentSurface('access-choice');
              }}
              onGoToLogin={() => setCurrentSurface('login')}
            />
          )}

          {/* 4. POST-AUTH ACCESS DECISION SCREEN */}
          {currentSurface === 'access-choice' && (
            <PostAuthAccessChoiceScreen
              userName={userName}
              onChoosePartner={() => {
                setPartnerActive(true);
                setCreditBalance((prev) => prev + 5000);
                setCurrentSurface('client');
                setShowPartnerModal(true);
              }}
              onChooseSubscribe={() => {
                setCurrentSurface('client');
                setShowSubscriptionsModal(true);
              }}
              onChooseGeneralFree={() => {
                setCurrentSurface('client');
                setActiveClientTab('beranda');
              }}
            />
          )}

          {/* 5. AGENT WORKFLOW STUDIO */}
          {currentSurface === 'manus' && <ManusAgentWorkflowView />}

          {/* 6. WEB CLIENT (PWA) WORKSPACE */}
          {currentSurface === 'client' && (
            <div className="relative min-h-[calc(100vh-65px)] flex flex-col">
              {/* Header Nav */}
              <ClientHeader
                creditBalance={creditBalance}
                partnerActive={partnerActive}
                partnerName={partnerName}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onOpenWallet={() => setShowWalletModal(true)}
                onOpenPartnerAccess={() => setShowPartnerModal(true)}
                isDark={isDark}
                onToggleDark={toggleDark}
              />

              {/* Sub-Views rendered by activeClientTab */}
              <div className="flex-1">
                {activeClientTab === 'beranda' && (
                  <ClientHome
                    creditBalance={creditBalance}
                    partnerActive={partnerActive}
                    partnerName={partnerName}
                    onNavigate={handleNavigateClient}
                    onOpenPartnerModal={() => setShowPartnerModal(true)}
                    onOpenWallet={() => setShowWalletModal(true)}
                  />
                )}

                {activeClientTab === 'chat' && (
                  <ClientChat
                    initialPrompt={initialChatPrompt}
                    onClearInitialPrompt={() => setInitialChatPrompt(undefined)}
                    onDeductCredit={handleDeductCredit}
                  />
                )}

                {activeClientTab === 'agents' && (
                  <ClientAgents
                    onSelectAgent={(name, prompt) => handleNavigateClient('chat', prompt)}
                  />
                )}

                {activeClientTab === 'tools' && (
                  <ClientTools
                    onUseTool={(toolName) =>
                      handleNavigateClient('chat', `Tolong jalankan analisis menggunakan tool: ${toolName}`)
                    }
                  />
                )}

                {activeClientTab === 'akun' && (
                  <ClientAccount
                    creditBalance={creditBalance}
                    partnerActive={partnerActive}
                    onOpenSubscriptions={() => setShowSubscriptionsModal(true)}
                    onOpenWallet={() => setShowWalletModal(true)}
                    onOpenMemory={() => setShowMemoryModal(true)}
                    onOpenHistory={() => setShowHistoryModal(true)}
                    onOpenNotifications={() => setShowNotificationsModal(true)}
                    onOpenSettings={() => setShowSettingsModal(true)}
                    onOpenFiles={() => setShowFilesModal(true)}
                    isDark={isDark}
                    onToggleDark={toggleDark}
                    onOpenOnboarding={() => setCurrentSurface('onboarding')}
                    onOpenAuth={() => setCurrentSurface('login')}
                  />
                )}
              </div>

              {/* Bottom Nav Bar (Mobile-First responsive) */}
              <ClientBottomNav
                activeTab={activeClientTab}
                onSelectTab={setActiveClientTab}
              />
            </div>
          )}

          {/* 7. SUPER ADMIN VIEW (17 MODUL) */}
          {currentSurface === 'admin' && <SuperAdminView />}

          {/* 8. PARTNER PORTAL VIEW */}
          {currentSurface === 'partner' && <PartnerPortalView />}

          {/* 9. NETWORK ACCESS FLOW (9 STEPS SIMULATOR) */}
          {currentSurface === 'flow' && <NetworkAccessExperience />}
        </div>
      </div>

      {/* QUICK IN-WORKSPACE MODALS */}
      {/* Partner Activation Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowPartnerModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientPartnerAccess
              partnerActive={partnerActive}
              onActivate={(name, credits) => {
                setPartnerActive(true);
                setPartnerName(name);
                setCreditBalance((prev) => prev + credits);
                setShowPartnerModal(false);
              }}
              onDeactivate={() => {
                setPartnerActive(false);
                setShowPartnerModal(false);
              }}
              onNavigateChat={() => {
                setShowPartnerModal(false);
                setActiveClientTab('chat');
              }}
            />
          </div>
        </div>
      )}

      {/* Wallet / Credit Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientWallet
              creditBalance={creditBalance}
              onTopUp={handleTopUpCredit}
            />
          </div>
        </div>
      )}

      {/* Subscriptions Modal */}
      {showSubscriptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowSubscriptionsModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientSubscriptions />
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowMemoryModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientMemory />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientHistory
              onOpenSession={(title) => {
                setShowHistoryModal(false);
                handleNavigateClient('chat', `Lanjutkan sesi: ${title}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientNotifications />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] neo-shadow-xl relative p-1">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-xs font-black"
            >
              ✕
            </button>
            <ClientSettings
              isDark={isDark}
              onToggleDark={toggleDark}
              onOpenAuth={() => {
                setShowSettingsModal(false);
                setCurrentSurface('login');
              }}
            />
          </div>
        </div>
      )}

      {/* Files & Workspace Artifacts Modal */}
      {showFilesModal && (
        <ClientFilesModal
          onClose={() => setShowFilesModal(false)}
          onOpenInChat={(filename) => {
            handleNavigateClient('chat', `Tolong buka dan jelaskan ringkasan dari berkas: ${filename}`);
          }}
        />
      )}
    </div>
  );
}
