import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import AvatarName from './AvatarName'
import ChatBubble from './ChatBubble'
import MessageBox from './MessageBox'

const App = props => {
    return (
      <React.Fragment>
        <CssBaseline />
          <Grid container justify='center' alignItems='center'>
            <Grid item xs={8}>
              <Paper>
                <AvatarName />
                <ChatBubble />
                <MessageBox />
              </Paper>
            </Grid>
          </Grid>
      </React.Fragment>
    )
}

export default App
