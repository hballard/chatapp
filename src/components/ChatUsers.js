import React from 'react'

import { USER_SUBSCRIPTION } from '../graphql'
import AvatarName from './AvatarName'

class ChatUsers extends React.Component {
  handleWindowClose = e => {
    this.props.deleteUser({ variables: { sessionId: this.props.sessionId } })
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleWindowClose)
    this.props.subscribeToMore({
      document: USER_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const user = subscriptionData.data.user
        if (user.status === true) {
          const newUserNode = {
            node: { ...user, __typename: 'User' },
            __typename: 'UsersEdge'
          }
          return {
            users: {
              edges: [...prev.users.edges, newUserNode],
              __typename: 'UsersConnection'
            }
          }
        } else {
          return {
            users: {
              edges: prev.users.edges.filter(i => i.node.id !== user.id),
              __typename: 'UsersConnection'
            }
          }
        }
      }
    })
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleWindowClose)
  }

  render() {
    const { users, localUser } = this.props
    return (
      <div>
        {users.edges.map(item => {
          return (
            <AvatarName key={item.node.id}>
              {item.node.id === localUser
                ? item.node.name + ' (me)'
                : item.node.name}
            </AvatarName>
          )
        })}
      </div>
    )
  }
}

export default ChatUsers
