import { create } from "zustand";

export type AppView =
  | "landing"
  | "login"
  | "register"
  | "onboarding"
  | "dashboard"
  | "task"
  | "certificate"
  | "verify"
  | "admin"
  | "company"
  | "mentor"
  | "college"
  | "company-register"
  | "mentor-register"
  | "college-register"
  | "portfolio"
  | "forgot-password"
  | "reset-password"
  | "security"
  | "hall-of-fame";

interface AppState {
  currentView: AppView;
  previousView: AppView | null;
  navigate: (view: AppView) => void;
  goBack: () => void;

  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTokenExpiry: (expiry: number | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;

  selectedTaskId: string | null;
  selectedCertificateId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedCertificateId: (id: string | null) => void;

  dashboardTab: string;
  setDashboardTab: (tab: string) => void;

  adminTab: string;
  setAdminTab: (tab: string) => void;

  companyTab: string;
  setCompanyTab: (tab: string) => void;

  mentorTab: string;
  setMentorTab: (tab: string) => void;

  collegeTab: string;
  setCollegeTab: (tab: string) => void;

  oauthUser: OAuthUserData | null;
  setOauthUser: (user: OAuthUserData | null) => void;
  oauthOnboarding: boolean;
  setOauthOnboarding: (value: boolean) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
}

export interface OAuthUserData {
  provider: 'google' | 'github' | 'linkedin';
  providerId: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  college?: string;
  city?: string;
  state?: string;
  degree?: string;
  branch?: string;
  year?: string;
  profilePhoto?: string;
  bio?: string;
  isVerified: boolean;
  streakDays: number;
  points: number;
  level: string;
  referralCode?: string;
  portfolioSlug?: string;
  skills?: string;
  socialLinks?: string;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: string;
  campusCredUsername?: string;
  campusCredScore?: number;
  googleId?: string;
  githubId?: string;
  linkedinId?: string;
  oauthAvatar?: string;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: "landing",
  previousView: null,
  navigate: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
    })),
  goBack: () =>
    set((state) => ({
      currentView: state.previousView || "landing",
      previousView: null,
    })),

  user: null,
  token: null,
  tokenExpiry: null,
  refreshToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    let tokenExpiry: number | null = null;
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded.exp) {
          tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
        }
      } catch {
        // Invalid token format, leave expiry as null
      }
    }
    set({ token, tokenExpiry });
  },
  setTokenExpiry: (tokenExpiry) => set({ tokenExpiry }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  logout: () => {
    // Call logout API to invalidate refresh token
    const { refreshToken } = get();
    if (refreshToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    set({
      user: null,
      token: null,
      tokenExpiry: null,
      refreshToken: null,
      isAuthenticated: false,
      currentView: "landing",
      previousView: null,
      selectedTaskId: null,
      selectedCertificateId: null,
      oauthUser: null,
      oauthOnboarding: false,
    });
    // Navigate to landing page via Next.js router
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  selectedTaskId: null,
  selectedCertificateId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSelectedCertificateId: (id) => set({ selectedCertificateId: id }),

  dashboardTab: "tasks",
  setDashboardTab: (tab) => set({ dashboardTab: tab }),

  adminTab: "overview",
  setAdminTab: (tab) => set({ adminTab: tab }),

  companyTab: "overview",
  setCompanyTab: (tab) => set({ companyTab: tab }),

  mentorTab: "overview",
  setMentorTab: (tab) => set({ mentorTab: tab }),

  collegeTab: "overview",
  setCollegeTab: (tab) => set({ collegeTab: tab }),

  oauthUser: null,
  setOauthUser: (user) => set({ oauthUser: user }),
  oauthOnboarding: false,
  setOauthOnboarding: (value) => set({ oauthOnboarding: value }),

  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newMode);
        localStorage.setItem("campuscred-dark-mode", newMode ? "true" : "false");
      }
      return { isDarkMode: newMode };
    }),

  language: "en",
  setLanguage: (lang) => set({ language: lang }),
}));

// Initialize dark mode from localStorage on first load
if (typeof window !== "undefined") {
  const savedMode = localStorage.getItem("campuscred-dark-mode");
  if (savedMode === "true") {
    document.documentElement.classList.add("dark");
    useAppStore.setState({ isDarkMode: true });
  }
}
