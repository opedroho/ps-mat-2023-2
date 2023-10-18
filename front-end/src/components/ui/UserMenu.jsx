import React from 'react'
import Button from '@mui/material/Button'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useNavigate, Link } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

export default function UserMenu({user}) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [openDialog, setOpenDialog] = React.useState(false)

  const open = Boolean(anchorEl)

  const navigate = useNavigate()

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(event) {
    setAnchorEl(null)
  }

  function confirmLogout(event) {
    setOpenDialog(true)
    handleClose(event)
  }

  function handleDialogClose(answer) {
    setOpenDialog(false)
    if(answer) navigate('/logout')
  }

  if(user) {    // Existe usuário autenticado
    return <>

      <ConfirmDialog
        title="Atenção"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Deseja realmente sair?
      </ConfirmDialog>

      <Button 
        variant="text"
        color="secondary"
        startIcon={<PersonIcon />}
        onClick={handleClick}
        sx={{ mr: 2 }}
      >
        { user?.first_name + ' ' + user?.last_name }  
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
        PaperProps={{
          style: { minWidth: '200px' }
        }}
      >
        <MenuItem onClick={confirmLogout}>
          Sair
        </MenuItem> 
      </Menu>
    </>
  }
  else {
    return <>
      <Button 
          variant="text"
          color="secondary"
          component={Link}
          to="/login"
          startIcon={<LoginIcon />}
          sx={{ mr: 2 }}
        >
          Entrar
      </Button>
    </>
  }
}