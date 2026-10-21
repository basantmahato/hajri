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
  type: string; // construction, factory, retail, restaurant, office, other
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

export type AttendanceStatus = 'present' | 'half_day' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: number;
  userId: number;
  employeeId?: number;
  organizationId: number;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  markedBy?: number | null;
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
