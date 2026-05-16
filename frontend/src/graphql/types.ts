export type Role = 'CUSTOMER' | 'VENDOR'
export type VendorType = 'DESIGNER' | 'VENUE' | 'BAND' | 'EVENT_MANAGER'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: Role
  vendorType?: VendorType
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}
