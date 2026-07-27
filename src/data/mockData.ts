import { Tenant, Conversation, Integration, Ticket } from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Apex Health Clinic',
    industry: 'healthcare',
    logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&auto=format&fit=crop&q=80',
    tier: 'Enterprise',
    status: 'active',
    createdAt: '2025-11-12',
    stats: {
      conversationsCount: 1420,
      resolutionRate: 92.4,
      leadsGenerated: 340,
      appointmentsBooked: 285
    }
  },
  {
    id: 'tenant-2',
    name: 'Metro Realty Group',
    industry: 'real_estate',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&auto=format&fit=crop&q=80',
    tier: 'Professional',
    status: 'active',
    createdAt: '2026-01-15',
    stats: {
      conversationsCount: 980,
      resolutionRate: 88.1,
      leadsGenerated: 420,
      appointmentsBooked: 195
    }
  },
  {
    id: 'tenant-3',
    name: 'SwiftRetail Online',
    industry: 'retail',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120&auto=format&fit=crop&q=80',
    tier: 'Professional',
    status: 'active',
    createdAt: '2026-02-01',
    stats: {
      conversationsCount: 3120,
      resolutionRate: 94.8,
      leadsGenerated: 890,
      appointmentsBooked: 0
    }
  },
  {
    id: 'tenant-4',
    name: 'Gourmet Bistro & Grill',
    industry: 'restaurant',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=80',
    tier: 'Starter',
    status: 'active',
    createdAt: '2026-03-10',
    stats: {
      conversationsCount: 540,
      resolutionRate: 86.5,
      leadsGenerated: 180,
      appointmentsBooked: 210
    }
  },
  {
    id: 'tenant-5',
    name: 'Nova Manufacturing Corp',
    industry: 'manufacturing',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
    tier: 'Enterprise',
    status: 'active',
    createdAt: '2025-09-05',
    stats: {
      conversationsCount: 2200,
      resolutionRate: 91.0,
      leadsGenerated: 150,
      appointmentsBooked: 0
    }
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-101',
    tenantId: 'tenant-1',
    channel: 'website',
    customerName: 'Sarah Jenkins',
    customerContact: 's.jenkins@example.com',
    status: 'human_handling',
    sentiment: 'negative',
    assignedAgent: 'Agent John Doe',
    internalNotes: [
      'Patient requested urgent specialist referral, AI routed to human agent as sentiment dropped.',
      'Check BlueCross coverage verification.'
    ],
    contextData: {
      intent: 'Appointment modification & Urgent Specialist',
      orderId: 'REF-9923',
      appointmentDate: '2026-08-03 at 10:00 AM'
    },
    createdAt: '2026-07-27 09:15:00',
    updatedAt: '2026-07-27 09:22:00',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'I need to reschedule my doctor appointment from Monday to Friday.',
        timestamp: '09:15:02'
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'I can certainly help you reschedule your appointment at Apex Health Clinic! Looking at our calendar, Friday August 7th has openings at 9:30 AM and 2:15 PM. Which time works best for you?',
        timestamp: '09:15:04',
        citations: [
          { docTitle: 'Clinic Operating Hours & Directions.pdf', snippet: 'Operating Hours: Monday to Friday 8:00 AM - 6:00 PM...' }
        ]
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'I actually have severe joint pain and need a cardiologist referral right now, this is very frustrating!',
        timestamp: '09:17:10',
        sentiment: 'negative'
      },
      {
        id: 'm4',
        sender: 'ai',
        text: 'I hear your urgency regarding your joint pain and cardiologist referral. I am immediately transferring your chat to our Patient Care Agent, John Doe, who will take over right away.',
        timestamp: '09:17:12',
        workflowTriggered: {
          name: 'Human Agent Escalation & Care Ticket',
          status: 'completed',
          details: 'Created urgent ticket #T-8821 for Agent John Doe'
        }
      },
      {
        id: 'm5',
        sender: 'agent',
        text: 'Hello Sarah, this is Agent John Doe from Patient Care. I see your request and I am pulling up your referral options now.',
        timestamp: '09:20:00'
      }
    ]
  },
  {
    id: 'conv-102',
    tenantId: 'tenant-1',
    channel: 'whatsapp',
    customerName: 'Marcus Vance',
    customerContact: '+1 (555) 234-5678',
    status: 'resolved',
    sentiment: 'positive',
    internalNotes: ['Patient verified BlueCross insurance, booked 2:00 PM slot.'],
    contextData: {
      intent: 'Insurance Check & New Patient Intake',
      appointmentDate: '2026-08-05 at 02:00 PM'
    },
    createdAt: '2026-07-27 08:30:00',
    updatedAt: '2026-07-27 08:35:00',
    messages: [
      {
        id: 'm10',
        sender: 'user',
        text: 'Hi, do you accept BlueCross insurance for new patient intake?',
        timestamp: '08:30:12'
      },
      {
        id: 'm11',
        sender: 'ai',
        text: 'Yes! Apex Health Clinic accepts BlueCross, Aetna, Cigna, Medicare, and UnitedHealthcare. Please remember to bring a photo ID and your physical insurance card on your first visit.',
        timestamp: '08:30:15',
        citations: [
          { docTitle: 'Clinic Operating Hours & Directions.pdf', snippet: 'Accepted Insurance: BlueCross, Aetna, Cigna, Medicare...' }
        ]
      },
      {
        id: 'm12',
        sender: 'user',
        text: 'Awesome, please book me for Wednesday at 2:00 PM!',
        timestamp: '08:32:00'
      },
      {
        id: 'm13',
        sender: 'ai',
        text: 'Your appointment is confirmed for Wednesday, August 5th at 2:00 PM! An SMS reminder has been sent to your phone. Is there anything else I can help with?',
        timestamp: '08:32:04',
        workflowTriggered: {
          name: 'Appointment Booking & Modification',
          status: 'completed',
          details: 'Booked slot in Apex EMR & sent SMS confirmation'
        }
      }
    ]
  },
  {
    id: 'conv-103',
    tenantId: 'tenant-3',
    channel: 'website',
    customerName: 'David Miller',
    customerContact: 'david.m@example.com',
    status: 'ai_handling',
    sentiment: 'neutral',
    internalNotes: ['Return claim initiated.'],
    contextData: {
      intent: 'Damaged Product Refund Claim',
      orderId: 'SR-99234'
    },
    createdAt: '2026-07-27 10:05:00',
    updatedAt: '2026-07-27 10:06:00',
    messages: [
      {
        id: 'm20',
        sender: 'user',
        text: 'My product order #SR-99234 arrived damaged today. The box was crushed.',
        timestamp: '10:05:10'
      },
      {
        id: 'm21',
        sender: 'ai',
        text: 'I am so sorry to hear your package arrived damaged! I have logged ticket #T-9041 in our support system and automatically generated a prepaid return shipping label for order #SR-99234. A full replacement or refund will be processed as soon as it is scanned by carrier.',
        timestamp: '10:05:14',
        citations: [
          { docTitle: 'Return & Refund Policy 2026.pdf', snippet: 'For damaged or defective items, customers receive immediate prepaid return labels...' }
        ],
        workflowTriggered: {
          name: 'Damaged Item Claim & Ticket Creation',
          status: 'completed',
          details: 'Created Support Ticket #T-9041 and sent prepaid return label'
        }
      }
    ]
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-8821',
    tenantId: 'tenant-1',
    customerName: 'Sarah Jenkins',
    issue: 'Urgent Cardiologist Specialist Referral Request',
    status: 'in_progress',
    priority: 'urgent',
    createdAt: '2026-07-27 09:17:12',
    workflowId: 'wf-escalate'
  },
  {
    id: 'T-9041',
    tenantId: 'tenant-3',
    customerName: 'David Miller',
    issue: 'Damaged Package Claim - Order #SR-99234',
    status: 'open',
    priority: 'high',
    createdAt: '2026-07-27 10:05:14'
  },
  {
    id: 'T-8800',
    tenantId: 'tenant-5',
    customerName: 'Alex Rivera (Employee #402)',
    issue: 'PTO Vacation Approval Request - 5 Days',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-07-26 14:20:00'
  }
];

