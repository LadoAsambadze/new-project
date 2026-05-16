import { gql } from '@apollo/client/core'

const DESIGN_FRAGMENT = gql`
  fragment DesignFields on DesignType {
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

export const FEED_QUERY = gql`
  ${DESIGN_FRAGMENT}
  query Feed(
    $category: String
    $userId: String
    $isForSale: Boolean
    $cursor: String
    $limit: Int
  ) {
    feed(
      category: $category
      userId: $userId
      isForSale: $isForSale
      cursor: $cursor
      limit: $limit
    ) {
      items {
        ...DesignFields
      }
      nextCursor
      hasMore
    }
  }
`

export const DESIGN_QUERY = gql`
  ${DESIGN_FRAGMENT}
  query Design($id: String!) {
    design(id: $id) {
      ...DesignFields
    }
  }
`

export const MY_DESIGNS_QUERY = gql`
  ${DESIGN_FRAGMENT}
  query MyDesigns {
    myDesigns {
      ...DesignFields
    }
  }
`
