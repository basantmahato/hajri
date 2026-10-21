import type { AttendanceRepository } from '../repository/attendance.repository.js';
import type { MembershipRepository } from '../repository/membership.repository.js';
import type { MarkAttendanceDto, BulkMarkAttendanceDto, UpdateAttendanceDto, AttendanceResponseDto } from '../types/attendance.types.js';

export class AttendanceService {
  private readonly VALID_STATUSES = ['present', 'absent', 'half_day', 'leave'];

  constructor(
    private attendanceRepository: AttendanceRepository,
    private membershipRepository: MembershipRepository,
  ) {}

  async markAttendance(markedByUserId: number, data: MarkAttendanceDto): Promise<AttendanceResponseDto> {
    const targetUserId = data.userId ?? data.employeeId;
    if (!targetUserId) {
      throw new Error('userId or employeeId is required');
    }

    // Verify marker has permission
    const markerMembership = await this.membershipRepository.findByUserAndOrg(markedByUserId, data.organizationId);
    if (!markerMembership || !['owner', 'admin', 'manager'].includes(markerMembership.role)) {
      throw new Error('Only owner, admin, or manager can mark attendance');
    }

    // Validate status
    if (!this.VALID_STATUSES.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${this.VALID_STATUSES.join(', ')}`);
    }

    // Check if attendance already marked for this user on this date
    const attendanceDate = new Date(data.date);
    const existing = await this.attendanceRepository.findByUserAndDate(targetUserId, attendanceDate);
    if (existing) {
      throw new Error('Attendance already marked for this user on this date');
    }

    const record = await this.attendanceRepository.create({
      userId: targetUserId,
      organizationId: data.organizationId,
      date: attendanceDate,
      status: data.status,
      notes: data.notes,
      approvedBy: markedByUserId,
    });

    return this.toResponseDto(record);
  }

  async bulkMarkAttendance(markedByUserId: number, data: BulkMarkAttendanceDto): Promise<AttendanceResponseDto[]> {
    // Verify marker has permission
    const markerMembership = await this.membershipRepository.findByUserAndOrg(markedByUserId, data.organizationId);
    if (!markerMembership || !['owner', 'admin', 'manager'].includes(markerMembership.role)) {
      throw new Error('Only owner, admin, or manager can mark attendance');
    }

    const attendanceDate = new Date(data.date);
    const results: AttendanceResponseDto[] = [];

    for (const entry of data.entries) {
      const targetUserId = entry.userId ?? entry.employeeId;
      if (!targetUserId) {
        throw new Error('userId or employeeId is required for each entry');
      }

      // Validate status
      if (!this.VALID_STATUSES.includes(entry.status)) {
        throw new Error(`Invalid status for user ${targetUserId}. Must be one of: ${this.VALID_STATUSES.join(', ')}`);
      }

      // Check if already marked
      const existing = await this.attendanceRepository.findByUserAndDate(targetUserId, attendanceDate);
      if (existing) {
        // Update instead of skip
        const updated = await this.attendanceRepository.update(existing.id, {
          status: entry.status,
          notes: entry.notes,
          approvedBy: markedByUserId,
        });
        results.push(this.toResponseDto(updated));
      } else {
        const record = await this.attendanceRepository.create({
          userId: targetUserId,
          organizationId: data.organizationId,
          date: attendanceDate,
          status: entry.status,
          notes: entry.notes,
          approvedBy: markedByUserId,
        });
        results.push(this.toResponseDto(record));
      }
    }

    return results;
  }

  async updateAttendance(userId: number, attendanceId: number, data: UpdateAttendanceDto): Promise<AttendanceResponseDto> {
    const record = await this.attendanceRepository.findById(attendanceId);
    if (!record) {
      throw new Error('Attendance record not found');
    }

    // Verify user has permission
    const membership = await this.membershipRepository.findByUserAndOrg(userId, record.organizationId);
    if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
      throw new Error('Only owner, admin, or manager can update attendance');
    }

    if (data.status && !this.VALID_STATUSES.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${this.VALID_STATUSES.join(', ')}`);
    }

    const updated = await this.attendanceRepository.update(attendanceId, data);
    return this.toResponseDto(updated);
  }

  async getByDate(userId: number, organizationId: number, date: string): Promise<AttendanceResponseDto[]> {
    // Verify user is a member
    const membership = await this.membershipRepository.findByUserAndOrg(userId, organizationId);
    if (!membership) {
      throw new Error('You do not have access to this organization');
    }

    const attendanceDate = new Date(date);
    const records = await this.attendanceRepository.findByOrganizationAndDate(organizationId, attendanceDate);
    return records.map((r) => this.toResponseDto(r));
  }

  async getByDateRange(
    userId: number,
    organizationId: number,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceResponseDto[]> {
    // Verify user is a member
    const membership = await this.membershipRepository.findByUserAndOrg(userId, organizationId);
    if (!membership) {
      throw new Error('You do not have access to this organization');
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await this.attendanceRepository.findByOrganizationAndDateRange(organizationId, start, end);
    return records.map((r) => this.toResponseDto(r));
  }

  async deleteAttendance(userId: number, attendanceId: number): Promise<void> {
    const record = await this.attendanceRepository.findById(attendanceId);
    if (!record) {
      throw new Error('Attendance record not found');
    }

    // Verify user has permission
    const membership = await this.membershipRepository.findByUserAndOrg(userId, record.organizationId);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new Error('Only owner or admin can delete attendance records');
    }

    await this.attendanceRepository.delete(attendanceId);
  }

  private toResponseDto(record: {
    id: number;
    userId: number;
    organizationId: number;
    date: Date;
    status: string;
    notes: string | null;
    approvedBy: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): AttendanceResponseDto {
    return {
      id: record.id,
      userId: record.userId,
      employeeId: record.userId,
      organizationId: record.organizationId,
      date: record.date,
      status: record.status,
      notes: record.notes,
      markedBy: record.approvedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