export const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int-1',
    tenantId: 'tenant-1',
    name: 'Salesforce CRM',
    provider: 'Salesforce',
    category: 'crm',
    connected: true,
    apiKey: 'sf_live_key_992183182',
    webhookUrl: 'https://api.salesforce.com/hooks/v1/chatbot',
    lastSync: '10 minutes ago'
  },
  {
    id: 'int-2',
    tenantId: 'tenant-1',
    name: 'HubSpot Marketing & CRM',
    provider: 'HubSpot',
    category: 'crm',
    connected: true,
    apiKey: 'pat-eu1-992a83-1123',
    webhookUrl: 'https://api.hubapi.com/webhooks/v1/app',
    lastSync: '25 minutes ago'
  },
  {
    id: 'int-3',
    tenantId: 'tenant-1',
    name: 'WhatsApp Business API',
    provider: 'WhatsApp',
    category: 'communication',
    connected: true,
    apiKey: 'wa_token_prod_77812',
    webhookUrl: 'https://graph.facebook.com/v18.0/whatsapp',
    lastSync: 'Live sync'
  },
  {
    id: 'int-4',
    tenantId: 'tenant-1',
    name: 'Twilio SMS Gateway',
    provider: 'SMS',
    category: 'communication',
    connected: true,
    apiKey: 'AC9918237192387192387',
    webhookUrl: 'https://sms.twilio.com/v1/webhook',
    lastSync: 'Live sync'
  },
  {
    id: 'int-5',
    tenantId: 'tenant-1',
    name: 'Zendesk Support Ticketing',
    provider: 'Zendesk',
    category: 'support',
    connected: true,
    apiKey: 'zd_token_882912',
    webhookUrl: 'https://apexhealth.zendesk.com/api/v2/tickets',
    lastSync: '1 hour ago'
  },
  {
    id: 'int-6',
    tenantId: 'tenant-1',
    name: 'Microsoft Teams Assistant',
    provider: 'Microsoft Teams',
    category: 'communication',
    connected: false,
    apiKey: '',
    webhookUrl: '',
    lastSync: 'Never'
  }
];
