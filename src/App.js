import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CssBaseline from '@material-ui/core/CssBaseline'
import teal from '@material-ui/core/colors/teal'
import { withStyles } from '@material-ui/core/styles'

import AvatarName from './AvatarName'
import ChatSection from './ChatSection'
import MessageBox from './MessageBox'
import SignInModal from './SignInModal'

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
            <AvatarName>Heath Ballard (me)</AvatarName>
            <AvatarName>Casey Ballard</AvatarName>
            <div />
          </Paper>
        </Grid>
        <SignInModal />
      </Grid>
    </React.Fragment>
  )
})
