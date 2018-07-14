import React from 'react'
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
import ChatUsers from './components/ChatUsers'
import MessageBox from './components/MessageBox'
import SignInModal from './components/SignInModal'
import { GET_USERS, DELETE_USER, GET_CLIENT_STATE } from './graphql'

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
                        <Query query={GET_CLIENT_STATE}>
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
