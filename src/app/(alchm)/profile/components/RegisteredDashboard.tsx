import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { signOut } from "next-auth/react";
import React, { useState } from "react";
import { DailyAlignmentWidget } from "@/components/economy/DailyAlignmentWidget";
import { LiveLedgerFeed } from "@/components/economy/LiveLedgerFeed";
import { TokenBalanceBar } from "@/components/economy/TokenBalanceBar";
import { AlchemicalConstitutionPanel } from "@/components/profile/AlchemicalConstitutionPanel";
import { ElementalWheel } from "@/components/profile/ElementalWheel";
import { ProfileHeroCard } from "@/components/profile/ProfileHeroCard";
import { ProfileSettingsPanel } from "./ProfileSettingsPanel";
import type { DashboardProps } from "./types";

const UserDashboard = dynamic(() => import("@/components/dashboard").then((m) => m.UserDashboard));
const AgentsPane = dynamic(() => import("@/components/profile/AgentsPane").then((m) => m.AgentsPane));
const CosmicAlignmentCard = dynamic(() =>
  import("@/components/profile/CosmicAlignmentCard").then((m) => m.CosmicAlignmentCard),
);
const ProfileWeekCard = dynamic(
  () => import("@/components/menu-planner/redesign/ProfileWeekCard"),
);

const REGISTERED_NAV = [
  { id: "overview", label: "Alignment", icon: "⚗️" },
  { id: "cosmos", label: "Cosmos", icon: "🔮" },
  { id: "economy", label: "Token Vault", icon: "🝇" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "settings", label: "Settings", icon: "⚙️" },
] as const;

type RegisteredTab = (typeof REGISTERED_NAV)[number]["id"];

const RegisteredHeader: React.FC<{ userName: string; email: string }> = ({ userName, email }) => (
  <motion.header
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex items-center justify-between mb-10 pb-8 border-b border-white/5"
  >
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-px bg-purple-500/40" />
        <span className="text-[9px] font-black text-purple-400/70 uppercase tracking-[0.5em]">
          Alchm.kitchen // Practitioner Console
        </span>
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter alchm-gradient-text uppercase">
        {userName}
      </h1>
      <p className="text-white/30 text-xs mt-1 font-mono">
        {email ? `${email} · ` : ""}Registered Practitioner
      </p>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
        <span className="text-purple-400 text-xs">✦</span>
        <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.3em]">
          Registered
        </span>
      </div>
      <button
        onClick={(): void => { signOut({ callbackUrl: "/" }).catch(() => {}); }}
        className="p-2.5 rounded-full glass-base text-white/20 hover:text-white/60 border border-white/5 hover:border-white/10 transition-all"
        title="Sign out"
        aria-label="Sign out"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </motion.header>
);

