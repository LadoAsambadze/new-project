import { gql } from '@apollo/client/core'

const DESIGN_FRAGMENT = gql`
  fragment DesignMutationFields on DesignType {
    id
    title
    description
    images
    category
    price
    isForSale
    userId
    user {
      id
      name
      avatar
      vendorType
    }
    likesCount
    likedByMe
    savedByMe
    createdAt
  }
`

export const CREATE_DESIGN_MUTATION = gql`
  ${DESIGN_FRAGMENT}
  mutation CreateDesign($input: CreateDesignInput!) {
    createDesign(input: $input) {
      ...DesignMutationFields
    }
  }
`

export const UPDATE_DESIGN_MUTATION = gql`
  ${DESIGN_FRAGMENT}
  mutation UpdateDesign($input: UpdateDesignInput!) {
    updateDesign(input: $input) {
      ...DesignMutationFields
    }
  }
`

export const DELETE_DESIGN_MUTATION = gql`
  mutation DeleteDesign($id: String!) {
    deleteDesign(id: $id)
  }
`

export const TOGGLE_LIKE_MUTATION = gql`
  ${DESIGN_FRAGMENT}
  mutation ToggleLike($designId: String!) {
    toggleLike(designId: $designId) {
      ...DesignMutationFields
    }
  }
`

export const TOGGLE_SAVE_MUTATION = gql`
  ${DESIGN_FRAGMENT}
  mutation ToggleSave($designId: String!) {
    toggleSave(designId: $designId) {
      ...DesignMutationFields
    }
  }
`
