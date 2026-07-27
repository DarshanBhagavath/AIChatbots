import React, { useState, useEffect } from 'react';
import { Role, Tenant, ChatbotConfig, IndustryTemplate, TierType, IndustryType } from './types';
import { INITIAL_TENANTS } from './data/mockData';
import { Header } from './components/Header';
import { CustomerView } from './components/CustomerView';
import { AdminPortal } from './components/AdminPortal';
import { AgentWorkspace } from './components/AgentWorkspace';
import { PlatformAdmin } from './components/PlatformAdmin';
import { IndustryTemplateModal } from './components/IndustryTemplateModal';

export default function App() {
  const [role, setRole] = useState<Role>('customer');
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [config, setConfig] = useState<ChatbotConfig>({
    name: 'Apex Health AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    personality: 'Compassionate, clear, and professional healthcare guide.',
    tone: 'empathetic',
    language: 'English',
    companyPolicy: 'Provide clear guidance for non-emergency medical scheduling and intake. Remind patients to dial 911 in emergencies.',
    handoffThreshold: 4,
    welcomeMessage: 'Hello! Welcome to Apex Health Clinic. How can I help you book an appointment or answer clinic questions today?',
    fallbackMessage: 'I want to ensure you receive accurate health assistance. Let me connect you with a patient care representative right away.'
  });

  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Fetch Tenant Config when Active Tenant Changes
  useEffect(() => {
    fetchTenantConfig(activeTenant.id);
  }, [activeTenant.id]);

  const fetchTenantConfig = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/config/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add New Tenant
  const handleAddTenant = async (name: string, industry: IndustryType, tier: TierType) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, tier })
      });
      const newTenant = await res.json();
      setTenants(prev => [...prev, newTenant]);
      setActiveTenant(newTenant);
    } catch (e) {
      console.error(e);
    }
  };

  // Apply Industry Template
  const handleApplyTemplate = async (tmpl: IndustryTemplate) => {
    try {
      // Update local tenant industry
      const updatedTenant = { ...activeTenant, industry: tmpl.id };
      setActiveTenant(updatedTenant);
      setTenants(prev => prev.map(t => t.id === activeTenant.id ? updatedTenant : t));

      // Update config
      if (tmpl.defaultConfig) {
        const newCfg: ChatbotConfig = {
          name: tmpl.defaultConfig.name || `${activeTenant.name} AI`,
          avatar: tmpl.defaultConfig.avatar || activeTenant.logo,
          personality: tmpl.defaultConfig.personality || 'Helpful Assistant',
          tone: tmpl.defaultConfig.tone || 'friendly',
          language: tmpl.defaultConfig.language || 'English',
          companyPolicy: tmpl.defaultConfig.companyPolicy || 'Assist customers accurately.',
          handoffThreshold: tmpl.defaultConfig.handoffThreshold || 4,
          welcomeMessage: tmpl.defaultConfig.welcomeMessage || 'Welcome! How can I help you today?',
          fallbackMessage: tmpl.defaultConfig.fallbackMessage || 'Transferring to human support.'
        };
        setConfig(newCfg);

        await fetch(`/api/config/${activeTenant.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCfg)
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Top Header with Role & Tenant Selector */}
      <Header
        role={role}
        setRole={setRole}
        tenants={tenants}
        activeTenant={activeTenant}
        setActiveTenant={setActiveTenant}
        onOpenTemplates={() => setTemplateModalOpen(true)}
      />

      {/* Main Content Area Based on Active Role */}
      <main className="pb-12">
        {role === 'customer' && (
          <CustomerView
            tenant={activeTenant}
            config={config}
          />
        )}

        {role === 'admin' && (
          <AdminPortal
            tenant={activeTenant}
            config={config}
            onUpdateConfig={setConfig}
          />
        )}

        {role === 'agent' && (
          <AgentWorkspace
            tenant={activeTenant}
          />
        )}

        {role === 'platform_admin' && (
          <PlatformAdmin
            tenants={tenants}
            onAddTenant={handleAddTenant}
          />
        )}
      </main>

      {/* Industry Templates Preset Modal */}
      <IndustryTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        activeTenant={activeTenant}
        onApplyTemplate={handleApplyTemplate}
      />

    </div>
  );
}
