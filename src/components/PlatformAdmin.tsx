import React, { useState } from 'react';
import { Tenant, TierType, IndustryType } from '../types';
import { Shield, Building2, Layers, CheckCircle2, DollarSign, Activity, Lock, Plus, Users, Cpu } from 'lucide-react';

interface PlatformAdminProps {
  tenants: Tenant[];
  onAddTenant: (name: string, industry: IndustryType, tier: TierType) => void;
}

export const PlatformAdmin: React.FC<PlatformAdminProps> = ({ tenants, onAddTenant }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantIndustry, setNewTenantIndustry] = useState<IndustryType>('retail');
  const [newTenantTier, setNewTenantTier] = useState<TierType>('Professional');

  const handleCreate = () => {
    if (!newTenantName.trim()) return;
    onAddTenant(newTenantName, newTenantIndustry, newTenantTier);
    setNewTenantName('');
    setShowAddModal(false);
  };

  const totalMonthlyARR = tenants.reduce((acc, t) => {
    if (t.tier === 'Enterprise') return acc + 5000;
    if (t.tier === 'Professional') return acc + 999;
    return acc + 299;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Platform Admin Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Platform SaaS Administrator Console</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage multi-tenant organizations, subscription pricing plans, enterprise compliance controls, and global system health.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      {/* Global SaaS Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Active Tenant Organizations</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{tenants.length}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">100% Isolated Data</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Monthly Subscription Revenue</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">${totalMonthlyARR.toLocaleString()} / mo</h3>
          <p className="text-[11px] text-slate-400 mt-1">Starter, Pro & Enterprise tiers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Global AI Conversations</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">
            {tenants.reduce((sum, t) => sum + t.stats.conversationsCount, 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-indigo-500 font-medium mt-1">Across all channels</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">System Uptime & Latency</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">99.98%</h3>
          <p className="text-[11px] text-purple-500 font-medium mt-1">Avg Gemini Latency: 1.2s</p>
        </div>
      </div>

      {/* Subscription Pricing Tiers Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">SaaS Subscription Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Starter Tier
            </span>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">$299 <span className="text-xs font-normal text-slate-500">/ month</span></h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Website Chatbot Widget</li>
              <li>1 RAG Knowledge Base</li>
              <li>1,000 AI Conversations / mo</li>
            </ul>
          </div>

          <div className="border-2 border-indigo-500 rounded-2xl p-5 bg-indigo-50/30 dark:bg-indigo-950/30 space-y-3 relative">
            <span className="text-xs bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Professional Tier
            </span>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">$999 <span className="text-xs font-normal text-slate-500">/ month</span></h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Multi-channel (Website, WhatsApp, SMS, Mobile)</li>
              <li>CRM & Ticketing Integrations</li>
              <li>Workflow Automation Engine</li>
              <li>Full Analytics Dashboard</li>
            </ul>
          </div>

          <div className="border border-purple-300 dark:border-purple-800 rounded-2xl p-5 bg-purple-50/40 dark:bg-purple-950/40 space-y-3">
            <span className="text-xs bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full">
              Enterprise Tier
            </span>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">$5,000+ <span className="text-xs font-normal text-slate-500">/ month</span></h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Custom AI Agents & Custom Models</li>
              <li>SSO & Entra ID Integration</li>
              <li>HIPAA, PHIPA, PIPEDA & PCI Compliance</li>
              <li>Dedicated Cloud Environment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">All Registered Tenant Organizations ({tenants.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-3 rounded-l-xl">Tenant Organization</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Subscription Tier</th>
                <th className="p-3">Conversations</th>
                <th className="p-3">Resolution Rate</th>
                <th className="p-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <img src={t.logo} alt={t.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{t.name}</span>
                  </td>
                  <td className="p-3 capitalize">{t.industry}</td>
                  <td className="p-3">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.tier}</span>
                  </td>
                  <td className="p-3 font-mono font-bold">{t.stats.conversationsCount}</td>
                  <td className="p-3 font-semibold text-emerald-600">{t.stats.resolutionRate}%</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Provision New Tenant Organization</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Horizon Academy"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Preset</label>
                <select
                  value={newTenantIndustry}
                  onChange={(e) => setNewTenantIndustry(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="healthcare">Healthcare & Clinics</option>
                  <option value="real_estate">Real Estate & Property</option>
                  <option value="retail">Retail & E-Commerce</option>
                  <option value="restaurant">Restaurant & Dining</option>
                  <option value="finance">Banking & Financial Services</option>
                  <option value="manufacturing">Manufacturing & Supply Chain</option>
                  <option value="education">Education & Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subscription Tier</label>
                <select
                  value={newTenantTier}
                  onChange={(e) => setNewTenantTier(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="Starter">Starter ($299/mo)</option>
                  <option value="Professional">Professional ($999/mo)</option>
                  <option value="Enterprise">Enterprise ($5,000/mo)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTenantName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
              >
                Provision Tenant
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
