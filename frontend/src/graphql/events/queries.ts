import { gql } from '@apollo/client/core'

const EVENT_FRAGMENT = gql`
  fragment EventFields on EventType {
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
  fragment TicketFields on TicketType {
    id
    eventId
    event {
      ...EventFields
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

export const EVENTS_QUERY = gql`
  ${EVENT_FRAGMENT}
  query Events($city: String, $category: String, $dateFrom: String, $cursor: String, $limit: Int) {
    events(city: $city, category: $category, dateFrom: $dateFrom, cursor: $cursor, limit: $limit) {
      items {
        ...EventFields
      }
      nextCursor
      hasMore
    }
  }
`

export const EVENT_QUERY = gql`
  ${EVENT_FRAGMENT}
  query Event($id: String!) {
    event(id: $id) {
      ...EventFields
    }
  }
`

export const MY_EVENTS_QUERY = gql`
  ${EVENT_FRAGMENT}
  query MyEvents {
    myEvents {
      ...EventFields
    }
  }
`

export const MY_TICKETS_QUERY = gql`
  ${TICKET_FRAGMENT}
  query MyTickets {
    myTickets {
      ...TicketFields
    }
  }
`

export const EVENT_ATTENDEES_QUERY = gql`
  ${TICKET_FRAGMENT}
  query EventAttendees($eventId: String!) {
    eventAttendees(eventId: $eventId) {
      ...TicketFields
    }
  }
`

export const FEATURED_EVENTS_QUERY = gql`
  ${EVENT_FRAGMENT}
  query FeaturedEvents($limit: Int) {
    featuredEvents(limit: $limit) {
      ...EventFields
    }
  }
`

export const EVENTS_BY_CITY_QUERY = gql`
  ${EVENT_FRAGMENT}
  query EventsByCity($city: String!, $category: String, $dateFrom: String, $cursor: String, $limit: Int) {
    eventsByCity(city: $city, category: $category, dateFrom: $dateFrom, cursor: $cursor, limit: $limit) {
      items {
        ...EventFields
      }
      nextCursor
      hasMore
    }
  }
`

export const AVAILABLE_CITIES_QUERY = gql`
  query AvailableCities {
    availableCities
  }
`

export const UPCOMING_EVENTS_QUERY = gql`
  ${EVENT_FRAGMENT}
  query UpcomingEvents($limit: Int) {
    upcomingEvents(limit: $limit) {
      ...EventFields
    }
  }
`
