import React from 'react'
import myfetch from '../../utils/myfetch'
import Notification from './Notification'
import Waiting from './Waiting'
import { useNavigate } from 'react-router-dom'

export default function Logout() {

  const [state, setState] = React.useState({
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
  })

  const {
    showWaiting,
    notification
  } = state

  const navigate = useNavigate()

  async function performLogout() {
    setState({...state, showWaiting: true})
    try {
      await myfetch.post('user/logout')
      setState({...state, showWaiting: false})
      // Volta para página de login
      navigate('/login')
    }
    catch(error) {
      setState({
        ...state,
        showWaiting: false,
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: não foi possível fazer "logout".'
        }
      })
    }
  }

  function handleNotificationClose() {
    const status = notification.severity
    
    // Fecha a barra de notificação
    setState({...state, notification: { 
      show: false,
      severity: status,
      message: ''
    }})

  }

  // useEffect que será executado quando o componente
  // for carregado
  React.useState(() => {
    performLogout()
  }, [])

  return <>
    <Waiting show={showWaiting} />

    <Notification
      show={notification.show}
      severity={notification.severity}
      message={notification.message}
      onClose={handleNotificationClose}
    /> 
  </>

}