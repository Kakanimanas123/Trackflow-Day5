// Common types used throughout the application

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';

export type OrderStage = 'Order Received' | 'In Development' | 'Ready to Dispatch' | 'Dispatched';

export interface Lead {
  id: string;
  name: string;
  contact: string;
  company: string;
  productInterest: string;
  stage: LeadStage;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Order {
  id: string;
  leadId: string;
  leadName: string; // Denormalized for convenience
  stage: OrderStage;
  details?: string;
  courier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  entityType: 'lead' | 'order';
  entityId: string;
}

export interface DashboardSummary {
  totalLeads: number;
  openLeads: number;
  wonLeads: number;
  conversionRate: number;
  ordersReceived: number;
  ordersInDevelopment: number;
  ordersReadyToDispatch: number;
  ordersDispatched: number;
  upcomingFollowUps: Reminder[];
}