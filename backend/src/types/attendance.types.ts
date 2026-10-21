export interface MarkAttendanceDto {
  userId?: number;
  employeeId?: number;
  organizationId: number;
  date: string;
  status: string; // present, absent, half_day, leave
  notes?: string;
}

export interface BulkMarkAttendanceDto {
  organizationId: number;
  date: string;
  entries: {
    userId?: number;
    employeeId?: number;
    status: string;
    notes?: string;
  }[];
}

export interface UpdateAttendanceDto {
  status?: string;
  notes?: string;
}

export interface AttendanceResponseDto {
  id: number;
  userId: number;
  employeeId: number; // alias for userId
  organizationId: number;
  date: Date;
  status: string;
  notes: string | null;
  markedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceQueryDto {
  organizationId: number;
  userId?: number;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}
