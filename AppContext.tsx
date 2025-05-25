import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lead, LeadStage, Order, OrderStage, Reminder, DashboardSummary } from '../types';
import { generateId } from '../utils/helpers';

interface AppContextType {
  leads: Lead[];
  orders: Order[];
  reminders: Reminder[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, leadUpdate: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, orderUpdate: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminderUpdate: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  getDashboardSummary: () => DashboardSummary;
  updateLeadStage: (leadId: string, newStage: LeadStage) => void;
  updateOrderStage: (orderId: string, newStage: OrderStage) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('trackflow_leads');
    return savedLeads ? JSON.parse(savedLeads) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('trackflow_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const savedReminders = localStorage.getItem('trackflow_reminders');
    return savedReminders ? JSON.parse(savedReminders) : [];
  });

  useEffect(() => {
    localStorage.setItem('trackflow_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('trackflow_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('trackflow_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setLeads((prev) => [...prev, newLead]);
  };

  const updateLead = (id: string, leadUpdate: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...leadUpdate, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    // Also delete any orders associated with this lead
    setOrders((prev) => prev.filter((order) => order.leadId !== id));
    // Also delete any reminders associated with this lead
    setReminders((prev) => 
      prev.filter((reminder) => !(reminder.entityType === 'lead' && reminder.entityId === id))
    );
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrder = (id: string, orderUpdate: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, ...orderUpdate, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    // Also delete any reminders associated with this order
    setReminders((prev) => 
      prev.filter((reminder) => !(reminder.entityType === 'order' && reminder.entityId === id))
    );
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const updateReminder = (id: string, reminderUpdate: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, ...reminderUpdate }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const updateLeadStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, stage: newStage, updatedAt: new Date().toISOString() }
          : lead
      )
    );

    // If lead is marked as Won, automatically create an Order
    if (newStage === 'Won') {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && !orders.some((o) => o.leadId === leadId)) {
        const now = new Date().toISOString();
        const newOrder: Order = {
          id: generateId(),
          leadId: leadId,
          leadName: lead.name,
          stage: 'Order Received',
          createdAt: now,
          updatedAt: now,
        };
        setOrders((prev) => [...prev, newOrder]);
      }
    }
  };

  const updateOrderStage = (orderId: string, newStage: OrderStage) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, stage: newStage, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  const getDashboardSummary = (): DashboardSummary => {
    const totalLeads = leads.length;
    const openLeads = leads.filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost').length;
    const wonLeads = leads.filter((lead) => lead.stage === 'Won').length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    const ordersReceived = orders.filter((order) => order.stage === 'Order Received').length;
    const ordersInDevelopment = orders.filter((order) => order.stage === 'In Development').length;
    const ordersReadyToDispatch = orders.filter((order) => order.stage === 'Ready to Dispatch').length;
    const ordersDispatched = orders.filter((order) => order.stage === 'Dispatched').length;

    // Get upcoming follow-ups for the next 7 days
    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    
    const upcomingFollowUps = reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.date);
      return !reminder.completed && reminderDate >= now && reminderDate <= oneWeekLater;
    });

    return {
      totalLeads,
      openLeads,
      wonLeads,
      conversionRate,
      ordersReceived,
      ordersInDevelopment,
      ordersReadyToDispatch,
      ordersDispatched,
      upcomingFollowUps,
    };
  };

  const value = {
    leads,
    orders,
    reminders,
    addLead,
    updateLead,
    deleteLead,
    addOrder,
    updateOrder,
    deleteOrder,
    addReminder,
    updateReminder,
    deleteReminder,
    getDashboardSummary,
    updateLeadStage,
    updateOrderStage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppProvider, useAppContext };