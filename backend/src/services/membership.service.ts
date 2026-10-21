import type { MembershipRepository } from '../repository/membership.repository.js';
import type { UserRepository } from '../repository/user.repository.js';
import type { AttendanceRepository } from '../repository/attendance.repository.js';
import type { AddMemberDto, UpdateMemberDto, MemberResponseDto, MemberWageReportDto } from '../types/membership.types.js';

export class MembershipService {
  constructor(
    private membershipRepository: MembershipRepository,
    private userRepository: UserRepository,
    private attendanceRepository: AttendanceRepository,
  ) {}

  async addMember(inviterId: number, data: AddMemberDto): Promise<MemberResponseDto> {
    // Verify the inviter has permission (owner or admin)
    const inviterMembership = await this.membershipRepository.findByUserAndOrg(inviterId, data.organizationId);
    if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
      throw new Error('Only organization owner or admin can add members');
    }

    // Resolve or create target user
    let targetUser = null;
    if (data.userId) {
      targetUser = await this.userRepository.findById(data.userId);
      if (!targetUser) {
        throw new Error('User not found');
      }
    } else if (data.phone) {
      targetUser = await this.userRepository.findByPhone(data.phone);
      if (!targetUser) {
        const cleanPhone = data.phone.replace(/\D/g, '');
        const placeholderEmail = `${cleanPhone || Date.now()}@hajri.local`;
        targetUser = await this.userRepository.create({
          name: data.name || `User ${cleanPhone.slice(-4) || ''}`.trim(),
          email: placeholderEmail,
          password: 'temp_password_hash',
        });
        await this.userRepository.update(targetUser.id, { phone: data.phone });
        targetUser = await this.userRepository.findById(targetUser.id);
      }
    } else if (data.email) {
      targetUser = await this.userRepository.findByEmail(data.email);
      if (!targetUser) {
        targetUser = await this.userRepository.create({
          name: data.name || data.email.split('@')[0],
          email: data.email,
          password: 'temp_password_hash',
        });
      }
    } else if (data.name) {
      // Direct worker added by business owner (worker does not need to login)
      const uniqueSuffix = `${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
      targetUser = await this.userRepository.create({
        name: data.name.trim(),
        email: `worker_${uniqueSuffix}@hajri.local`,
        password: 'worker_no_login',
      });
    } else {
      throw new Error('Worker name is required');
    }

    if (!targetUser) {
      throw new Error('Failed to resolve user');
    }

    // Check if already a member
    const existing = await this.membershipRepository.findByUserAndOrg(targetUser.id, data.organizationId);
    if (existing) {
      throw new Error('User is already a member of this organization');
    }

    const membership = await this.membershipRepository.create({
      userId: targetUser.id,
      organizationId: data.organizationId,
      role: data.role || 'member',
      dailyWage: data.dailyWage,
      status: 'active',
      invitedBy: inviterId,
    });

    return {
      ...membership,
      userName: targetUser.name,
      userEmail: targetUser.email,
      userPhone: targetUser.phone,
      userAvatar: targetUser.avatar,
    };
  }

  async updateMember(userId: number, membershipId: number, data: UpdateMemberDto): Promise<MemberResponseDto> {
    const membership = await this.membershipRepository.findById(membershipId);
    if (!membership) {
      throw new Error('Membership not found');
    }

    // Verify the requester has permission
    const requesterMembership = await this.membershipRepository.findByUserAndOrg(userId, membership.organizationId);
    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      throw new Error('Only organization owner or admin can update members');
    }

    // Cannot change owner's role
    if (membership.role === 'owner' && data.role && data.role !== 'owner') {
      throw new Error('Cannot change the owner role');
    }

    const updated = await this.membershipRepository.update(membershipId, data);

    const user = await this.userRepository.findById(updated.userId);
    return {
      ...updated,
      userName: user?.name || '',
      userEmail: user?.email || '',
      userPhone: user?.phone ?? null,
      userAvatar: user?.avatar ?? null,
    };
  }

  async removeMember(userId: number, membershipId: number): Promise<void> {
    const membership = await this.membershipRepository.findById(membershipId);
    if (!membership) {
      throw new Error('Membership not found');
    }

    // Verify the requester has permission
    const requesterMembership = await this.membershipRepository.findByUserAndOrg(userId, membership.organizationId);
    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      throw new Error('Only organization owner or admin can remove members');
    }

    // Cannot remove the owner
    if (membership.role === 'owner') {
      throw new Error('Cannot remove the organization owner');
    }

    await this.membershipRepository.delete(membershipId);
  }

  async listMembers(userId: number, organizationId: number): Promise<MemberResponseDto[]> {
    // Verify the requester is a member
    const requesterMembership = await this.membershipRepository.findByUserAndOrg(userId, organizationId);
    if (!requesterMembership) {
      throw new Error('You do not have access to this organization');
    }

    const members = await this.membershipRepository.findByOrganization(organizationId);

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role,
      dailyWage: m.dailyWage,
      status: m.status,
      joinedAt: m.joinedAt,
      invitedBy: m.invitedBy,
      isDefault: m.isDefault,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      userName: m.userName,
      userEmail: m.userEmail,
      userPhone: m.userPhone,
      userAvatar: m.userAvatar,
    }));
  }

  async getWageReport(userId: number, organizationId: number, month: number, year: number): Promise<MemberWageReportDto[]> {
    // Verify requester is owner or admin
    const requesterMembership = await this.membershipRepository.findByUserAndOrg(userId, organizationId);
    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      throw new Error('Only organization owner or admin can view wage reports');
    }

    // Get all members with user info
    const members = await this.membershipRepository.findByOrganization(organizationId);

    // Date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    // Get all attendance records for the org in this month
    const attendanceRecords = await this.attendanceRepository.findByOrganizationAndDateRange(
      organizationId,
      startDate,
      endDate,
    );

    // Build report per member
    const report: MemberWageReportDto[] = [];

    for (const member of members) {
      // The organization owner/manager is not a daily-wage worker
      if (member.role === 'owner') continue;

      const memberAttendance = attendanceRecords.filter(
        (a) => a.userId === member.userId,
      );

      const totalDaysPresent = memberAttendance.filter((a) => a.status === 'present').length;
      const totalHalfDays = memberAttendance.filter((a) => a.status === 'half_day').length;
      const totalAbsent = memberAttendance.filter((a) => a.status === 'absent').length;
      const totalLeave = memberAttendance.filter((a) => a.status === 'leave').length;

      const dailyWage = member.dailyWage ? parseFloat(member.dailyWage) : 0;
      const totalEarnings = (totalDaysPresent * dailyWage) + (totalHalfDays * dailyWage * 0.5);

      report.push({
        memberId: member.id,
        userId: member.userId,
        userName: member.userName,
        dailyWage: member.dailyWage,
        totalDaysPresent,
        totalHalfDays,
        totalAbsent,
        totalLeave,
        totalEarnings: totalEarnings.toFixed(2),
        month,
        year,
      });
    }

    return report;
  }
}
