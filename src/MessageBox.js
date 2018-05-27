import React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
//import Icon from '@material-ui/core/Icon'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
})

class ChatBubble extends React.Component {
    state = {
        message: ''
    }

    handleChange = message => event => {
        this.setState({
      [message]: event.target.value,
    })
    }

    render() {
        const { classes } = this.props
        return (
            <form className={classes.container} noValidate autoComplete='off'>
                <Grid item xs={3}>
                    <Button variant="raised" color="primary">
                        Primary
                      </Button>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                      id="message"
                      label="Enter message"
                      value={this.state.message}
                      onChange={this.handleChange('message')}
                      margin="normal"
                    />
                </Grid>
            </form>
        )
    }
}

export default withStyles(styles)(ChatBubble)
