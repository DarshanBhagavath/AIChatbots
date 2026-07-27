import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";
import { INDUSTRY_TEMPLATES } from "./src/data/templates.js";
import { INITIAL_TENANTS, INITIAL_CONVERSATIONS, INITIAL_TICKETS, INITIAL_INTEGRATIONS } from "./src/data/mockData.js";
import { Tenant, DocumentSource, Workflow, Conversation, ChatMessage, Ticket, Integration, ChatbotConfig } from "./src/types.js";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// Twilio Setup (Lazy Init)
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// In-Memory Data Stores
let tenants: Tenant[] = [...INITIAL_TENANTS];
let tenantConfigs: Record<string, ChatbotConfig> = {};
let tenantDocs: Record<string, DocumentSource[]> = {};
let tenantWorkflows: Record<string, Workflow[]> = {};
let conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
let tickets: Ticket[] = [...INITIAL_TICKETS];
let integrations: Integration[] = [...INITIAL_INTEGRATIONS];

// Initialize default tenant data from Industry Templates
INITIAL_TENANTS.forEach((t) => {
  const tmpl = INDUSTRY_TEMPLATES.find((it) => it.id === t.industry) || INDUSTRY_TEMPLATES[0];
  
  tenantConfigs[t.id] = {
    name: t.name + " AI Assistant",
    avatar: tmpl.defaultConfig.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    personality: tmpl.defaultConfig.personality || "Professional AI Business Assistant.",
    tone: tmpl.defaultConfig.tone || "professional",
    language: tmpl.defaultConfig.language || "English",
    companyPolicy: tmpl.defaultConfig.companyPolicy || "Provide accurate assistance based on company knowledge documents.",
    handoffThreshold: tmpl.defaultConfig.handoffThreshold || 4,
    welcomeMessage: tmpl.defaultConfig.welcomeMessage || `Welcome to ${t.name}! How can I help you today?`,
    fallbackMessage: tmpl.defaultConfig.fallbackMessage || "Let me transfer you to a human agent for further assistance."
  };

  tenantDocs[t.id] = tmpl.sampleDocs.map((sd, idx) => ({
    id: `doc-${t.id}-${idx + 1}`,
    tenantId: t.id,
    title: sd.title || `Document-${idx + 1}`,
    type: sd.type || 'pdf',
    category: sd.category || 'General',
    chunkCount: 8,
    size: sd.size || '1.0 MB',
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'indexed',
    content: sd.content || ''
  }));

  tenantWorkflows[t.id] = tmpl.workflows.map((wf, idx) => ({
    id: `wf-${t.id}-${idx + 1}`,
    tenantId: t.id,
    name: wf.name || `Workflow ${idx + 1}`,
    trigger: wf.trigger || '',
    category: wf.category || 'General',
    active: wf.active ?? true,
    actions: wf.actions || [],
    executionCount: wf.executionCount || 10
  }));
});

// Simple RAG Search Helper
function searchKnowledgeBase(tenantId: string, query: string): { docTitle: string; snippet: string }[] {
  const docs = tenantDocs[tenantId] || [];
  if (docs.length === 0) return [];

  const lowerQuery = query.toLowerCase();
  const queryTokens = lowerQuery.split(/\s+/).filter(t => t.length > 2);
  
  const matches: { docTitle: string; snippet: string; score: number }[] = [];

  docs.forEach(doc => {
    const lines = doc.content.split(/[.\n]+/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const lowerLine = trimmed.toLowerCase();
      
      let matchCount = 0;
      queryTokens.forEach(token => {
        if (lowerLine.includes(token)) matchCount++;
      });

      if (matchCount > 0) {
        matches.push({
          docTitle: doc.title,
          snippet: trimmed,
          score: matchCount
        });
      }
    });
  });

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3).map(m => ({ docTitle: m.docTitle, snippet: m.snippet }));
}

