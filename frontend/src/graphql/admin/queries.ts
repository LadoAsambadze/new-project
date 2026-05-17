import { gql } from '@apollo/client/core'

export const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    adminStats {
      totalUsers
      totalVendors
      totalCustomers
      totalDesigns
      totalEvents
      totalBookings
      totalTickets
    }
  }
`

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($cursor: String) {
    adminUsers(cursor: $cursor) {
      id
      name
      email
      role
      vendorType
      city
      banned
      createdAt
    }
  }
`

export const ADMIN_VENDORS_QUERY = gql`
  query AdminVendors {
    adminVendors {
      id
      name
      email
      role
      vendorType
      city
      banned
      createdAt
    }
  }
`

export const ADMIN_SERVICES_QUERY = gql`
  query AdminServices($cursor: String) {
    adminServices(cursor: $cursor) {
      id
      title
      city
      isFeatured
      isAvailable
      user {
        id
        name
      }
    }
  }
`

export const ADMIN_EVENTS_QUERY = gql`
  query AdminEvents($cursor: String) {
    adminEvents(cursor: $cursor) {
      id
      title
      city
      date
      status
      isFeatured
      user {
        id
        name
      }
    }
  }
`
