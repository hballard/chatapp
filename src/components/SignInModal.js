import React from 'react'
import { Mutation, Query } from 'react-apollo'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import teal from '@material-ui/core/colors/teal'
import { withStyles } from '@material-ui/core/styles'

import { ADD_USER, GET_CLIENT_SESSION_ID } from '../graphql'

const styles = theme => ({
  paper: {
    width: theme.spacing.unit * 50,
    padding: theme.spacing.unit * 4
  },
  button: {
    marginRight: '4em',
    marginTop: 60,
    backgroundColor: teal[500],
    color: 'white'
  },
  cssLabel: {
    '&$cssFocused': {
      color: teal[500]
    }
  },
  cssFocused: {},
  cssUnderline: {
    '&:after': {
      borderBottomColor: teal[500]
    },
    '&:hover:not(.foo):not(.bar):not(.foobar):before': {
      borderBottomColor: teal[500]
    }
  }
})

class SignInModal extends React.Component {
  state = {
    open: true,
    inputField: ''
  }

  handleSubmit = (addUser, sessionId) => () => {
    addUser({
      variables: { name: this.state.inputField, sessionId: sessionId }
    })
    this.setState({ open: false })
  }

  handleChange = event => {
    this.setState({
      inputField: event.target.value
    })
  }

  render() {
    const classes = this.props.classes

    return (
      <Modal open={this.state.open}>
        <Grid container justify={'center'} alignItems={'center'}>
          <Grid item>
            <Paper className={classes.paper}>
              <Mutation
                mutation={ADD_USER}
                update={(cache, { data: { addUser } }) => {
                  cache.writeData({ data: { localUser: addUser.user.id } })
                }}
              >
                {addUser => {
                  return (
                    <Query query={GET_CLIENT_SESSION_ID}>
                      {({ data: { sessionId } }) => (
                        <React.Fragment>
                          <Typography variant="title">
                            Enter your chat name
                          </Typography>
                          <Button
                            variant="raised"
                            className={classes.button}
                            onClick={this.handleSubmit(addUser, sessionId)}
                          >
                            Submit
                          </Button>
                          <FormControl className={classes.formControl}>
                            <InputLabel
                              htmlFor="enter-name"
                              FormLabelClasses={{
                                root: classes.cssLabel,
                                focused: classes.cssFocused
                              }}
                            >
                              Enter name
                            </InputLabel>
                            <Input
                              id="enter-name"
                              value={this.state.inputField}
                              onChange={this.handleChange}
                              classes={{ underline: classes.cssUnderline }}
                            />
                          </FormControl>
                        </React.Fragment>
                      )}
                    </Query>
                  )
                }}
              </Mutation>
            </Paper>
          </Grid>
        </Grid>
      </Modal>
    )
  }
}

export default withStyles(styles)(SignInModal)
