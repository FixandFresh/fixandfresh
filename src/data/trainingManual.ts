export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  sections: TrainingSection[];
  quiz?: Quiz;
}

export interface TrainingSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'checklist' | 'procedure';
  keyPoints?: string[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const trainingModules: TrainingModule[] = [
  {
    id: 'service-standards',
    title: 'Fix & Fresh Service Standards',
    description: 'Core service delivery standards and customer experience protocols',
    duration: '45 minutes',
    sections: [
      {
        id: 'arrival-protocol',
        title: 'Arrival & First Impressions',
        type: 'procedure',
        content: 'Professional arrival sets the tone for exceptional service delivery. Research shows that first impressions are formed within 7 seconds and significantly impact customer satisfaction ratings.',
        keyPoints: [
          'Arrive within 15-minute window of scheduled time (industry best practice)',
          'Call client 15 minutes before arrival to confirm and prepare',
          'Wear clean Fix & Fresh uniform with visible ID badge',
          'Bring protective shoe covers and equipment covers',
          'Greet client with professional introduction and service overview',
          'Conduct brief walkthrough to confirm service scope'
        ]
      },
      {
        id: 'workspace-setup',
        title: 'Workspace Preparation & Protection',
        type: 'checklist',
        content: 'Proper workspace setup protects client property and demonstrates professionalism. Studies indicate that 89% of customers judge service quality based on care taken with their property.',
        keyPoints: [
          'Lay protective coverings on high-traffic floors and furniture',
          'Set up equipment in designated staging area away from living spaces',
          'Identify and mark fragile items within 3-foot radius',
          'Ensure adequate lighting for work area (minimum 500 lux)',
          'Test all equipment before starting work',
          'Document pre-service conditions with photos'
        ]
      },
      {
        id: 'communication-standards',
        title: 'Client Communication Excellence',
        type: 'procedure',
        content: 'Effective communication builds trust and ensures customer satisfaction. Research indicates clear communication increases customer retention by 47%.',
        keyPoints: [
          'Explain each step of the service process clearly',
          'Provide realistic time estimates and updates every 30 minutes',
          'Ask permission before moving client belongings',
          'Address concerns immediately and professionally',
          'Use positive language and avoid technical jargon',
          'Confirm client satisfaction before concluding service'
        ]
      }
    ]
  },
  {
    id: 'quality-assurance',
    title: 'Quality Assurance & Inspection Protocols',
    description: 'Comprehensive quality control procedures and inspection standards',
    duration: '35 minutes',
    sections: [
      {
        id: 'pre-service-inspection',
        title: 'Pre-Service Assessment & Documentation',
        type: 'procedure',
        content: 'Thorough pre-service assessment prevents disputes and ensures proper service delivery. Industry data shows proper documentation reduces complaints by 73%.',
        keyPoints: [
          'Document existing conditions with timestamped photos',
          'Identify areas requiring special attention or techniques',
          'Note any client-specific preferences or requirements',
          'Assess equipment and supply needs for optimal results',
          'Confirm service scope and any additions with client',
          'Record environmental factors (humidity, temperature, lighting)'
        ]
      },
      {
        id: 'quality-checkpoints',
        title: 'During-Service Quality Monitoring',
        type: 'checklist',
        content: 'Continuous quality monitoring ensures consistent results and early issue detection. Quality checkpoints reduce rework by 68% according to service industry studies.',
        keyPoints: [
          'Perform quality checks every 15-20 minutes during service',
          'Maintain clean and organized workspace throughout',
          'Monitor progress against time estimates',
          'Address any quality issues immediately',
          'Keep client informed of progress and any discoveries',
          'Document any deviations from standard procedures'
        ]
      },
      {
        id: 'final-inspection',
        title: 'Final Quality Inspection & Client Walkthrough',
        type: 'procedure',
        content: 'Final inspection ensures service meets Fix & Fresh standards and client expectations. Proper final inspection increases customer satisfaction scores by 34%.',
        keyPoints: [
          'Conduct thorough final inspection using quality checklist',
          'Invite client for walkthrough and feedback',
          'Address any concerns immediately',
          'Provide maintenance tips and care instructions',
          'Clean up workspace and remove all equipment',
          'Obtain client signature confirming satisfaction'
        ]
      }
    ]
  },
  {
    id: 'advanced-techniques',
    title: 'Advanced Service Techniques & Innovation',
    description: 'Cutting-edge techniques and modern approaches for superior results',
    duration: '50 minutes',
    sections: [
      {
        id: 'eco-friendly-methods',
        title: 'Sustainable & Eco-Friendly Practices',
        type: 'procedure',
        content: 'Modern consumers increasingly value environmental responsibility. 78% of customers prefer service providers who use eco-friendly methods.',
        keyPoints: [
          'Use EPA-approved, biodegradable cleaning products',
          'Implement water conservation techniques',
          'Minimize waste through efficient product usage',
          'Educate clients on sustainable maintenance practices',
          'Use microfiber technology for superior cleaning',
          'Implement green certification standards'
        ]
      },
      {
        id: 'technology-integration',
        title: 'Technology-Enhanced Service Delivery',
        type: 'text',
        content: 'Leveraging technology improves efficiency and service quality. Service providers using digital tools report 43% higher customer satisfaction.',
        keyPoints: [
          'Use digital checklists and quality tracking apps',
          'Implement before/after photo documentation',
          'Utilize moisture meters and air quality monitors',
          'Provide real-time service updates via app',
          'Use scheduling optimization software',
          'Implement contactless payment and feedback systems'
        ]
      },
      {
        id: 'specialized-surfaces',
        title: 'Specialized Surface Treatment',
        type: 'procedure',
        content: 'Different surfaces require specific techniques for optimal results. Proper surface-specific treatment extends material life by 40%.',
        keyPoints: [
          'Identify surface materials and appropriate treatments',
          'Use pH-balanced products for natural stone',
          'Apply protective coatings where appropriate',
          'Understand fabric care codes and requirements',
          'Implement spot treatment techniques',
          'Provide surface-specific maintenance guidance'
        ]
      }
    ]
  },
  {
    id: 'customer-experience',
    title: 'Exceptional Customer Experience',
    description: 'Creating memorable experiences that drive loyalty and referrals',
    duration: '40 minutes',
    sections: [
      {
        id: 'service-personalization',
        title: 'Personalized Service Approach',
        type: 'procedure',
        content: 'Personalized service creates emotional connections with clients. Personalization increases customer loyalty by 56% and referral rates by 41%.',
        keyPoints: [
          'Remember client preferences from previous visits',
          'Adapt communication style to client personality',
          'Offer customized maintenance schedules',
          'Provide personalized care recommendations',
          'Follow up with personalized thank-you messages',
          'Create client profiles for future reference'
        ]
      },
      {
        id: 'problem-resolution',
        title: 'Proactive Problem Resolution',
        type: 'procedure',
        content: 'Effective problem resolution turns challenges into opportunities. Quick resolution increases customer retention by 67%.',
        keyPoints: [
          'Identify potential issues before they become problems',
          'Communicate solutions clearly and promptly',
          'Offer multiple resolution options when possible',
          'Follow up to ensure satisfaction with resolution',
          'Document issues and solutions for future reference',
          'Use problems as opportunities to exceed expectations'
        ]
      },
      {
        id: 'value-added-services',
        title: 'Value-Added Service Opportunities',
        type: 'text',
        content: 'Identifying and offering additional value creates revenue opportunities and enhances customer satisfaction. Value-added services increase average job value by 32%.',
        keyPoints: [
          'Identify maintenance needs during service',
          'Offer protective treatments and upgrades',
          'Suggest seasonal service packages',
          'Provide educational content and tips',
          'Recommend complementary services',
          'Create maintenance reminder systems'
        ]
      }
    ]
  }
];

export const serviceStandards = {
  responseTime: '24 hours maximum',
  arrivalWindow: '15 minutes',
  qualityScore: '4.5+ stars',
  completionRate: '98%+',
  customerSatisfaction: '95%+',
  followUpTime: '24 hours post-service',
  equipmentStandards: 'Professional-grade only',
  uniformRequirement: 'Clean Fix & Fresh branded attire'
};