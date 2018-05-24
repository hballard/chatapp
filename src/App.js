import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'

import AvatarName from './AvatarName'
import ChatBubble from './ChatBubble'

const App = props => {
    return (
      <React.Fragment>
        <CssBaseline />
        <ChatBubble />
      </React.Fragment>
    )
}

export default App
