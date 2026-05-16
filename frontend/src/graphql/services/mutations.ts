import { gql } from '@apollo/client/core'

const SERVICE_FRAGMENT = gql`
  fragment ServiceMutationFields on ServiceType {
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
  fragment BookingMutationFields on BookingType {
    id
    serviceId
    service {
      ...ServiceMutationFields
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

export const CREATE_SERVICE_MUTATION = gql`
  ${SERVICE_FRAGMENT}
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      ...ServiceMutationFields
    }
  }
`

export const UPDATE_SERVICE_MUTATION = gql`
  ${SERVICE_FRAGMENT}
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      ...ServiceMutationFields
    }
  }
`

export const DELETE_SERVICE_MUTATION = gql`
  mutation DeleteService($id: String!) {
    deleteService(id: $id)
  }
`

export const TOGGLE_AVAILABILITY_MUTATION = gql`
  ${SERVICE_FRAGMENT}
  mutation ToggleAvailability($id: String!) {
    toggleAvailability(id: $id) {
      ...ServiceMutationFields
    }
  }
`

export const CREATE_BOOKING_MUTATION = gql`
  ${BOOKING_FRAGMENT}
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      ...BookingMutationFields
    }
  }
`

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
  ${BOOKING_FRAGMENT}
  mutation UpdateBookingStatus($bookingId: String!, $status: String!) {
    updateBookingStatus(bookingId: $bookingId, status: $status) {
      ...BookingMutationFields
    }
  }
`
