import React from 'react'
import { render } from 'react-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import './assets/styles/App.css'

import App from './App.js'

const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql'
})

const ChatApp = () => (
  <ApolloProvider client={client}>
    <MuiThemeProvider theme={createMuiTheme()}>
      <App />
    </MuiThemeProvider>
  </ApolloProvider>
)

render(<ChatApp />, document.getElementById('root'))
