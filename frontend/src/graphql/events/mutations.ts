import { gql } from '@apollo/client/core'

const EVENT_FRAGMENT = gql`
  fragment EventMutationFields on EventType {
    id
    title
    description
    images
    city
    address
    date
    endDate
    category
    status
    isFeatured
    ticketPrice
    totalTickets
    soldTickets
    availableTickets
    userId
    user {
      id
      name
      avatar
    }
    createdAt
  }
`

const TICKET_FRAGMENT = gql`
  fragment TicketMutationFields on TicketType {
    id
    eventId
    event {
      ...EventMutationFields
    }
    userId
    user {
      id
      name
      email
      avatar
    }
    price
    qrCode
    used
    createdAt
  }
  ${EVENT_FRAGMENT}
`

export const CREATE_EVENT_MUTATION = gql`
  ${EVENT_FRAGMENT}
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventMutationFields
    }
  }
`

export const UPDATE_EVENT_MUTATION = gql`
  ${EVENT_FRAGMENT}
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      ...EventMutationFields
    }
  }
`

export const PUBLISH_EVENT_MUTATION = gql`
  ${EVENT_FRAGMENT}
  mutation PublishEvent($id: String!) {
    publishEvent(id: $id) {
      ...EventMutationFields
    }
  }
`

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`

export const PURCHASE_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation PurchaseTicket($eventId: String!) {
    purchaseTicket(eventId: $eventId) {
      ...TicketMutationFields
    }
  }
`

export const VALIDATE_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation ValidateTicket($qrCode: String!) {
    validateTicket(qrCode: $qrCode) {
      ...TicketMutationFields
    }
  }
`
