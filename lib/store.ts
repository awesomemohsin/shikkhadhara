import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
  tenantId: string;
  organizationId: string; // Alias
  profileImage?: string;
  phone?: string;
}

export interface Tenant {
  _id: string;
  name: string;
  subdomain: string;
  type: 'school' | 'madrasa' | 'college';
  logo?: string;
  settings: {
    theme?: string;
    primaryColor?: string;
    timezone: string;
    currency: string;
    language: string;
  };
  featureFlags?: {
    hifz?: boolean;
    finance?: boolean;
    attendance?: boolean;
    academics?: boolean;
    hrPayroll?: boolean;
  };
}

export type Organization = Tenant;

interface AuthStore {
  user: User | null;
  tenant: Tenant | null;
  organization: Tenant | null; // Alias
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  setOrganization: (org: Tenant | null) => void; // Alias
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools((set) => ({
    user: null,
    tenant: null,
    organization: null,
    token: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setTenant: (tenant) => set({ tenant, organization: tenant }),
    setOrganization: (organization) => set({ tenant: organization, organization }),
    setToken: (token) => set({ token }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null, tenant: null, organization: null, token: null }),
  }))
);

interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  devtools((set) => ({
    sidebarOpen: true,
    theme: 'light',
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setTheme: (theme) => set({ theme }),
  }))
);

interface NotificationState {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notifications: [],
    addNotification: (notification) =>
      set((state) => ({ notifications: [...state.notifications, { ...notification, id: Date.now() }] })),
    removeNotification: (id) =>
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
    clearNotifications: () => set({ notifications: [] }),
  }))
);
