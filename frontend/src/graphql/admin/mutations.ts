import { gql } from '@apollo/client/core'

export const BAN_USER_MUTATION = gql`
  mutation BanUser($id: String!) {
    banUser(id: $id) {
      id
      banned
    }
  }
`

export const UNBAN_USER_MUTATION = gql`
  mutation UnbanUser($id: String!) {
    unbanUser(id: $id) {
      id
      banned
    }
  }
`

export const SET_FEATURED_MUTATION = gql`
  mutation SetFeatured($type: String!, $id: String!, $featured: Boolean!) {
    setFeatured(type: $type, id: $id, featured: $featured)
  }
`

export const ADMIN_DELETE_DESIGN_MUTATION = gql`
  mutation AdminDeleteDesign($id: String!) {
    adminDeleteDesign(id: $id)
  }
`

export const ADMIN_DELETE_SERVICE_MUTATION = gql`
  mutation AdminDeleteService($id: String!) {
    adminDeleteService(id: $id)
  }
`

export const ADMIN_DELETE_EVENT_MUTATION = gql`
  mutation AdminDeleteEvent($id: String!) {
    adminDeleteEvent(id: $id)
  }
`
