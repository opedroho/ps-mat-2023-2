import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import myfetch from '../utils/myfetch'
import Waiting from '../components/ui/Waiting'
import Notification from '../components/ui/Notification'
import { useNavigate } from 'react-router-dom'

export default function CustomersForm() {

  const navigate = useNavigate()

  const [state, setState] = React.useState({
    customer: {},    // Objeto vazio
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    }
  })

  const {
    customer,
    showWaiting,
    notification
  } = state

  const states = [
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'São Paulo', value: 'SP' }
  ]

  function handleFieldChange(event) {
    console.log(event)
    const newCustomer = { ...customer }
    newCustomer[event.target.name] = event.target.value
    setState({ ...state, customer: newCustomer })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
    try {
      const result = await myfetch.post('customer', customer)
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.'
        }  
      })  
    }
    catch(error) {
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
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

    // Volta para a página de listagem
    if(status === 'success') navigate('/customers')
  }

  return(
    <>

      <Waiting show={showWaiting} />

      <Notification
        show={notification.show}
        severity={notification.severity}
        message={notification.message}
        onClose={handleNotificationClose}
      /> 

      <Typography variant="h1" sx={{ mb: '50px' }}>
        Cadastro de clientes
      </Typography>

      <form onSubmit={handleFormSubmit}>

        <Box className="form-fields">
        
          <TextField 
            id="name"
            name="name" 
            label="Nome completo" 
            variant="filled"
            required
            fullWidth
            value={customer.name}
            onChange={handleFieldChange}
          />

          <TextField 
            id="ident_document"
            name="ident_document" 
            label="CPF" 
            variant="filled"
            required
            fullWidth
            value={customer.ident_document}
            onChange={handleFieldChange}
          />

          <TextField 
            id="birth_date"
            name="birth_date" 
            label="Data de nascimento" 
            variant="filled"
            fullWidth
            value={customer.birth_date}
            onChange={handleFieldChange}
          />

          <TextField 
            id="street_name"
            name="street_name" 
            label="Logradouro (Rua, Av., etc.)" 
            variant="filled"
            required
            fullWidth
            placeholder="Ex.: Rua Principal"
            value={customer.street_name}
            onChange={handleFieldChange}
          />

          <TextField 
            id="house_number"
            name="house_number" 
            label="Nº" 
            variant="filled"
            required
            fullWidth
            value={customer.house_number}
            onChange={handleFieldChange}
          />

          <TextField 
            id="complements"
            name="complements" 
            label="Complemento" 
            variant="filled"
            fullWidth
            placeholder="Apto., bloco, casa, etc."
            value={customer.complements}
            onChange={handleFieldChange}
          />

          <TextField 
            id="neighborhood"
            name="neighborhood" 
            label="Bairro" 
            variant="filled"
            required
            fullWidth
            value={customer.neighborhood}
            onChange={handleFieldChange}
          />
          
          <TextField 
            id="municipality"
            name="municipality" 
            label="Município" 
            variant="filled"
            required
            fullWidth
            value={customer.municipality}
            onChange={handleFieldChange}
          />

          <TextField
            id="state"
            name="state"
            select
            label="UF"
            variant="filled"
            fullWidth
            required
            value={customer.state}
            onChange={handleFieldChange}
          >
            {states.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField 
            id="phone"
            name="phone" 
            label="Celular / Telefone de contato" 
            variant="filled"
            required
            fullWidth
            value={customer.phone}
            onChange={handleFieldChange}
          />

          <TextField 
            id="email"
            name="email" 
            label="E-mail" 
            variant="filled"
            required
            fullWidth
            value={customer.email}
            onChange={handleFieldChange}
          />
          
        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>
          { JSON.stringify(customer) }
        </Box>

        <Toolbar sx={{ justifyContent: "space-around" }}>
          <Button variant="contained" color="secondary" type="submit">Salvar</Button>
          <Button variant="outlined">Voltar</Button>
        </Toolbar>
      
      </form>
    </>

    
  )
}