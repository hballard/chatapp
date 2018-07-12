import React from 'react'
import { render } from 'react-dom'
import ApolloClient from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { ApolloProvider } from 'react-apollo'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'
import { split } from 'apollo-link'
import { withClientState } from 'apollo-link-state'

import App from './App.js'

const cache = new InMemoryCache()

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql',
  credentials: 'same-origin'
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:5000/subscriptions',
  options: {
    reconnect: true
  }
})

const wsHttpLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        )
      if (networkError) console.log(`[Network error]: ${networkError}`)
    }),
    withClientState({
      cache,
      defaults: {
        localUser: ''
      },
      resolvers: {},
      typeDefs: `
        type Query {
        localUser: String
        }
        `
    }),
    wsHttpLink
  ]),
  cache
})

const ChatApp = () => (
  <ApolloProvider client={client}>
    <MuiThemeProvider theme={createMuiTheme()}>
      <App />
    </MuiThemeProvider>
  </ApolloProvider>
)

render(<ChatApp />, document.getElementById('root'))
