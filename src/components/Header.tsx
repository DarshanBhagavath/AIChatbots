import React from 'react';
import { Role, Tenant, TierType } from '../types';
import { Bot, User, Shield, Headset, Sparkles, Building2, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  tenants: Tenant[];
  activeTenant: Tenant;
  setActiveTenant: (tenant: Tenant) => void;
  onOpenTemplates: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  tenants,
  activeTenant,
  setActiveTenant,
  onOpenTemplates
}) => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = React.useState(false);

  const getTierBadgeColor = (tier: TierType) => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-tight">AI Business Assistant</h1>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                  Enterprise v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Configurable AI Chatbot & RAG Workflow Platform
              </p>
            </div>
          </div>

          {/* Tenant Selector & Industry Preset Trigger */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onOpenTemplates}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Industry Templates</span>
            </button>

            {/* Tenant Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-200 transition-colors"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white max-w-[140px] truncate">{activeTenant.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] border font-semibold ${getTierBadgeColor(activeTenant.tier)}`}>
                  {activeTenant.tier}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {tenantDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                    Select Active Tenant
                  </div>
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTenant(t);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-700/60 transition-colors ${
                        activeTenant.id === t.id ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <img src={t.logo} alt={t.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {activeTenant.id === t.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setRole('customer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                role === 'customer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Customer Live Chat & Widget Simulator"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Customer View</span>
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Business Admin Portal"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Admin Portal</span>
            </button>

            <button
              onClick={() => setRole('agent')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                role === 'agent'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Customer Service Agent Workspace"
            >
              <Headset className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Agent Desk</span>
            </button>

            <button
              onClick={() => setRole('platform_admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                role === 'platform_admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Platform Console"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Platform Admin</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
