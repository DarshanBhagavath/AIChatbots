export type Role = 'customer' | 'admin' | 'agent' | 'platform_admin';

export type IndustryType = 
  | 'healthcare' 
  | 'real_estate' 
  | 'retail' 
  | 'restaurant' 
  | 'finance' 
  | 'manufacturing' 
  | 'education';

export type TierType = 'Starter' | 'Professional' | 'Enterprise';

export interface Tenant {
  id: string;
  name: string;
  industry: IndustryType;
  logo: string;
  tier: TierType;
  status: 'active' | 'suspended';
  createdAt: string;
  stats: {
    conversationsCount: number;
    resolutionRate: number;
    leadsGenerated: number;
    appointmentsBooked: number;
  };
}

export interface ChatbotConfig {
  name: string;
  avatar: string;
  personality: string;
  tone: 'professional' | 'friendly' | 'empathetic' | 'concise' | 'authoritative';
  language: string;
  companyPolicy: string;
  handoffThreshold: number; // 1-10 sentiment threshold or intent match
  fallbackMessage: string;
  welcomeMessage: string;
}

export interface DocumentSource {
  id: string;
  tenantId: string;
  title: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'web' | 'faq';
  category: string;
  chunkCount: number;
  size: string;
  uploadDate: string;
  status: 'indexed' | 'processing' | 'failed';
  content: string;
}

export interface RAGChunk {
  id: string;
  docId: string;
  docTitle: string;
  content: string;
  similarity?: number;
}

export interface WorkflowAction {
  type: 'create_ticket' | 'send_email' | 'send_sms' | 'sync_crm' | 'hr_leave_request' | 'book_calendar' | 'notify_manager';
  target?: string;
  payloadTemplate?: string;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  trigger: string; // e.g. "reschedule appointment", "damaged product", "vacation approval", "refund"
  category: string;
  active: boolean;
  actions: WorkflowAction[];
  executionCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent' | 'system';
  text: string;
  timestamp: string;
  citations?: { docTitle: string; snippet: string }[];
  workflowTriggered?: { name: string; status: 'completed' | 'pending_approval'; details: string };
  actionData?: Record<string, any>;
  sentiment?: 'positive' | 'neutral' | 'negative';
  documentUpload?: { name: string; size: string; previewUrl?: string };
}

export interface Conversation {
  id: string;
  tenantId: string;
  channel: 'website' | 'whatsapp' | 'sms' | 'mobile';
  customerName: string;
  customerContact: string;
  status: 'ai_handling' | 'human_handling' | 'resolved' | 'escalated';
  sentiment: 'positive' | 'neutral' | 'negative';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  internalNotes: string[];
  contextData: {
    intent?: string;
    accountNumber?: string;
    orderId?: string;
    appointmentDate?: string;
    customFields?: Record<string, any>;
  };
}

export interface Ticket {
  id: string;
  tenantId: string;
  customerName: string;
  issue: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  workflowId?: string;
}

export interface Integration {
  id: string;
  tenantId: string;
  name: string;
  provider: 'Salesforce' | 'HubSpot' | 'Zoho' | 'WhatsApp' | 'SMS' | 'Microsoft Teams' | 'Slack' | 'Zendesk' | 'ServiceNow' | 'Stripe' | 'EHR/EMR';
  category: 'crm' | 'communication' | 'business' | 'support';
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
}

export interface IndustryTemplate {
  id: IndustryType;
  name: string;
  description: string;
  iconName: string;
  defaultConfig: Partial<ChatbotConfig>;
  sampleDocs: Partial<DocumentSource>[];
  workflows: Partial<Workflow>[];
  suggestedQuestions: string[];
}
