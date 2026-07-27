import React, { useState, useRef, useEffect } from 'react';
import { Tenant, ChatbotConfig, ChatMessage, Conversation } from '../types';
import { INDUSTRY_TEMPLATES } from '../data/templates';
import { Send, Paperclip, Bot, User, Sparkles, FileText, CheckCircle2, AlertCircle, Headset, MessageSquare, PhoneCall, Smartphone, Globe, ArrowRight, RotateCcw } from 'lucide-react';

interface CustomerViewProps {
  tenant: Tenant;
  config: ChatbotConfig;
}

type Channel = 'website' | 'whatsapp' | 'sms' | 'mobile';

export const CustomerView: React.FC<CustomerViewProps> = ({ tenant, config }) => {
  const [activeChannel, setActiveChannel] = useState<Channel>('website');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(`conv-user-${Date.now()}`);
  const [handingOff, setHandingOff] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Industry Template Suggested Questions
  const tmpl = INDUSTRY_TEMPLATES.find(t => t.id === tenant.industry) || INDUSTRY_TEMPLATES[0];
  const suggestions = tmpl.suggestedQuestions;

  // Initialize Welcome Message
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      sender: 'ai',
      text: config.welcomeMessage || `Welcome to ${tenant.name}! How may I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
    setConversationId(`conv-${tenant.id}-${Date.now()}`);
    setHandingOff(false);
  }, [tenant.id, config.welcomeMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle File Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || "Sample uploaded document content for RAG processing.";
        setAttachedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          content: textContent.slice(0, 1000)
        });
      };
      reader.readAsText(file);
    }
  };

  // Send Message to Server Endpoint (`/api/chat/message`)
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !attachedFile) return;

    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    // Add User Message Optimistically
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      documentUpload: currentFile ? { name: currentFile.name, size: currentFile.size } : undefined
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          conversationId,
          channel: activeChannel,
          userMessage: textToSend,
          documentUpload: currentFile
        })
      });

      const data = await res.json();

      if (data.replyMessage) {
        setMessages(prev => [...prev, data.replyMessage]);
        if (data.conversation?.status === 'human_handling') {
          setHandingOff(true);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I am having trouble connecting to our server right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHandoff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName: 'Senior Care Representative' })
      });
      const data = await res.json();
      setHandingOff(true);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: config.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
    setConversationId(`conv-${tenant.id}-${Date.now()}`);
    setHandingOff(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Channel Simulator Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={config.avatar || tenant.logo}
            alt={config.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-inner"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">{config.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Active & RAG Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Personality: <strong className="text-indigo-300">{config.personality}</strong> • Tone: <span className="capitalize text-slate-200">{config.tone}</span>
            </p>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-xl border border-slate-700/80 text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveChannel('website')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeChannel === 'website' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website Widget</span>
          </button>

          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeChannel === 'whatsapp' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveChannel('sms')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeChannel === 'sms' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>SMS Gateway</span>
          </button>

          <button
            onClick={() => setActiveChannel('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeChannel === 'mobile' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[600px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={config.avatar || tenant.logo} alt="Bot" className="w-9 h-9 rounded-xl object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  {config.name}
                  {handingOff && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Human Agent Mode Active
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Channel: <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{activeChannel}</span> • Session ID: {conversationId.slice(0, 14)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetChat}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Restart Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRequestHandoff}
                disabled={handingOff}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-all ${
                  handingOff
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                <Headset className="w-3.5 h-3.5" />
                <span>{handingOff ? 'Agent Connected' : 'Request Human Agent'}</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === 'agent' ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {msg.sender === 'agent' ? <Headset className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : msg.sender === 'agent'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 rounded-bl-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {/* Document Upload Badge */}
                    {msg.documentUpload && (
                      <div className="mb-2 p-2 bg-indigo-700/40 rounded-lg flex items-center space-x-2 text-xs text-indigo-100 border border-indigo-500/30">
                        <FileText className="w-4 h-4 text-indigo-200" />
                        <span className="font-semibold truncate">{msg.documentUpload.name}</span>
                        <span className="text-[10px] text-indigo-300">({msg.documentUpload.size})</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Workflow Trigger Badge */}
                    {msg.workflowTriggered && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-start space-x-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold">Workflow Executed:</strong> {msg.workflowTriggered.name}
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{msg.workflowTriggered.details}</p>
                        </div>
                      </div>
                    )}

                    {/* RAG Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Knowledge Base RAG Citations ({msg.citations.length}):</span>
                        </p>
                        <div className="space-y-1">
                          {msg.citations.map((cit, idx) => (
                            <div key={idx} className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{cit.docTitle}:</span> "{cit.snippet}"
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center text-[10px] text-slate-400 space-x-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <span className="text-slate-400 dark:text-slate-500">• Gemini 3.6 Flash</span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-semibold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-300"></span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">Searching knowledge base & generating response...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input & File Attachment */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            
            {/* Attached File Preview */}
            {attachedFile && (
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-indigo-400">({attachedFile.size})</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                title="Attach Document for RAG Understanding"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={handingOff ? "Type a message for the human agent..." : "Ask a question, request a service, or book..."}
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={loading || (!input.trim() && !attachedFile)}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Capabilities & Suggested Prompts (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Prompts Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Suggested Industry Queries</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test multi-turn context, RAG document search, and automated workflows:
            </p>
            <div className="space-y-2">
              {suggestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all group flex items-center justify-between"
                >
                  <span className="line-clamp-2">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Active Knowledge Sources Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-indigo-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Active RAG Knowledge Base</span>
            </h4>
            <p className="text-xs text-slate-300">
              Documents currently indexed and referenced by the Gemini 3.6 Flash engine for <strong className="text-white">{tenant.name}</strong>:
            </p>
            <div className="space-y-2">
              {tmpl.sampleDocs.map((doc, idx) => (
                <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-xs flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-200 truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-400">{doc.category} • Indexed</p>
                  </div>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-mono shrink-0">
                    Vectorized
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
