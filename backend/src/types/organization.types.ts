export interface CreateOrganizationDto {
  name: string;
  type?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  type?: string;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  settings?: string;
}

export interface OrganizationResponseDto {
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
}
