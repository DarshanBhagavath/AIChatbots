import React, { useState, useEffect } from 'react';
import { Tenant, ChatbotConfig, DocumentSource, Workflow, Integration } from '../types';
import { Bot, FileText, GitFork, BarChart3, Link2, Plus, Upload, Trash2, CheckCircle2, Play, Save, RefreshCw, Sparkles, Layers, ShieldCheck, Search, ArrowUpRight, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface AdminPortalProps {
  tenant: Tenant;
  config: ChatbotConfig;
  onUpdateConfig: (newConfig: ChatbotConfig) => void;
}

type AdminSubTab = 'config' | 'knowledge' | 'workflows' | 'analytics' | 'integrations';

export const AdminPortal: React.FC<AdminPortalProps> = ({ tenant, config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('config');
  
  // Config State
  const [formConfig, setFormConfig] = useState<ChatbotConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Knowledge State
  const [docs, setDocs] = useState<DocumentSource[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('General Policy');
  const [newDocContent, setNewDocContent] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [ragTestQuery, setRagTestQuery] = useState('');
  const [ragSearchResults, setRagSearchResults] = useState<{ docTitle: string; snippet: string }[]>([]);

  // Workflows State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [newWfName, setNewWfName] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState('');
  const [newWfAction, setNewWfAction] = useState<Workflow['actions'][0]['type']>('create_ticket');

  // Integrations State
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    setFormConfig(config);
    fetchKnowledge();
    fetchWorkflows();
    fetchIntegrations();
    fetchAnalytics();
  }, [tenant.id, config]);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch(`/api/knowledge/${tenant.id}`);
      const data = await res.json();
      setDocs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(`/api/workflows/${tenant.id}`);
      const data = await res.json();
      setWorkflows(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`/api/integrations/${tenant.id}`);
      const data = await res.json();
      setIntegrations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/${tenant.id}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Config Save
  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`/api/config/${tenant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfig)
      });
      const data = await res.json();
      onUpdateConfig(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Document Upload
  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    setUploadingDoc(true);
    try {
      const res = await fetch(`/api/knowledge/${tenant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle,
          type: 'pdf',
          category: newDocCategory,
          content: newDocContent
        })
      });
      const doc = await res.json();
      setDocs(prev => [doc, ...prev]);
      setNewDocTitle('');
      setNewDocContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/knowledge/${tenant.id}/${docId}`, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      console.error(e);
    }
  };

  // RAG Search Test
  const handleTestRag = () => {
    if (!ragTestQuery.trim()) return;
    const queryTokens = ragTestQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const results: { docTitle: string; snippet: string }[] = [];

    docs.forEach(d => {
      const lines = d.content.split(/[.\n]+/);
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        if (queryTokens.some(t => lower.includes(t))) {
          results.push({ docTitle: d.title, snippet: trimmed });
        }
      });
    });

    setRagSearchResults(results.slice(0, 3));
  };

  // Add Workflow
  const handleAddWorkflow = async () => {
    if (!newWfName.trim() || !newWfTrigger.trim()) return;
    try {
      const res = await fetch(`/api/workflows/${tenant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWfName,
          trigger: newWfTrigger,
          category: 'Custom Rule',
          actions: [{ type: newWfAction, target: 'Enterprise System' }]
        })
      });
      const wf = await res.json();
      setWorkflows(prev => [wf, ...prev]);
      setNewWfName('');
      setNewWfTrigger('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWorkflow = async (wfId: string) => {
    try {
      const res = await fetch(`/api/workflows/${tenant.id}/toggle/${wfId}`, { method: 'POST' });
      const updated = await res.json();
      setWorkflows(prev => prev.map(w => w.id === wfId ? { ...w, active: updated.active } : w));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleIntegration = async (intId: string) => {
    try {
      const res = await fetch(`/api/integrations/${intId}/toggle`, { method: 'POST' });
      const updated = await res.json();
      setIntegrations(prev => prev.map(i => i.id === intId ? { ...i, connected: updated.connected } : i));
    } catch (e) {
      console.error(e);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Admin Portal Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {tenant.name} Administration
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize">
              {tenant.industry} Industry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure chatbot persona, upload RAG documents, build workflow rules, monitor analytics, and link integrations.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'config' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chatbot Config</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'knowledge' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RAG Knowledge</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'workflows' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Workflows</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Integrations</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CHATBOT CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">AI Personality & Persona Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize how the Gemini 3.6 Flash engine communicates with your customers.
              </p>
            </div>
            <button
              onClick={handleSaveConfig}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Configuration saved successfully! AI assistant updated instantly.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chatbot Assistant Name
                </label>
                <input
                  type="text"
                  value={formConfig.name}
                  onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Communication Tone
                </label>
                <select
                  value={formConfig.tone}
                  onChange={(e) => setFormConfig({ ...formConfig, tone: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="professional">Professional & Direct</option>
                  <option value="friendly">Friendly & Warm</option>
                  <option value="empathetic">Empathetic & Caring</option>
                  <option value="concise">Concise & Technical</option>
                  <option value="authoritative">Authoritative & Formal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Language
                </label>
                <input
                  type="text"
                  value={formConfig.language}
                  onChange={(e) => setFormConfig({ ...formConfig, language: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personality Briefing
                </label>
                <textarea
                  rows={3}
                  value={formConfig.personality}
                  onChange={(e) => setFormConfig({ ...formConfig, personality: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Welcome Greeting Message
                </label>
                <textarea
                  rows={2}
                  value={formConfig.welcomeMessage}
                  onChange={(e) => setFormConfig({ ...formConfig, welcomeMessage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Human Agent Handoff Fallback Message
                </label>
                <textarea
                  rows={2}
                  value={formConfig.fallbackMessage}
                  onChange={(e) => setFormConfig({ ...formConfig, fallbackMessage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Policy & Guardrail Rules
                </label>
                <textarea
                  rows={3}
                  value={formConfig.companyPolicy}
                  onChange={(e) => setFormConfig({ ...formConfig, companyPolicy: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RAG KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Upload New Document Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <span>Index New RAG Knowledge Document</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Insurance Policy FAQ.pdf"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="General Policy">General Policy</option>
                  <option value="Pricing & Billing">Pricing & Billing</option>
                  <option value="Technical Specs">Technical Specs</option>
                  <option value="Customer FAQs">Customer FAQs</option>
                  <option value="Compliance & Legal">Compliance & Legal</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Full Text Content</label>
                <textarea
                  rows={3}
                  placeholder="Paste document text here. System will automatically chunk, vectorize, and create RAG index..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleAddDocument}
              disabled={uploadingDoc || !newDocTitle || !newDocContent}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploadingDoc ? 'Indexing Vector Chunks...' : 'Upload & Create Vector Embeddings'}</span>
            </button>
          </div>

          {/* RAG Search Tester */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-300">
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Test Vector RAG Retrieval Engine</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a query to search indexed document chunks..."
                value={ragTestQuery}
                onChange={(e) => setRagTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestRag()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleTestRag}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
              >
                Query RAG
              </button>
            </div>

            {ragSearchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400">Relevant Chunks Retrieved:</p>
                {ragSearchResults.map((res, i) => (
                  <div key={i} className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-xs">
                    <p className="font-bold text-indigo-300 mb-1">{res.docTitle}</p>
                    <p className="text-slate-300 italic">"{res.snippet}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indexed Documents Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Indexed Knowledge Documents ({docs.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Document Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">File Size</th>
                    <th className="p-3">Chunk Count</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {docs.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{d.title}</span>
                      </td>
                      <td className="p-3">{d.category}</td>
                      <td className="p-3">{d.size}</td>
                      <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{d.chunkCount} chunks</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Indexed
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteDocument(d.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WORKFLOW AUTOMATION */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* Create Workflow Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <span>Create New Automated Business Workflow</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Escalation & SMS Alert"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. emergency, pain, urgent, broken"
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Action Step</label>
                <select
                  value={newWfAction}
                  onChange={(e) => setNewWfAction(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="create_ticket">Create Support Ticket</option>
                  <option value="send_sms">Send Automated SMS</option>
                  <option value="sync_crm">Sync Lead to CRM</option>
                  <option value="hr_leave_request">Log HR Leave Approval</option>
                  <option value="book_calendar">Reserve Calendar Appointment</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddWorkflow}
              disabled={!newWfName || !newWfTrigger}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Workflow Trigger</span>
            </button>
          </div>

          {/* Active Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{wf.name}</h4>
                      <p className="text-[11px] text-slate-500">{wf.category} • Executed {wf.executionCount} times</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleWorkflow(wf.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      wf.active
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {wf.active ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                  <p><strong className="text-slate-700 dark:text-slate-300">Trigger Keywords:</strong> <span className="font-mono text-indigo-600 dark:text-indigo-400">{wf.trigger}</span></p>
                  <p><strong className="text-slate-700 dark:text-slate-300">Action:</strong> {wf.actions.map(a => a.type).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ANALYTICS & DASHBOARD */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Total Conversations</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{analytics.conversationsCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 18% vs last month</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold text-slate-500">AI Resolution Rate</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{analytics.resolutionRate}%</h3>
              <p className="text-[11px] text-slate-400 mt-1">Escalation Rate: {analytics.escalationRate}%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Leads / Appointments</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{analytics.leadsGenerated + analytics.appointmentsBooked}</h3>
              <p className="text-[11px] text-indigo-500 font-medium mt-1">Direct CRM conversions</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Estimated Monthly ROI</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{analytics.ROI}</h3>
              <p className="text-[11px] text-purple-500 font-medium mt-1">Support hours saved: 210 hrs</p>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Weekly Conversation & Resolution Volume</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weeklyTrend}>
                    <XAxis dataKey="day" stroke="#8884d8" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="conversations" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Conversations" />
                    <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved by AI" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Channel Distribution</h4>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.channelBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.channelBreakdown.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: INTEGRATIONS HUB */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Enterprise System Connectors</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Connect your AI chatbot with CRM, communication channels, and ticketing platforms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((item) => (
                <div key={item.id} className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.category}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        item.connected
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {item.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p>Status: <strong className="text-slate-700 dark:text-slate-200">{item.connected ? 'Live Sync Active' : 'Not Configured'}</strong></p>
                    {item.lastSync && <p className="text-[10px]">Last Sync: {item.lastSync}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
