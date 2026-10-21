import { apiClient } from '../../core/network/api-client';
import type {
  Organization,
  Member,
  AttendanceRecord,
  WageReportItem,
  AttendanceStatus,
} from './types';

export const hajriService = {
  // Organizations (Groups)
  async listOrganizations(): Promise<Organization[]> {
    const res = await apiClient.get<Organization[]>('/organizations');
    return Array.isArray(res.data) ? res.data : [];
  },

  async createOrganization(data: {
    name: string;
    type?: string;
    city?: string;
    description?: string;
  }): Promise<Organization> {
    const res = await apiClient.post<Organization>('/organizations', data);
    return res.data;
  },

  // Members (Workers in Group)
  async listMembers(orgId: number): Promise<Member[]> {
    const res = await apiClient.get<Member[]>(`/memberships/org/${orgId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async addWorker(data: {
    organizationId: number;
    name: string;
    phone?: string;
    dailyWage: string;
    role?: string;
    age?: number;
  }): Promise<Member> {
    const res = await apiClient.post<Member>('/memberships', {
      organizationId: data.organizationId,
      name: data.name,
      phone: data.phone || undefined,
      dailyWage: Number(data.dailyWage).toFixed(2),
      role: data.role || 'employee',
      age: data.age,
    });
    return res.data;
  },

  async updateWorkerWage(memberId: number, dailyWage: string): Promise<Member> {
    const res = await apiClient.patch<Member>(`/memberships/${memberId}`, {
      dailyWage: Number(dailyWage).toFixed(2),
    });
    return res.data;
  },

  async removeWorker(memberId: number): Promise<void> {
    await apiClient.delete(`/memberships/${memberId}`);
  },

  // Attendance
  async getAttendanceByDate(
    orgId: number,
    date: string
  ): Promise<AttendanceRecord[]> {
    const res = await apiClient.get<AttendanceRecord[]>(
      `/attendance/org/${orgId}?date=${date}`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  async saveBulkAttendance(data: {
    organizationId: number;
    date: string;
    entries: {
      userId: number;
      status: AttendanceStatus;
      notes?: string;
    }[];
  }): Promise<AttendanceRecord[]> {
    const res = await apiClient.post<AttendanceRecord[]>(
      '/attendance/bulk',
      data
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  // Monthly Wage Report
  async getWageReport(
    orgId: number,
    month: number,
    year: number
  ): Promise<WageReportItem[]> {
    const res = await apiClient.get<WageReportItem[]>(
      `/memberships/org/${orgId}/wage-report?month=${month}&year=${year}`
    );
    return Array.isArray(res.data) ? res.data : [];
  },
};
