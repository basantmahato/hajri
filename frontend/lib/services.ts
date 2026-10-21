import { api } from "./api";

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  type: string;
  city: string | null;
  description: string | null;
  ownerId: number;
  isActive: boolean;
  createdAt: string;
}

export interface Member {
  id: number;
  userId: number;
  organizationId: number;
  role: string;
  dailyWage: string | null;
  status: string;
  joinedAt: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  userAvatar: string | null;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  employeeId: number;
  organizationId: number;
  date: string;
  status: "present" | "half_day" | "absent" | "leave";
  notes: string | null;
  markedBy: number | null;
}

export interface WageReportItem {
  memberId: number;
  userId: number;
  userName: string;
  dailyWage: string | null;
  totalDaysPresent: number;
  totalHalfDays: number;
  totalAbsent: number;
  totalLeave: number;
  totalEarnings: string;
  month: number;
  year: number;
}

// User Profile & Auth
export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get("/api/v1/web/users/me");
    return res.data;
  },
  searchUsers: async (q: string): Promise<User[]> => {
    const res = await api.get(`/api/v1/web/users/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post("/api/v1/web/auth/login", { email, password });
    if (res.data?.token) {
      localStorage.setItem("hajri_token", res.data.token);
    }
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post("/api/v1/web/auth/register", { name, email, password });
    if (res.data?.token) {
      localStorage.setItem("hajri_token", res.data.token);
    }
    return res.data;
  },
};

// Organizations (Groups)
export const organizationService = {
  list: async (): Promise<Organization[]> => {
    const res = await api.get("/api/v1/web/organizations");
    return res.data;
  },
  create: async (data: { name: string; type?: string; city?: string; description?: string }): Promise<Organization> => {
    const res = await api.post("/api/v1/web/organizations", data);
    return res.data;
  },
  get: async (id: number): Promise<Organization> => {
    const res = await api.get(`/api/v1/web/organizations/${id}`);
    return res.data;
  },
};

// Memberships (Adding employees with Daily Wage)
export const membershipService = {
  list: async (orgId: number): Promise<Member[]> => {
    const res = await api.get(`/api/v1/web/memberships/org/${orgId}`);
    return res.data;
  },
  add: async (data: {
    organizationId: number;
    name?: string;
    phone?: string;
    email?: string;
    age?: number;
    userId?: number;
    dailyWage?: string;
    role?: string;
  }): Promise<Member> => {
    const res = await api.post("/api/v1/web/memberships", data);
    return res.data;
  },
  update: async (memberId: number, data: { dailyWage?: string; role?: string; status?: string }): Promise<Member> => {
    const res = await api.patch(`/api/v1/web/memberships/${memberId}`, data);
    return res.data;
  },
  remove: async (memberId: number): Promise<void> => {
    await api.delete(`/api/v1/web/memberships/${memberId}`);
  },
  getWageReport: async (orgId: number, month: number, year: number): Promise<WageReportItem[]> => {
    const res = await api.get(`/api/v1/web/memberships/org/${orgId}/wage-report?month=${month}&year=${year}`);
    return res.data;
  },
};

// Attendance
export const attendanceService = {
  getByDate: async (orgId: number, date: string): Promise<AttendanceRecord[]> => {
    const res = await api.get(`/api/v1/web/attendance/org/${orgId}?date=${date}`);
    return res.data;
  },
  bulkMark: async (data: {
    organizationId: number;
    date: string;
    entries: { userId: number; status: "present" | "half_day" | "absent" | "leave"; notes?: string }[];
  }): Promise<AttendanceRecord[]> => {
    const res = await api.post("/api/v1/web/attendance/bulk", data);
    return res.data;
  },
};
