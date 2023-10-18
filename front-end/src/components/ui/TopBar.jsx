import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import logo from '../../assets/karangos-logo-600px.png'
import MainMenu from './MainMenu'
import myfetch from '../../utils/myfetch'
import { useLocation, useNavigate } from 'react-router-dom'
import UserMenu from './UserMenu'

export default function TopBar() {

  const [loggedInUser, setLoggedInUser] = React.useState(null)

  const location = useLocation()
  const navigate = useNavigate()

  // useEffect() para ser executado quando mudar a rota de front-end
  React.useEffect(() => {
    fetchLoggedInUser()
  }, [location])

  async function fetchLoggedInUser() {
    try {
      const user = await myfetch.get('user/loggedin')
      setLoggedInUser(user)
    }
    catch(error) {
      setLoggedInUser(null)
      // Se não foi possível obter os dados do usuário autenticado,
      // redirecionamos para a página de login
      if(location.pathname !== '/login') navigate('/login')
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" enableColorOnDark 
        sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        
        <Toolbar variant="dense">
          
          <MainMenu />

          <img src={logo} alt="Logotipo Karangos" style={{ width: '300px' }} />
        </Toolbar>
        
        <UserMenu user={loggedInUser} />

      </AppBar>
    </Box>
  );
}