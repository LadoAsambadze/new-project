import { gql } from '@apollo/client/core'

export const ME_FULL_QUERY = gql`
  query MeFull {
    me {
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

export const USER_PROFILE_QUERY = gql`
  query UserProfile($id: String!) {
    userProfile(id: $id) {
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

export const VENDORS_QUERY = gql`
  query Vendors($type: String) {
    vendors(type: $type) {
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
