import type { OrganizationRepository } from '../repository/organization.repository.js';
import type { MembershipRepository } from '../repository/membership.repository.js';
import type { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from '../types/organization.types.js';

export class OrganizationService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private membershipRepository: MembershipRepository,
  ) {}

  async create(ownerId: number, data: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    // Generate slug from name
    let slug = this.generateSlug(data.name);

    // If slug exists, append random suffix
    const existing = await this.organizationRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug.substring(0, 90)}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const org = await this.organizationRepository.create({
      ...data,
      slug,
      ownerId,
    });

    // Auto-create owner membership
    await this.membershipRepository.create({
      userId: ownerId,
      organizationId: org.id,
      role: 'owner',
      status: 'active',
      isDefault: true,
    });

    return this.toResponseDto(org);
  }

  async getById(id: number, userId: number): Promise<OrganizationResponseDto> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Verify user is a member
    const membership = await this.membershipRepository.findByUserAndOrg(userId, id);
    if (!membership) {
      throw new Error('You do not have access to this organization');
    }

    return this.toResponseDto(org);
  }

  async listByUser(userId: number): Promise<OrganizationResponseDto[]> {
    // Get all memberships for user
    const userMemberships = await this.membershipRepository.findByUser(userId);
    const orgs: OrganizationResponseDto[] = [];

    for (const membership of userMemberships) {
      const org = await this.organizationRepository.findById(membership.organizationId);
      if (org && org.isActive) {
        orgs.push(this.toResponseDto(org));
      }
    }

    return orgs;
  }

  async update(id: number, userId: number, data: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Only owner or admin can update
    const membership = await this.membershipRepository.findByUserAndOrg(userId, id);
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new Error('Only organization owner or admin can update settings');
    }

    const updated = await this.organizationRepository.update(id, data);
    return this.toResponseDto(updated);
  }

  async delete(id: number, userId: number): Promise<void> {
    const org = await this.organizationRepository.findById(id);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Only owner can delete
    if (org.ownerId !== userId) {
      throw new Error('Only the organization owner can delete it');
    }

    await this.organizationRepository.delete(id);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  private toResponseDto(org: {
    id: number;
    name: string;
    slug: string;
    type: string;
    industry: string | null;
    description: string | null;
    logo: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    ownerId: number;
    isActive: boolean;
    timezone: string | null;
    settings: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      industry: org.industry,
      description: org.description,
      logo: org.logo,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      postalCode: org.postalCode,
      phone: org.phone,
      email: org.email,
      website: org.website,
      ownerId: org.ownerId,
      isActive: org.isActive,
      timezone: org.timezone,
      settings: org.settings,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
