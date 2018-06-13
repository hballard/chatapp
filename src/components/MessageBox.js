import React from 'react'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import teal from '@material-ui/core/colors/teal'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: 125
  },
  button: {
    marginRight: '4em',
    marginTop: 60,
    backgroundColor: teal[500],
    color: 'white'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  formControl: {
    marginTop: theme.spacing.unit*3
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

class ChatBubble extends React.Component {
  state = {
    message: ''
  }

  handleChange = message => event => {
    this.setState({
      [message]: event.target.value
    })
  }

  render() {
    const { classes } = this.props
    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Grid item>
          <Button className={classes.button}>
            Send
             <Icon className={classes.rightIcon}>send</Icon>
          </Button>
        </Grid>
        <Grid item>
          <FormControl className={classes.formControl}>
            <InputLabel
              htmlFor="message"
              FormLabelClasses={{
                root: classes.cssLabel,
                focused: classes.cssFocused
              }}
            >
              Enter message
            </InputLabel>
            <Input
              id="message"
              value={this.state.message}
              onChange={this.handleChange('message')}
              classes={{ underline: classes.cssUnderline }}
            />
          </FormControl>
        </Grid>
      </form>
    )
  }
}

export default withStyles(styles)(ChatBubble)
