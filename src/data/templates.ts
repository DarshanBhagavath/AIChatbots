import { IndustryTemplate } from '../types';

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Clinic Assistant',
    description: 'Patient appointment scheduling, insurance verification, intake forms, clinic directions, and FAQs. HIPAA / PHIPA compliant controls.',
    iconName: 'Stethoscope',
    defaultConfig: {
      name: 'MediCare AI Assistant',
      avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
      personality: 'Compassionate, clear, and professional healthcare guide.',
      tone: 'empathetic',
      language: 'English',
      companyPolicy: 'Provide clear guidance for non-emergency medical scheduling and intake. Remind patients that for emergencies they should dial 911 immediately.',
      handoffThreshold: 4,
      welcomeMessage: 'Hello! Welcome to Apex Health Clinic. How can I help you book an appointment or answer clinic questions today?',
      fallbackMessage: 'I want to ensure you receive accurate health assistance. Let me connect you with a patient care representative right away.'
    },
    sampleDocs: [
      {
        title: 'Clinic Operating Hours & Directions.pdf',
        type: 'pdf',
        category: 'General Info',
        size: '1.2 MB',
        content: `Apex Health Clinic Operating Hours: Monday to Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM. Sunday Closed. Location: 742 Evergreen Terrace, Suite 300, Springfield. Parking is free in the underground parking lot B. Accepted Insurance: BlueCross, Aetna, Cigna, Medicare, UnitedHealthcare. For prescription refills, please provide your Rx number and preferred pharmacy.`
      },
      {
        title: 'Patient Intake & Insurance FAQ.docx',
        type: 'docx',
        category: 'Insurance & Intake',
        size: '850 KB',
        content: `New Patient Policy: Arrive 15 minutes prior to appointment with a photo ID and physical insurance card. Cancellation Policy: Cancel at least 24 hours prior to avoid a $50 late fee. Telehealth Visits: Available for general consultations, follow-ups, and lab result reviews. In-person visit required for annual physicals and urgent procedures.`
      }
    ],
    workflows: [
      {
        name: 'Appointment Booking & Modification',
        trigger: 'book appointment, reschedule, cancel appointment',
        category: 'Scheduling',
        active: true,
        actions: [
          { type: 'book_calendar', target: 'Apex EMR Calendar' },
          { type: 'send_sms', target: 'Patient Phone', payloadTemplate: 'Your appointment at Apex Health is confirmed for {{date}} at {{time}}.' }
        ],
        executionCount: 142
      },
      {
        name: 'Insurance Verification Check',
        trigger: 'insurance check, verify coverage, accepted insurance',
        category: 'Billing',
        active: true,
        actions: [
          { type: 'sync_crm', target: 'Billing Portal' }
        ],
        executionCount: 89
      }
    ],
    suggestedQuestions: [
      'How do I reschedule my appointment for next week?',
      'What insurance plans do you accept at Apex Health?',
      'What should I bring for my first patient intake visit?',
      'Can I request a prescription refill through telehealth?'
    ]
  },
  {
    id: 'real_estate',
    name: 'Real Estate & Property Lead Engine',
    description: 'Property search, automated lead qualification, scheduling property viewings, mortgage calculator guidance, and agent assignment.',
    iconName: 'Building',
    defaultConfig: {
      name: 'Metro Realty AI',
      avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150&auto=format&fit=crop&q=80',
      personality: 'Enthusiastic, informative real estate advisor focused on finding ideal homes.',
      tone: 'professional',
      language: 'English',
      companyPolicy: 'Help clients find properties matching their budget, location, and bedroom preferences. Qualify leads before assigning top agents.',
      handoffThreshold: 5,
      welcomeMessage: 'Welcome to Metro Realty! Looking to buy, rent, or schedule a private viewing today?',
      fallbackMessage: 'Let me instantly connect you with one of our senior property specialists to guide you further.'
    },
    sampleDocs: [
      {
        title: 'Featured Property Listings 2026.xlsx',
        type: 'xlsx',
        category: 'Listings',
        size: '2.4 MB',
        content: `Property 101: Sunset Heights Luxury Condo, 2 Bed / 2 Bath, 1,250 sqft, Price: $650,000, Location: Downtown, HOA $450/mo.
Property 102: Oakwood Suburban Family Estate, 4 Bed / 3.5 Bath, 3,200 sqft, Price: $1,150,000, Location: North Suburbs, Pool, 3-car garage.
Property 103: Skyline Loft Studio, 1 Bed / 1 Bath, 750 sqft, Price: $380,000, Location: Arts District. Private balcony.`
      },
      {
        title: 'Buyer Guide & Mortgage FAQ.pdf',
        type: 'pdf',
        category: 'Buying Guide',
        size: '1.8 MB',
        content: `Down Payment Requirements: Standard conventional loans require 5-20% down payment. FHA loans start at 3.5%. Pre-approval process requires 2 years of tax returns, recent pay stubs, and credit check. Private viewings are conducted 7 days a week between 9:00 AM and 7:00 PM.`
      }
    ],
    workflows: [
      {
        name: 'Schedule Private Viewing & Lead Qualification',
        trigger: 'schedule viewing, tour property, book walkthrough, view house',
        category: 'Sales Lead',
        active: true,
        actions: [
          { type: 'sync_crm', target: 'Salesforce RealEstate CRM' },
          { type: 'notify_manager', target: 'Lead Distribution Team' }
        ],
        executionCount: 215
      },
      {
        name: 'Mortgage Pre-Approval Guidance',
        trigger: 'mortgage, loan rates, down payment calculation',
        category: 'Finance',
        active: true,
        actions: [
          { type: 'send_email', target: 'Client Email' }
        ],
        executionCount: 94
      }
    ],
    suggestedQuestions: [
      'Do you have any 3-bedroom houses in the North Suburbs under $1.2M?',
      'How do I schedule a private viewing for Property 101?',
      'What down payment is needed for an FHA mortgage loan?',
      'Can I get in touch with an agent specialized in downtown condos?'
    ]
  },
  {
    id: 'retail',
    name: 'Retail & E-Commerce Customer Support',
    description: 'Product catalog search, order tracking, damaged item claims, return process automation, and personalized promo codes.',
    iconName: 'ShoppingBag',
    defaultConfig: {
      name: 'SwiftRetail Bot',
      avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80',
      personality: 'Upbeat, efficient shopping assistant dedicated to frictionless order resolution.',
      tone: 'friendly',
      language: 'English',
      companyPolicy: 'Provide order status updates, assist with returns within 30 days of purchase, and process damage claims instantly.',
      handoffThreshold: 3,
      welcomeMessage: 'Hi there! Welcome to SwiftRetail. Need help tracking an order, returning an item, or discovering deals?',
      fallbackMessage: 'I want to make sure your order issue is resolved completely. Transferring you to a SwiftRetail representative now.'
    },
    sampleDocs: [
      {
        title: 'Return & Refund Policy 2026.pdf',
        type: 'pdf',
        category: 'Policies',
        size: '640 KB',
        content: `Returns are accepted within 30 days of delivery in original condition with tags attached. Store credit or original payment method refund available. For damaged or defective items, customers receive immediate prepaid return labels or full instant replacement. Standard shipping takes 3-5 business days; Express shipping takes 1-2 business days.`
      },
      {
        title: 'Product Catalog & FAQ.xlsx',
        type: 'xlsx',
        category: 'Products',
        size: '3.1 MB',
        content: `Item #881: Swift Runner Pro Sneakers, $129.99, Sizes 6-13, Ergonomic cushion, Water-resistant mesh.
Item #882: UltraComfort Fleece Hoodie, $69.99, Colors: Black, Heather Grey, Forest Green. 100% Organic Cotton.
Item #883: Noise-Canceling Wireless Headphones, $199.99, 40-hour battery life, Fast charging USB-C.`
      }
    ],
    workflows: [
      {
        name: 'Damaged Item Claim & Ticket Creation',
        trigger: 'damaged product, broken item, refund, return order',
        category: 'Customer Service',
        active: true,
        actions: [
          { type: 'create_ticket', target: 'Support Queue' },
          { type: 'send_email', target: 'Customer Email', payloadTemplate: 'Claim ticket #{{ticketId}} created. Return prepaid label generated.' }
        ],
        executionCount: 310
      },
      {
        name: 'Order Tracking & Carrier Sync',
        trigger: 'where is my order, track package, shipping status',
        category: 'Logistics',
        active: true,
        actions: [
          { type: 'sync_crm', target: 'Shopify Logistics API' }
        ],
        executionCount: 520
      }
    ],
    suggestedQuestions: [
      'My product arrived damaged in transit. How do I get a refund?',
      'Where is my order #SR-99234?',
      'What is your return policy for shoes purchased online?',
      'Do you have any active promotion codes for new customers?'
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Dining Assistant',
    description: 'Menu recommendations, dietary/allergen checks, table reservations, online pickup status, and customer feedback collection.',
    iconName: 'Utensils',
    defaultConfig: {
      name: 'Gourmet Bistro AI',
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      personality: 'Warm, culinary-oriented host ready to curate your dining experience.',
      tone: 'friendly',
      language: 'English',
      companyPolicy: 'Assist with dietary restrictions (gluten-free, vegan, nut allergies), table bookings, and party reservations.',
      handoffThreshold: 4,
      welcomeMessage: 'Bon Appétit! Welcome to Gourmet Bistro. Would you like to reserve a table or view tonight’s special menu?',
      fallbackMessage: 'Connecting you directly to our front house manager for special reservation requests.'
    },
    sampleDocs: [
      {
        title: 'Dinner Menu & Allergen Matrix.pdf',
        type: 'pdf',
        category: 'Menu',
        size: '1.1 MB',
        content: `Starters: Truffle Mushroom Arancini ($16 - Vegetarian), Pan-Seared Scallops ($22 - Gluten Free).
Mains: Prime Angus Ribeye 12oz ($48), Wild Salmon with Lemon Herb Butter ($36 - Gluten Free), Vegan Truffle Pasta ($28 - Vegan/Dairy Free).
Desserts: Vanilla Bean Crème Brûlée ($12), Molten Lava Cake ($14).
Reservations: Tables held for 15 minutes past reservation time. Large parties (8+) require a $10/person deposit.`
      }
    ],
    workflows: [
      {
        name: 'Table Reservation & OpenTable Sync',
        trigger: 'reserve table, book table, reservation, dinner booking',
        category: 'Hospitality',
        active: true,
        actions: [
          { type: 'book_calendar', target: 'OpenTable System' },
          { type: 'send_sms', target: 'Guest Phone' }
        ],
        executionCount: 180
      }
    ],
    suggestedQuestions: [
      'Can I reserve a table for 4 people next Friday at 7 PM?',
      'Which menu items are gluten-free or vegan?',
      'What is the policy for large group dining reservations?',
      'Where can I park when visiting Gourmet Bistro?'
    ]
  },
  {
    id: 'finance',
    name: 'Banking & Financial Services Assistant',
    description: 'Account FAQs, loan rate calculator info, credit application guidance, branch locator, and PCI compliance audit logs.',
    iconName: 'Landmark',
    defaultConfig: {
      name: 'Apex Finance AI',
      avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
      personality: 'Secure, precise, and highly compliant financial advisor assistant.',
      tone: 'authoritative',
      language: 'English',
      companyPolicy: 'Never disclose personal account balances without verified authentication. Provide general loan and account product information.',
      handoffThreshold: 5,
      welcomeMessage: 'Welcome to Apex Financial Services. How may I assist you with accounts, loans, or mortgage inquiries today?',
      fallbackMessage: 'For secure account verification and sensitive transactions, let me transfer you to a licensed financial officer.'
    },
    sampleDocs: [
      {
        title: 'Loan & Account Products Guide 2026.pdf',
        type: 'pdf',
        category: 'Products',
        size: '2.8 MB',
        content: `Personal Checking Account: $0 monthly fee with $500 direct deposit. High-Yield Savings: 4.25% APY with $1,000 minimum balance.
Auto Loans: Fixed rates starting at 4.99% APR up to 60 months.
Home Mortgage: 30-Year Fixed at 6.125% APR, 15-Year Fixed at 5.50% APR.
Credit Cards: Cash Back Platinum card offering 2% unlimited cashback on all purchases.`
      }
    ],
    workflows: [
      {
        name: 'Loan Application Guidance & Callback Request',
        trigger: 'apply loan, mortgage request, interest rates, financial advisor',
        category: 'Lead Capture',
        active: true,
        actions: [
          { type: 'sync_crm', target: 'HubSpot Financial CRM' },
          { type: 'notify_manager', target: 'Loan Officer Team' }
        ],
        executionCount: 290
      }
    ],
    suggestedQuestions: [
      'What are your current 30-year fixed mortgage interest rates?',
      'How can I qualify for the High-Yield Savings Account at 4.25% APY?',
      'What documents are needed to apply for a personal auto loan?',
      'Where is the nearest Apex Bank branch with drive-thru ATM?'
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial Knowledge Hub',
    description: 'Supplier inquiries, equipment maintenance specs, SDS safety data sheets, inventory parts search, and HR internal requests.',
    iconName: 'Factory',
    defaultConfig: {
      name: 'Nova Industrial Bot',
      avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
      personality: 'Technical, precise industrial engineer assistant for shop floor and supplier ops.',
      tone: 'concise',
      language: 'English',
      companyPolicy: 'Provide exact technical specifications, safety protocols, and internal HR leave request automation for plant staff.',
      handoffThreshold: 4,
      welcomeMessage: 'Nova Manufacturing Industrial Assistant initialized. Enter part numbers, safety query, or HR request.',
      fallbackMessage: 'Routing query to Plant Engineering Lead.'
    },
    sampleDocs: [
      {
        title: 'Equipment Maintenance Manual Model-X.pdf',
        type: 'pdf',
        category: 'Technical Specs',
        size: '5.4 MB',
        content: `Model-X Hydraulic Press Maintenance Protocol: Hydraulic oil ISO VG 46 replacement every 2,000 operational hours. Operating temperature limit: 65°C max. In case of pressure drop below 150 BAR, check main relief valve seal and suction filter. Emergency Shutdown: Red button located at Control Panel Box A-4.`
      },
      {
        title: 'Employee HR Policy & Vacation Request.docx',
        type: 'docx',
        category: 'Internal HR',
        size: '1.1 MB',
        content: `Paid Time Off (PTO): Employees accrue 1.25 PTO days per month. Vacation requests must be submitted at least 5 business days in advance. HR Approval Workflow: Request submitted via AI Bot -> Automated Leave Balance Check -> Manager Notification -> Payroll Sync.`
      }
    ],
    workflows: [
      {
        name: 'Employee HR Vacation Approval Process',
        trigger: 'vacation approval, leave request, pto balance, time off',
        category: 'Internal HR',
        active: true,
        actions: [
          { type: 'hr_leave_request', target: 'Workday HR Portal' },
          { type: 'notify_manager', target: 'Plant Operations Manager' }
        ],
        executionCount: 410
      }
    ],
    suggestedQuestions: [
      'I need vacation approval for next month. How do I submit my PTO?',
      'What is the oil change interval for the Model-X Hydraulic Press?',
      'Where is the emergency shutdown button on Line 3?',
      'How do I request replacement parts for suction filter #SF-90?'
    ]
  },
  {
    id: 'education',
    name: 'Education & Campus Student Assistant',
    description: 'Student admissions guide, course catalog search, assignment deadline info, tuition fees, and campus facilities directions.',
    iconName: 'GraduationCap',
    defaultConfig: {
      name: 'Horizon Campus AI',
      avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
      personality: 'Encouraging, knowledgeable academic mentor assisting students and applicants.',
      tone: 'friendly',
      language: 'English',
      companyPolicy: 'Help students navigate course selection, enrollment deadlines, and campus life resources.',
      handoffThreshold: 4,
      welcomeMessage: 'Hello Horizon student! How can I assist you with admissions, course registration, or campus services today?',
      fallbackMessage: 'Connecting you to the Academic Registrar Office for official record assistance.'
    },
    sampleDocs: [
      {
        title: 'Horizon University Course Catalog 2026.pdf',
        type: 'pdf',
        category: 'Academics',
        size: '4.2 MB',
        content: `CS-101 Introduction to Computer Science: Mon/Wed 10:00 AM, Prof. Alan Turing, Prerequisites: None.
BUS-201 Financial Accounting: Tue/Thu 2:00 PM, Prof. Warren B. Prerequisites: Math 101.
Fall 2026 Registration Deadline: August 15. Tuition Payment Due Date: September 1. Financial aid office open Mon-Fri 9 AM - 4 PM.`
      }
    ],
    workflows: [
      {
        name: 'Student Admission Inquiry & Advisor Request',
        trigger: 'apply admission, tuition fee, course registration, transcript',
        category: 'Admissions',
        active: true,
        actions: [
          { type: 'sync_crm', target: 'Campus SIS System' },
          { type: 'send_email', target: 'Student Applicant Email' }
        ],
        executionCount: 350
      }
    ],
    suggestedQuestions: [
      'When is the fall 2026 course registration deadline?',
      'What are the prerequisites for BUS-201 Financial Accounting?',
      'How do I apply for financial aid or tuition assistance?',
      'What hours is the Horizon Campus Library open?'
    ]
  }
];
