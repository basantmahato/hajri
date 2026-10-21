export interface AddMemberDto {
  userId?: number;
  name?: string;
  email?: string;
  phone?: string;
  organizationId: number;
  role?: string;
  dailyWage?: string;
}

export interface UpdateMemberDto {
  role?: string;
  dailyWage?: string;
  status?: string;
}

export interface MemberResponseDto {
  id: number;
  userId: number;
  organizationId: number;
  role: string;
  dailyWage: string | null;
  status: string;
  joinedAt: Date;
  invitedBy: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Joined user fields
  userName?: string;
  userEmail?: string;
  userPhone?: string | null;
  userAvatar?: string | null;
}

export interface MemberWageReportDto {
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
