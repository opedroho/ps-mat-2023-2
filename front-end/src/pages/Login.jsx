import React from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Waiting from '../components/ui/Waiting'
import Notification from '../components/ui/Notification'
import myfetch from '../utils/myfetch'

export default function Login() {

  const [state, setState] = React.useState({
    user: {
      email: '',
      password: ''
    },
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    }
  })

  const {
    user,
    showWaiting,
    notification
  } = state

  const navigate = useNavigate()

  function handleNotificationClose() {
    const status = notification.severity
    
    // Fecha a barra de notificação
    setState({...state, notification: { 
      show: false,
      severity: status,
      message: ''
    }})

    // Vai para a página inicial
    if(status === 'success') navigate('/')
  }

  function handleFieldChange(event) {
    const newUser = { ...user }
    newUser[event.target.name] = event.target.value
    setState({...state, user: newUser})
  }

  async function handleFormSubmit(event) {
    event.preventDefault()        // Evita o recarregamento da página

    setState({ ...state, showWaiting: true })

    try {
      
      await myfetch.post('user/login', user)

      setState({
        ...state,
        showWaiting: false,
        notification: {
          show: true,
          severity: 'success',
          message: 'Autenticado com sucesso.'
        }

      })

    }
    catch(error) {
      setState({
        ...state,
        showWaiting: false,
        notification: {
          show: true,
          severity: 'error',
          message: error.message
        }
      })
      console.error(error)
    }
  }

  return <>

    <Waiting show={showWaiting} />

    <Notification
      show={notification.show}
      severity={notification.severity}
      message={notification.message}
      timeout={
        notification.severity === 'success' ? 1000 : 5000
      }
      onClose={handleNotificationClose}
    /> 

    <Box sx={{ 
      width: '500px',
      maxWidth: '90%',
      margin: '0 auto'
    }}>
      
      <Typography variant="h1" sx={{ mb: '50px' }}>
        Autentique-se
      </Typography>

      <Paper sx={{ padding: '36px' }}>

        <form className="form-fields" onSubmit={handleFormSubmit}>
          <TextField
            id="email"
            name="email"
            label="E-mail"
            variant="filled"
            fullWidth
            value={user.email}
            onChange={handleFieldChange}
            required
            autoFocus
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label="Senha"
            variant="filled"
            fullWidth
            value={user.password}
            onChange={handleFieldChange}
            required
          />

          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
            >
              Enviar
            </Button>
          </Box>
        </form>

      </Paper>

    </Box>
  </>
}