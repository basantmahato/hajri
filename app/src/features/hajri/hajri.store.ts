import { create } from 'zustand';
import { hajriService } from './hajri.service';
import type {
  Organization,
  Member,
  AttendanceStatus,
  WageReportItem,
} from './types';

interface HajriState {
  // Organizations
  organizations: Organization[];
  activeOrg: Organization | null;
  isLoadingOrgs: boolean;

  // Members (Workers in Active Org)
  members: Member[];
  isLoadingMembers: boolean;

  // Daily Attendance
  date: string;
  attendanceMap: Record<number, { status: AttendanceStatus; notes: string }>;
  isLoadingAttendance: boolean;
  isSavingAttendance: boolean;
  lastSaveMessage: string | null;

  // Wage Report
  report: WageReportItem[];
  reportMonth: number;
  reportYear: number;
  isLoadingReport: boolean;

  // Actions
  initialize: () => Promise<void>;
  loadOrganizations: () => Promise<void>;
  setActiveOrg: (org: Organization) => void;
  createOrganization: (data: {
    name: string;
    type?: string;
    city?: string;
    description?: string;
  }) => Promise<Organization>;

  loadMembers: (orgId: number) => Promise<void>;
  addWorker: (data: {
    organizationId: number;
    name: string;
    phone?: string;
    dailyWage: string;
    role?: string;
    age?: number;
  }) => Promise<void>;
  updateWorkerWage: (memberId: number, dailyWage: string) => Promise<void>;
  removeWorker: (memberId: number) => Promise<void>;

  setDate: (date: string) => void;
  changeDateBy: (days: number) => void;
  loadAttendance: (orgId: number, date: string) => Promise<void>;
  setStatus: (userId: number, status: AttendanceStatus) => void;
  setNotes: (userId: number, notes: string) => void;
  markAll: (status: AttendanceStatus) => void;
  saveAttendance: () => Promise<boolean>;

