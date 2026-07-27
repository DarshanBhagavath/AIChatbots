import React, { useState, useEffect } from 'react';
import { Tenant, Conversation, ChatMessage } from '../types';
import { Headset, MessageSquare, Send, CheckCircle2, User, Clock, AlertTriangle, Shield, FileText, Search, Plus, Filter } from 'lucide-react';

interface AgentWorkspaceProps {
  tenant: Tenant;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ tenant }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'human_handling' | 'ai_handling' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [agentName] = useState('Agent John Doe');

  useEffect(() => {
    fetchConversations();
  }, [tenant.id]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations/${tenant.id}`);
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeConv = conversations.find(c => c.id === selectedConvId);

  const filteredConvs = conversations.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleTakeOver = async () => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName })
      });
      const updated = await res.json();
      setConversations(prev => prev.map(c => c.id === selectedConvId ? updated : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async () => {
    if (!selectedConvId || !replyText.trim()) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, agentName })
      });
      const updated = await res.json();
      setConversations(prev => prev.map(c => c.id === selectedConvId ? updated : c));
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const updated = await res.json();
      setConversations(prev => prev.map(c => c.id === selectedConvId ? updated : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async () => {
    if (!selectedConvId || !noteText.trim()) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
      const updated = await res.json();
      setConversations(prev => prev.map(c => c.id === selectedConvId ? updated : c));
      setNoteText('');
    } catch (e) {
      console.error(e);
    }
  };

  const getSentimentBadge = (sentiment: Conversation['sentiment']) => {
    switch (sentiment) {
      case 'negative':
        return <span className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Negative / Frustrated</span>;
      case 'positive':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Positive</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-medium">Neutral</span>;
    }
  };

  const getStatusBadge = (status: Conversation['status']) => {
    switch (status) {
      case 'human_handling':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">Human Agent Active</span>;
      case 'resolved':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">Resolved</span>;
      default:
        return <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">AI Handling</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Agent Desk Header */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20">
            <Headset className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">Customer Service Agent Desk</h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Active Agent: {agentName}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Monitor incoming chat queues, view complete AI conversation logs, take over active chats, and add team notes for <strong className="text-white">{tenant.name}</strong>.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All Queue ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('human_handling')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'human_handling' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Waiting / Agent Active ({conversations.filter(c => c.status === 'human_handling').length})
          </button>
          <button
            onClick={() => setFilter('ai_handling')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === 'ai_handling' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Handled ({conversations.filter(c => c.status === 'ai_handling').length})
          </button>
        </div>
      </div>

      {/* Main Agent Desk Grid (1/3 list, 2/3 thread & notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        
        {/* Conversation List Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
            Live Chat Queue ({filteredConvs.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                  selectedConvId === conv.id
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{conv.customerName}</span>
                  {getStatusBadge(conv.status)}
                </div>

                <p className="text-slate-600 dark:text-slate-300 line-clamp-1 mb-2 font-medium">
                  {conv.messages[conv.messages.length - 1]?.text || 'New conversation'}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="capitalize">{conv.channel}</span>
                  {getSentimentBadge(conv.sentiment)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Conversation Detail & Reply Panel */}
        {activeConv ? (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden">
            
            {/* Chat History & Agent Reply Field (2 cols) */}
            <div className="md:col-span-2 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 pr-4">
              
              {/* Thread Top Bar */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeConv.customerName}</h3>
                  <p className="text-[11px] text-slate-500">Contact: {activeConv.customerContact} • Channel: {activeConv.channel}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {activeConv.status !== 'human_handling' ? (
                    <button
                      onClick={handleTakeOver}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Headset className="w-3.5 h-3.5" />
                      <span>Take Over Chat</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResolve}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      m.sender === 'user'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium'
                        : m.sender === 'agent'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-medium'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{m.sender}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Manual Agent Reply Box */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={activeConv.status === 'human_handling' ? "Type manual agent response..." : "Click 'Take Over Chat' first to respond manually"}
                    disabled={activeConv.status !== 'human_handling'}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-amber-500 outline-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={activeConv.status !== 'human_handling' || !replyText.trim()}
                    className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Context & Internal Notes Sidebar (1 col) */}
            <div className="space-y-4 text-xs overflow-y-auto">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Customer Metadata</h4>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p><strong className="text-slate-600 dark:text-slate-300">Intent:</strong> {activeConv.contextData.intent || 'General Inquiry'}</p>
                  <p><strong className="text-slate-600 dark:text-slate-300">Appointment / Ref:</strong> {activeConv.contextData.appointmentDate || activeConv.contextData.orderId || 'N/A'}</p>
                  <p><strong className="text-slate-600 dark:text-slate-300">Sentiment:</strong> {getSentimentBadge(activeConv.sentiment)}</p>
                  <p><strong className="text-slate-600 dark:text-slate-300">Assigned Agent:</strong> {activeConv.assignedAgent || 'None'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Internal Team Notes</h4>
                <div className="space-y-2 mb-3">
                  {(activeConv.internalNotes || []).map((n, i) => (
                    <div key={i} className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 rounded-xl text-amber-900 dark:text-amber-200">
                      "{n}"
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Add private note for team..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="w-full bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold py-1.5 rounded-xl border border-slate-700"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            Select a conversation from the left queue to view history and take over.
          </div>
        )}

      </div>

    </div>
  );
};
