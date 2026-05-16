import { gql } from '@apollo/client/core'

const SERVICE_FRAGMENT = gql`
  fragment ServiceFields on ServiceType {
    id
    title
    description
    category
    images
    priceFrom
    priceTo
    city
    isAvailable
    isFeatured
    userId
    user {
      id
      name
      avatar
    }
    createdAt
  }
`

const BOOKING_FRAGMENT = gql`
  fragment BookingFields on BookingType {
    id
    serviceId
    service {
      ...ServiceFields
    }
    userId
    user {
      id
      name
      avatar
    }
    status
    date
    message
    createdAt
  }
  ${SERVICE_FRAGMENT}
`

export const SERVICES_QUERY = gql`
  ${SERVICE_FRAGMENT}
  query Services($category: String, $city: String, $cursor: String, $limit: Int) {
    services(category: $category, city: $city, cursor: $cursor, limit: $limit) {
      items {
        ...ServiceFields
      }
      nextCursor
      hasMore
    }
  }
`

export const SERVICE_QUERY = gql`
  ${SERVICE_FRAGMENT}
  query Service($id: String!) {
    service(id: $id) {
      ...ServiceFields
    }
  }
`

export const MY_SERVICES_QUERY = gql`
  ${SERVICE_FRAGMENT}
  query MyServices {
    myServices {
      ...ServiceFields
    }
  }
`

export const MY_BOOKINGS_QUERY = gql`
  ${BOOKING_FRAGMENT}
  query MyBookings {
    myBookings {
      ...BookingFields
    }
  }
`

export const VENDOR_BOOKINGS_QUERY = gql`
  ${BOOKING_FRAGMENT}
  query VendorBookings {
    vendorBookings {
      ...BookingFields
    }
  }
`