const RegisteredQuickLinksGrid: React.FC = () => {
  const links = [
    { label: "Birth Chart", href: "/celestial-lab/standing-chart", icon: "🌌", desc: "Natal positions" },
    { label: "Current Chart", href: "/celestial-lab/current-chart", icon: "⚡", desc: "Live transits" },
    { label: "Grimoire", href: "/grimoire", icon: "📖", desc: "Practices & feats" },
    { label: "Token Vault", href: "/vault", icon: "⚗️", desc: "ESMS balance" },
    { label: "Menu Planner", href: "/menu-planner", icon: "🍽️", desc: "Cosmic meals" },
    { label: "Your Agents", href: "https://agents.alchm.kitchen/me", icon: "🤖", desc: "Planetary agents" },
    { label: "Identity & Wallet", href: "/account", icon: "🔗", desc: "Privy · Base wallet" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {links.map((item) => {
        const isExternal = item.href.startsWith("http");
        const className = "glass-card-premium rounded-2xl p-4 border-white/8 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all group";
        const content = (
          <>
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
              {item.label}
            </div>
            <div className="text-[9px] text-white/20 mt-0.5">{item.desc}</div>
          </>
        );
        return isExternal ? (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <Link key={item.label} href={item.href} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
};

const RegisteredOverviewTab: React.FC<DashboardProps & { userName: string; email: string; onOpenSettings: () => void }> = ({
  userName,
  email,
  natalChart,
  onEditBirthData,
  onOpenSettings,
}) => (
  <div className="space-y-8">
    <DailyAlignmentWidget />
    <ProfileHeroCard
      userName={userName}
      email={email}
      natalChart={natalChart}
      tier="holder"
      onEditProfile={onEditBirthData}
      onOpenSettings={onOpenSettings}
    />
    <ProfileWeekCard />
    <div className="grid md:grid-cols-2 gap-7">
      <AlchemicalConstitutionPanel natalChart={natalChart} />
      <ElementalWheel natalChart={natalChart} />
    </div>
    <LiveLedgerFeed />
    <RegisteredQuickLinksGrid />
  </div>
);

const RegisteredEconomyTab: React.FC = () => (
  <div className="space-y-7">
    <TokenBalanceBar />
    <LiveLedgerFeed limit={5} />
    <div className="rounded-3xl glass-card-premium p-6 border-white/8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
          ESMS Token Vault
        </h2>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-[0.3em] transition-colors">
            Visit Bazaar →
          </Link>
          <Link href="/account" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-[0.3em] transition-colors">
            Wallet Vault →
          </Link>
          <Link href="/celestial-lab/alchm" className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.3em] transition-colors">
            Open Ledger →
          </Link>
        </div>
      </div>
      <p className="text-white/30 text-xs mb-6">
        Your Spirit 🝇, Essence 🝑, Matter 🝙, and Substance 🝉 token balances.
        Claim your daily Cosmic Yield to regenerate balances based on celestial alignments.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { symbol: "🝇", label: "Spirit", color: "text-amber-400", border: "border-amber-500/25", bg: "bg-amber-500/8", desc: "Creative Force · Sun" },
          { symbol: "🝑", label: "Essence", color: "text-blue-400", border: "border-blue-500/25", bg: "bg-blue-500/8", desc: "Life Energy · Moon" },
          { symbol: "🝙", label: "Matter", color: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/8", desc: "Physical Form · Earth" },
          { symbol: "🝉", label: "Substance", color: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/8", desc: "Etheric Field · Mercury" },
        ].map((t) => (
          <div key={t.label} className={`rounded-2xl p-5 border ${t.border} ${t.bg} text-center`}>
            <div className={`text-3xl ${t.color} mb-2`}>{t.symbol}</div>
            <div className="text-[11px] font-black text-white/70 uppercase tracking-wider">{t.label}</div>
            <div className="text-[9px] text-white/20 mt-1">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RegisteredTabContent: React.FC<DashboardProps & {
  activeTab: RegisteredTab;
  userName: string;
  email: string;
  setActiveTab: (tab: RegisteredTab) => void;
}> = (props) => {
  const { activeTab, natalChart, preferences, onEditBirthData, onEditPreferences, userName, email, setActiveTab, session } = props;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {activeTab === "overview" && (
          <RegisteredOverviewTab
            {...props}
            userName={userName}
            email={email}
            onOpenSettings={(): void => { setActiveTab("settings"); }}
          />
        )}
        {activeTab === "cosmos" && (
          <div className="space-y-7">
            <CosmicAlignmentCard natalChart={natalChart} />
            <div className="glass-card-premium rounded-3xl p-1 border-white/8 overflow-hidden">
              <UserDashboard
                session={session}
                profileData={props.profileData}
                natalChart={natalChart}
                preferences={preferences}
                onEditBirthData={onEditBirthData}
                onEditPreferences={onEditPreferences}
              />
            </div>
          </div>
        )}
        {activeTab === "economy" && <RegisteredEconomyTab />}
        {activeTab === "agents" && <AgentsPane />}
        {activeTab === "settings" && (
          <ProfileSettingsPanel
            sessionUser={session?.user}
            natalChart={natalChart}
            preferences={preferences}
            onEditBirthData={onEditBirthData}
            onEditPreferences={onEditPreferences}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const RegisteredDashboard: React.FC<DashboardProps> = (props) => {
  const { session } = props;
  const [activeTab, setActiveTab] = useState<RegisteredTab>("overview");
  const userName = session?.user.name ?? "Practitioner";
  const email = session?.user.email ?? "";

  return (
    <div className="min-h-screen bg-[#08080e]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/25 via-[#08080e] to-indigo-950/15" />
        <div className="absolute top-0 left-1/3 w-[700px] h-[500px] bg-purple-600/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <RegisteredHeader userName={userName} email={email} />

        <div className="flex gap-1 p-1 bg-white/[0.025] rounded-2xl border border-white/5 mb-8 overflow-x-auto">
          {REGISTERED_NAV.map((tab) => (
            <button
              key={tab.id}
              onClick={(): void => { setActiveTab(tab.id); }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]
                transition-all duration-300 whitespace-nowrap flex-shrink-0
                ${activeTab === tab.id
                  ? "bg-white/10 text-white border border-white/12 shadow-inner"
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.03]"
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <RegisteredTabContent
          {...props}
          activeTab={activeTab}
          userName={userName}
          email={email}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};
