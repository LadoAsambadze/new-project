import { gql } from '@apollo/client/core'

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      avatar
      role
      vendorType
      bio
      city
      createdAt
    }
  }
`

export const COMPLETE_VENDOR_ONBOARDING_MUTATION = gql`
  mutation CompleteVendorOnboarding($vendorType: String!) {
    completeVendorOnboarding(vendorType: $vendorType) {
      id
      email
      name
      avatar
      role
      vendorType
      bio
      city
      createdAt
    }
  }
`