  setReportPeriod: (month: number, year: number) => void;
  loadWageReport: () => Promise<void>;
}

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const useHajriStore = create<HajriState>((set, get) => ({
  organizations: [],
  activeOrg: null,
  isLoadingOrgs: false,

  members: [],
  isLoadingMembers: false,

  date: getTodayString(),
  attendanceMap: {},
  isLoadingAttendance: false,
  isSavingAttendance: false,
  lastSaveMessage: null,

  report: [],
  reportMonth: new Date().getMonth() + 1,
  reportYear: new Date().getFullYear(),
  isLoadingReport: false,

  initialize: async () => {
    await get().loadOrganizations();
  },

  loadOrganizations: async () => {
    set({ isLoadingOrgs: true });
    try {
      const orgs = await hajriService.listOrganizations();
      const currentActive = get().activeOrg;
      const nextActive = currentActive
        ? orgs.find((o) => o.id === currentActive.id) || orgs[0] || null
        : orgs[0] || null;

      set({
        organizations: orgs,
        activeOrg: nextActive,
        isLoadingOrgs: false,
      });

      if (nextActive) {
        await get().loadMembers(nextActive.id);
        await get().loadAttendance(nextActive.id, get().date);
      }
    } catch {
      set({ isLoadingOrgs: false });
    }
  },

  setActiveOrg: (org: Organization) => {
    set({ activeOrg: org });
    get().loadMembers(org.id);
    get().loadAttendance(org.id, get().date);
    get().loadWageReport();
  },

  createOrganization: async (data) => {
    set({ isLoadingOrgs: true });
    const newOrg = await hajriService.createOrganization(data);
    const orgs = [...get().organizations, newOrg];
    set({
      organizations: orgs,
      activeOrg: newOrg,
      isLoadingOrgs: false,
    });
    await get().loadMembers(newOrg.id);
    return newOrg;
  },

  loadMembers: async (orgId: number) => {
    set({ isLoadingMembers: true });
    try {
      const members = await hajriService.listMembers(orgId);
      set({ members, isLoadingMembers: false });

      // Build default attendance map if empty
      const currentMap = { ...get().attendanceMap };
      members.forEach((m) => {
        if (!currentMap[m.userId]) {
          currentMap[m.userId] = { status: 'present', notes: '' };
        }
      });
      set({ attendanceMap: currentMap });
    } catch {
      set({ isLoadingMembers: false });
    }
  },

  addWorker: async (data) => {
    const member = await hajriService.addWorker(data);
    const updated = [...get().members, member];
    const map = { ...get().attendanceMap };
    map[member.userId] = { status: 'present', notes: '' };
    set({ members: updated, attendanceMap: map });
  },

  updateWorkerWage: async (memberId: number, dailyWage: string) => {
    await hajriService.updateWorkerWage(memberId, dailyWage);
    if (get().activeOrg) {
      await get().loadMembers(get().activeOrg!.id);
      await get().loadWageReport();
    }
  },

  removeWorker: async (memberId: number) => {
    await hajriService.removeWorker(memberId);
    if (get().activeOrg) {
      await get().loadMembers(get().activeOrg!.id);
      await get().loadWageReport();
    }
  },

  setDate: (date: string) => {
    set({ date });
    if (get().activeOrg) {
      get().loadAttendance(get().activeOrg!.id, date);
    }
  },

  changeDateBy: (days: number) => {
    const current = new Date(get().date);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const nextDate = `${yyyy}-${mm}-${dd}`;
    get().setDate(nextDate);
  },

  loadAttendance: async (orgId: number, date: string) => {
    set({ isLoadingAttendance: true, lastSaveMessage: null });
    try {
      const records = await hajriService.getAttendanceByDate(orgId, date);
      const map: Record<number, { status: AttendanceStatus; notes: string }> =
        {};

      records.forEach((r) => {
        map[r.userId] = {
          status: r.status,
          notes: r.notes || '',
        };
      });

      // For any workers in group not yet recorded, default to present
      get().members.forEach((m) => {
        if (!map[m.userId]) {
          map[m.userId] = { status: 'present', notes: '' };
        }
      });

      set({ attendanceMap: map, isLoadingAttendance: false });
    } catch {
      set({ isLoadingAttendance: false });
    }
  },

  setStatus: (userId: number, status: AttendanceStatus) => {
    set((state) => ({
      attendanceMap: {
        ...state.attendanceMap,
        [userId]: {
          status,
          notes: state.attendanceMap[userId]?.notes || '',
        },
      },
    }));
  },

  setNotes: (userId: number, notes: string) => {
    set((state) => ({
      attendanceMap: {
        ...state.attendanceMap,
        [userId]: {
          status: state.attendanceMap[userId]?.status || 'present',
          notes,
        },
      },
    }));
  },

  markAll: (status: AttendanceStatus) => {
    const newMap: Record<number, { status: AttendanceStatus; notes: string }> =
      {};
    get().members.forEach((m) => {
      newMap[m.userId] = {
        status,
        notes: get().attendanceMap[m.userId]?.notes || '',
      };
    });
    set({ attendanceMap: newMap });
  },

  saveAttendance: async () => {
    const { activeOrg, date, attendanceMap, members } = get();
    if (!activeOrg) return false;

    set({ isSavingAttendance: true, lastSaveMessage: null });
    try {
      const entries = members.map((m) => ({
        userId: m.userId,
        status: attendanceMap[m.userId]?.status || ('present' as AttendanceStatus),
        notes: attendanceMap[m.userId]?.notes || undefined,
      }));

      await hajriService.saveBulkAttendance({
        organizationId: activeOrg.id,
        date,
        entries,
      });

      set({
        isSavingAttendance: false,
        lastSaveMessage: `Saved Hajri for ${entries.length} workers on ${date}!`,
      });
      return true;
    } catch {
      set({
        isSavingAttendance: false,
        lastSaveMessage: 'Failed to save attendance. Check connection.',
      });
      return false;
    }
  },

  setReportPeriod: (month: number, year: number) => {
    set({ reportMonth: month, reportYear: year });
    get().loadWageReport();
  },

  loadWageReport: async () => {
    const { activeOrg, reportMonth, reportYear } = get();
    if (!activeOrg) return;

    set({ isLoadingReport: true });
    try {
      const data = await hajriService.getWageReport(
        activeOrg.id,
        reportMonth,
        reportYear
      );
      set({ report: data, isLoadingReport: false });
    } catch {
      set({ isLoadingReport: false });
    }
  },
}));
