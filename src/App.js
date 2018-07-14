import React from 'react'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CssBaseline from '@material-ui/core/CssBaseline'
import teal from '@material-ui/core/colors/teal'
import { withStyles } from '@material-ui/core/styles'
import './styles/App.css'

import AvatarName from './components/AvatarName'
import ChatSection from './components/ChatSection'
import MessageBox from './components/MessageBox'
import SignInModal from './components/SignInModal'

const styles = {
  mainContainer: {
    marginTop: 75
  },
  mainItem: {
    margin: 10,
    minWidth: 350
  },
  sideItem: {
    margin: 10
  },
  sideHeader: {
    backgroundColor: teal[500],
    padding: '1.3em',
    color: 'white'
  }
}

const GET_USERS = gql`
  query getUsers {
    users {
      edges {
        node {
          id
          name
          sessionId
          status
        }
      }
    }
  }
`

const USER_SUBSCRIPTION = gql`
  subscription newUser {
    user {
      id
      name
      sessionId
      status
    }
  }
`

const DELETE_USER = gql`
  mutation deleteUser($sessionId: String!) {
    deleteUser(sessionId: $sessionId) {
      ok
    }
  }
`

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
        if (
          this.props.localUser === '' &&
          this.props.sessionId === user.sessionId
        )
          return prev
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

export default withStyles(styles)(({ classes }) => {
  return (
    <React.Fragment>
      <CssBaseline />
      <Grid container justify="center" className={classes.mainContainer}>
        <Grid item xs={6} className={classes.mainItem}>
          <Paper>
            <AvatarName
              width={60}
              height={60}
              variant="display2"
              backgroundColor={teal[500]}
              color="white"
            >
              Heath Ballard
            </AvatarName>
            <ChatSection />
            <MessageBox />
          </Paper>
        </Grid>
        <Grid item className={classes.sideItem}>
          <Paper>
            <div className={classes.sideHeader}>
              <Typography variant="display2" style={{ color: 'inherit' }}>
                Chat Users
              </Typography>
            </div>
            <Mutation mutation={DELETE_USER}>
              {deleteUser => {
                return (
                  <Query query={GET_USERS}>
                    {({ subscribeToMore, loading, error, data: { users } }) => {
                      if (loading) return <CircularProgress />
                      if (error) return `Error! ${error.message}`
                      return (
                        <Query
                          query={gql`
                            query appClientState {
                              localUser @client
                              sessionId @client
                            }
                          `}
                        >
                          {({ data: { localUser, sessionId } }) => (
                            <ChatUsers
                              users={users}
                              localUser={localUser}
                              sessionId={sessionId}
                              deleteUser={deleteUser}
                              subscribeToMore={subscribeToMore}
                            />
                          )}
                        </Query>
                      )
                    }}
                  </Query>
                )
              }}
            </Mutation>
          </Paper>
        </Grid>
        <SignInModal />
      </Grid>
    </React.Fragment>
  )
})