// Workflow Trigger Evaluation Engine
async function evaluateWorkflows(tenantId: string, userMessage: string): Promise<{ triggered: boolean; workflow?: Workflow; details?: string }> {
  const workflows = tenantWorkflows[tenantId] || [];
  const lowerMsg = userMessage.toLowerCase();

  for (const wf of workflows) {
    if (!wf.active) continue;
    const triggers = wf.trigger.split(',').map(t => t.trim().toLowerCase());
    
    const matched = triggers.some(trig => trig && lowerMsg.includes(trig));
    if (matched) {
      wf.executionCount += 1;

      // Simulate executing workflow actions
      let details = `Automated ${wf.name} initiated. `;
      for (const act of wf.actions) {
        if (act.type === 'create_ticket') {
          const newTicket: Ticket = {
            id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
            tenantId,
            customerName: 'Customer',
            issue: `Workflow trigger: ${wf.name} - "${userMessage.slice(0, 40)}..."`,
            status: 'open',
            priority: 'high',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            workflowId: wf.id
          };
          tickets.unshift(newTicket);
          details += `Created ticket ${newTicket.id}. `;
        } else if (act.type === 'send_sms') {
          if (twilioClient && process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_DESTINATION_PHONE) {
            try {
              const isWhatsApp = process.env.TWILIO_PHONE_NUMBER.startsWith('whatsapp:');
              await twilioClient.messages.create({
                body: `[${wf.name}] Alert: ${userMessage.slice(0, 100)}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.TWILIO_DESTINATION_PHONE
              });
              details += `Sent Twilio ${isWhatsApp ? 'WhatsApp' : 'SMS'} alert. `;
            } catch (err: any) {
              // console.warn("Twilio error:", err.message);
              // Fallback to a predefined sandbox template for trial accounts
              if (err.message && (err.message.includes('template') || err.message.includes('predefined'))) {
                try {
                  await twilioClient.messages.create({
                    body: 'Your appointment is coming up on July 21 at 3PM', // Standard Sandbox Template
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: process.env.TWILIO_DESTINATION_PHONE
                  });
                  details += `Sent Twilio Template (Fallback). `;
                } catch (fallbackErr) {
                  details += `Failed to send real SMS/WhatsApp. `;
                }
              } else {
                details += `Failed to send real SMS/WhatsApp. `;
              }
            }
          } else {
            details += `Sent SMS alert (Mocked). `;
          }
        } else if (act.type === 'sync_crm') {
          details += `Synced lead & event with ${act.target || 'CRM'}. `;
        } else if (act.type === 'hr_leave_request') {
          details += `Logged HR PTO leave request in portal. `;
        } else if (act.type === 'book_calendar') {
          details += `Reserved calendar slot in EMR/OpenTable. `;
        }
      }

      return { triggered: true, workflow: wf, details };
    }
  }

  return { triggered: false };
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  app.use(express.json({ limit: "10mb" }));

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "AI Business Assistant Platform" });
  });

  // Get Tenants & Templates
  app.get("/api/tenants", (_req, res) => {
    res.json(tenants);
  });

  app.post("/api/tenants", (req, res) => {
    const { name, industry, tier } = req.body;
    const tmpl = INDUSTRY_TEMPLATES.find(it => it.id === industry) || INDUSTRY_TEMPLATES[0];
    
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: name || 'New Enterprise',
      industry: industry || 'retail',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      tier: tier || 'Professional',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      stats: {
        conversationsCount: 0,
        resolutionRate: 100,
        leadsGenerated: 0,
        appointmentsBooked: 0
      }
    };

    tenants.push(newTenant);
    
    // Seed tenant config & templates
    tenantConfigs[newTenant.id] = {
      name: newTenant.name + " AI",
      avatar: tmpl.defaultConfig.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      personality: tmpl.defaultConfig.personality || "Helpful Assistant",
      tone: tmpl.defaultConfig.tone || "friendly",
      language: tmpl.defaultConfig.language || "English",
      companyPolicy: tmpl.defaultConfig.companyPolicy || "Assist customers.",
      handoffThreshold: tmpl.defaultConfig.handoffThreshold || 4,
      welcomeMessage: tmpl.defaultConfig.welcomeMessage || "Hello!",
      fallbackMessage: tmpl.defaultConfig.fallbackMessage || "Transferring to human."
    };

    tenantDocs[newTenant.id] = tmpl.sampleDocs.map((sd, idx) => ({
      id: `doc-${newTenant.id}-${idx + 1}`,
      tenantId: newTenant.id,
      title: sd.title || `Doc-${idx}`,
      type: sd.type || 'pdf',
      category: sd.category || 'General',
      chunkCount: 5,
      size: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'indexed',
      content: sd.content || ''
    }));

    tenantWorkflows[newTenant.id] = tmpl.workflows.map((wf, idx) => ({
      id: `wf-${newTenant.id}-${idx + 1}`,
      tenantId: newTenant.id,
      name: wf.name || `Workflow ${idx}`,
      trigger: wf.trigger || '',
      category: wf.category || 'General',
      active: true,
      actions: wf.actions || [],
      executionCount: 0
    }));

    res.json(newTenant);
  });

  app.get("/api/templates", (_req, res) => {
    res.json(INDUSTRY_TEMPLATES);
  });

  // Get/Set Config for Tenant
  app.get("/api/config/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const cfg = tenantConfigs[tenantId] || tenantConfigs['tenant-1'];
    res.json(cfg);
  });

  app.post("/api/config/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    tenantConfigs[tenantId] = { ...tenantConfigs[tenantId], ...req.body };
    res.json(tenantConfigs[tenantId]);
  });

  // Knowledge Base & RAG Upload
  app.get("/api/knowledge/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    res.json(tenantDocs[tenantId] || []);
  });

  app.post("/api/knowledge/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const { title, type, category, content } = req.body;
    
    const newDoc: DocumentSource = {
      id: `doc-${tenantId}-${Date.now()}`,
      tenantId,
      title: title || 'Uploaded Document.pdf',
      type: type || 'pdf',
      category: category || 'General Knowledge',
      chunkCount: Math.ceil((content || '').length / 200) || 4,
      size: `${((content || '').length / 1024 + 0.4).toFixed(1)} KB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'indexed',
      content: content || ''
    };

    if (!tenantDocs[tenantId]) tenantDocs[tenantId] = [];
    tenantDocs[tenantId].unshift(newDoc);
    res.json(newDoc);
  });

  app.delete("/api/knowledge/:tenantId/:docId", (req, res) => {
    const { tenantId, docId } = req.params;
    if (tenantDocs[tenantId]) {
      tenantDocs[tenantId] = tenantDocs[tenantId].filter(d => d.id !== docId);
    }
    res.json({ success: true });
  });

  // Workflows Endpoint
  app.get("/api/workflows/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    res.json(tenantWorkflows[tenantId] || []);
  });

  app.post("/api/workflows/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const { name, trigger, category, actions } = req.body;
    
    const newWf: Workflow = {
      id: `wf-${tenantId}-${Date.now()}`,
      tenantId,
      name: name || 'New Workflow',
      trigger: trigger || '',
      category: category || 'Custom',
      active: true,
      actions: actions || [{ type: 'create_ticket', target: 'Support Queue' }],
      executionCount: 0
    };

    if (!tenantWorkflows[tenantId]) tenantWorkflows[tenantId] = [];
    tenantWorkflows[tenantId].unshift(newWf);
    res.json(newWf);
  });

  app.post("/api/workflows/:tenantId/toggle/:workflowId", (req, res) => {
    const { tenantId, workflowId } = req.params;
    const wfs = tenantWorkflows[tenantId] || [];
    const wf = wfs.find(w => w.id === workflowId);
    if (wf) {
      wf.active = !wf.active;
    }
    res.json(wf || { success: false });
  });

  // Conversations & Human Agent Handoff
  app.get("/api/conversations/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const convs = conversations.filter(c => c.tenantId === tenantId);
    res.json(convs);
  });

  app.post("/api/conversations/:conversationId/handoff", (req, res) => {
    const { conversationId } = req.params;
    const { agentName } = req.body;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.status = 'human_handling';
      conv.assignedAgent = agentName || 'Agent Specialist';
      conv.messages.push({
        id: `m-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        sender: 'system',
        text: `Conversation assigned to ${conv.assignedAgent}. AI handoff active.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      io.emit('conversation_updated', conv);
    }
    res.json(conv);
  });

  app.post("/api/conversations/:conversationId/reply", (req, res) => {
    const { conversationId } = req.params;
    const { text, agentName } = req.body;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      const msg: ChatMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        sender: 'agent',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      conv.messages.push(msg);
      conv.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      io.emit('conversation_updated', conv);
    }
    res.json(conv);
  });

  app.post("/api/conversations/:conversationId/resolve", (req, res) => {
    const { conversationId } = req.params;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.status = 'resolved';
      conv.messages.push({
        id: `m-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        sender: 'system',
        text: 'Conversation marked as Resolved by Agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      io.emit('conversation_updated', conv);
    }
    res.json(conv);
  });

  app.post("/api/conversations/:conversationId/note", (req, res) => {
    const { conversationId } = req.params;
    const { note } = req.body;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && note) {
      if (!conv.internalNotes) conv.internalNotes = [];
      conv.internalNotes.push(note);
      io.emit('conversation_updated', conv);
    }
    res.json(conv);
  });

  // Integrations API
  app.get("/api/integrations/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const tenantInts = integrations.filter(i => i.tenantId === tenantId);
    if (tenantInts.length === 0) {
      // Return default template integrations
      const defaults: Integration[] = [
        { id: `int-1-${tenantId}`, tenantId, name: 'Salesforce CRM', provider: 'Salesforce', category: 'crm', connected: true, apiKey: 'sf_key_default', webhookUrl: 'https://api.salesforce.com/hooks', lastSync: '5m ago' },
        { id: `int-2-${tenantId}`, tenantId, name: 'HubSpot', provider: 'HubSpot', category: 'crm', connected: false },
        { id: `int-3-${tenantId}`, tenantId, name: 'WhatsApp Business', provider: 'WhatsApp', category: 'communication', connected: true, webhookUrl: 'https://graph.facebook.com/v18.0/whatsapp', lastSync: 'Live' },
        { id: `int-4-${tenantId}`, tenantId, name: 'Twilio SMS', provider: 'SMS', category: 'communication', connected: true, lastSync: 'Live' },
        { id: `int-5-${tenantId}`, tenantId, name: 'Zendesk Support', provider: 'Zendesk', category: 'support', connected: false }
      ];
      return res.json(defaults);
    }
    res.json(tenantInts);
  });

  app.post("/api/integrations/:integrationId/toggle", (req, res) => {
    const { integrationId } = req.params;
    const item = integrations.find(i => i.id === integrationId);
    if (item) {
      item.connected = !item.connected;
      item.lastSync = item.connected ? 'Just now' : 'Disconnected';
    }
    res.json(item || { success: true });
  });

  // Tickets API
  app.get("/api/tickets/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    res.json(tickets.filter(t => t.tenantId === tenantId));
  });

  // ==========================================
  // CORE AI CONVERSATION ENGINE (Gemini 3.6 Flash)
  // ==========================================
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { tenantId, conversationId, channel, userMessage, documentUpload } = req.body;

      if (!userMessage && !documentUpload) {
        return res.status(400).json({ error: "Message or document required." });
      }

      const activeTenant = tenants.find(t => t.id === tenantId) || tenants[0];
      const config = tenantConfigs[activeTenant.id] || tenantConfigs['tenant-1'];
      
      // Get or create conversation
      let conv = conversations.find(c => c.id === conversationId);
      if (!conv) {
        conv = {
          id: conversationId || `conv-${Date.now()}`,
          tenantId: activeTenant.id,
          channel: channel || 'website',
          customerName: 'Customer',
          customerContact: 'web-session-user',
          status: 'ai_handling',
          sentiment: 'neutral',
          messages: [],
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          internalNotes: [],
          contextData: {}
        };
        conversations.unshift(conv);
      }

      // Add user message to conversation
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const userMsgObj: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}-u`,
        sender: 'user',
        text: userMessage || (documentUpload ? `[Uploaded file: ${documentUpload.name}]` : ''),
        timestamp,
        documentUpload
      };
      conv.messages.push(userMsgObj);

      // Check if user is asking for human agent or angry
      const lowerInput = (userMessage || '').toLowerCase();
      const requestedHuman = lowerInput.includes("human") || lowerInput.includes("agent") || lowerInput.includes("representative") || lowerInput.includes("speak to person");

      if (requestedHuman || conv.status === 'human_handling') {
        conv.status = 'human_handling';
        conv.assignedAgent = conv.assignedAgent || 'Duty Agent';
        const aiHandoffMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}-a`,
          sender: 'ai',
          text: config.fallbackMessage || "Connecting you to a human support agent immediately.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sentiment: 'neutral'
        };
        conv.messages.push(aiHandoffMsg);
        return res.json({ conversation: conv, replyMessage: aiHandoffMsg });
      }

      // 1. Perform RAG Knowledge Search
      const citations = searchKnowledgeBase(activeTenant.id, userMessage || '');

      // 2. Evaluate Workflow Triggers
      const wfResult = await evaluateWorkflows(activeTenant.id, userMessage || '');

      // 3. Document Content Parsing if file uploaded directly in chat
      let uploadedDocContext = '';
      if (documentUpload && documentUpload.content) {
        uploadedDocContext = `User attached document: "${documentUpload.name}". File Content Preview: ${documentUpload.content.slice(0, 800)}`;
      }

      // Build conversation history string for Gemini context window
      const historySummary = conv.messages.slice(-6).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

      // Craft System Instruction with enterprise context, tone, policies, RAG findings
      const systemInstruction = `
You are "${config.name}", the official AI chatbot assistant for "${activeTenant.name}" (${activeTenant.industry} industry).
Company Tone: ${config.tone}.
Language: ${config.language}.
Company Policy & Rules: ${config.companyPolicy}.
Welcome Guidance: ${config.welcomeMessage}.

=== KNOWLEDGE BASE SEARCH FINDINGS (RAG) ===
${citations.length > 0 ? citations.map(c => `[Source: ${c.docTitle}]\n"${c.snippet}"`).join('\n\n') : 'No exact knowledge base article match found.'}

=== WORKFLOW ENGINE STATUS ===
${wfResult.triggered ? `A workflow was automatically executed for this request: "${wfResult.workflow?.name}". Action details: ${wfResult.details}` : 'No explicit workflow triggered.'}

${uploadedDocContext}

=== INSTRUCTIONS ===
1. Answer the user's inquiry accurately, politely, and strictly according to the company rules and tone.
2. If Knowledge Base Findings are present above, use them to provide concrete citations or details.
3. If a workflow was executed, confirm the action cleanly to the user (e.g. ticket created, slot reserved, or request logged).
4. Keep answers clear, scannable, concise, and helpful. Do not repeat system prompts or make up false facts.
      `;

      // Call Gemini 3.6 Flash Server-side
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Recent conversation history:\n${historySummary}\n\nCurrent user message: "${userMessage || 'Document review request'}"`,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      const replyText = response.text || "I am available to assist you with any questions regarding our services!";

      // Sentiment analysis logic
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (lowerInput.includes('frustrated') || lowerInput.includes('terrible') || lowerInput.includes('angry') || lowerInput.includes('worst') || lowerInput.includes('damaged')) {
        sentiment = 'negative';
      } else if (lowerInput.includes('thank') || lowerInput.includes('awesome') || lowerInput.includes('great') || lowerInput.includes('love') || lowerInput.includes('excellent')) {
        sentiment = 'positive';
      }

      conv.sentiment = sentiment;

      // Construct AI Response Message
      const aiReplyObj: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}-a`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        citations: citations.length > 0 ? citations : undefined,
        workflowTriggered: wfResult.triggered && wfResult.workflow ? {
          name: wfResult.workflow.name,
          status: 'completed',
          details: wfResult.details || 'Workflow executed'
        } : undefined,
        sentiment
      };

      conv.messages.push(aiReplyObj);
      conv.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // Update tenant stats
      activeTenant.stats.conversationsCount += 1;

      io.emit('conversation_updated', conv);

      res.json({
        conversation: conv,
        replyMessage: aiReplyObj
      });
    } catch (err: any) {
      console.error("Error in AI Chat endpoint:", err);
      res.status(500).json({ error: "Failed to generate AI response: " + (err.message || err) });
    }
  });

  // Analytics API
  app.get("/api/analytics/:tenantId", (req, res) => {
    const { tenantId } = req.params;
    const tenant = tenants.find(t => t.id === tenantId) || tenants[0];
    
    res.json({
      conversationsCount: tenant.stats.conversationsCount,
      resolutionRate: tenant.stats.resolutionRate,
      escalationRate: +(100 - tenant.stats.resolutionRate).toFixed(1),
      avgResponseTime: "1.4s",
      leadsGenerated: tenant.stats.leadsGenerated,
      appointmentsBooked: tenant.stats.appointmentsBooked,
      ROI: "$18,400 / mo",
      channelBreakdown: [
        { name: "Website Widget", value: 55 },
        { name: "WhatsApp", value: 25 },
        { name: "SMS Gateway", value: 12 },
        { name: "Mobile App", value: 8 }
      ],
      weeklyTrend: [
        { day: "Mon", conversations: 120, resolved: 112 },
        { day: "Tue", conversations: 185, resolved: 174 },
        { day: "Wed", conversations: 240, resolved: 228 },
        { day: "Thu", conversations: 190, resolved: 178 },
        { day: "Fri", conversations: 290, resolved: 275 },
        { day: "Sat", conversations: 150, resolved: 138 },
        { day: "Sun", conversations: 110, resolved: 102 }
      ],
      sentimentDistribution: [
        { name: "Positive", value: 68 },
        { name: "Neutral", value: 24 },
        { name: "Negative / Escalated", value: 8 }
      ]
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
