import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
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
          status
        }
      }
    }
  }
`

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
            <Query
              query={gql`
                {
                  localUser @client
                }
              `}
            >
              {({ data: { localUser } }) => (
                <Query query={GET_USERS} pollInterval={10000}>
                  {({ loading, error, data: { users } }) => {
                    if (loading) return <CircularProgress />
                    if (error) return `Error! ${error.message}`
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
                  }}
                </Query>
              )}
            </Query>
          </Paper>
        </Grid>
        <SignInModal />
      </Grid>
    </React.Fragment>
  )
})
