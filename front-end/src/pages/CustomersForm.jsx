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
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InputMask from 'react-input-mask'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptLocale from 'date-fns/locale/pt-BR'
import { parseISO } from 'date-fns'
import Customer from '../models/customer'
import { ZodError } from 'zod'

export default function CustomersForm() {

  const navigate = useNavigate()
  const params = useParams()

  // Valores padrão para os campos do formulário
  const customerDefaults = {
    name: '',
    ident_document: '',
    //birth_date: '',
    street_name: '',
    house_number: '',
    neighborhood: '',
    municipality: '',
    state: '',
    phone: '',
    email: ''
  }

  const [state, setState] = React.useState({
    customer: customerDefaults,    
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
    openDialog: false,
    isFormModified: false,
    validationErrors: {}
  })

  const {
    customer,
    showWaiting,
    notification,
    openDialog,
    isFormModified,
    validationErrors
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

  const maskFormatChars = {
    '9': '[0-9]',
    'a': '[A-Za-z]',
    '*': '[A-Za-z0-9]',
    '_': '[\s0-9]'     // Um espaço em branco ou um dígito
  }

  // useEffect com vetor de dependências vazio. Será executado
  // uma vez, quando o componente for carregado
  React.useEffect(() => {
    // Verifica se existe o parâmetro id na rota.
    // Caso exista, chama a função fetchData() para carregar
    // os dados indicados pelo parâmetro para edição
    if(params.id) fetchData()
  }, [])

  async function fetchData() {
    // Exibe o backdrop para indicar que uma operação está ocorrendo
    // em segundo plano
    setState({ ...state, showWaiting: true })
    try {
      const result = await myfetch.get(`customer/${params.id}`)
      
      // É necesário converter a data de nascimento de string para data
      // antes de carregá-la no componente DatePicker
      result.birth_date = parseISO(result.birth_date)

      setState({ ...state, showWaiting: false, customer: result })
      
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

  function handleFieldChange(event) {
    console.log(event)
    const newCustomer = { ...customer }
    newCustomer[event.target.name] = event.target.value
    
    setState({ 
      ...state, 
      customer: newCustomer,
      isFormModified: true      // O formulário foi alterado
    })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
    try {

      console.log({customer})

      // Chama a validação da biblioteca Zod
      Customer.parse(customer)

      let result

      // Se existir o campo id no json de dados, chama o método PUT
      // para alteração
      if(customer.id) result = await myfetch.put(`customer/${customer.id}`, customer)

      // Senão, chama o método POST para criar um novo registro
      else result = await myfetch.post('customer', customer)
      
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.',
          validationErrors: {}
        }  
      })  
    }
    catch(error) {

      if(error instanceof ZodError) {
        console.error(error)

        // Preenchendo os estado validationError
        // para exibir os erros para o usuário
        let valErrors = {}
        for(let e of error.issues) valErrors[e.path[0]] = e.message

        setState({
          ...state,
          validationErrors: valErrors,
          showWaiting: false, // Esconde o backdrop
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: há campos inválidos no formulário.'
          }
        })
        
      }

      else setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message,
          validationErrors: {}
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
    if(status === 'success') navigate('..', { relative: 'path' })
  }

  function handleBackButtonClose(event) {
    // Se o formulário tiver sido modificado, abre a caixa de diálogo
    // para perguntar se quer mesmo voltar, perdendo as alterações
    if(isFormModified) setState({ ...state, openDialog: true })

    // Senão, volta à página de listagem
    else navigate('..', { relative: 'path' })
  }

  function handleDialogClose(answer) {

    // Fechamos a caixa de diálogo
    setState({ ...state, openDialog: false })

    // Se o usuário tiver respondido se quer voltar à página
    // de listagem mesmo com alterações pendentes, faremos a
    // vontade dele
    if(answer) navigate('..', { relative: 'path' })
  }

  return(
    <>

      <ConfirmDialog
        title="Atenção"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Há alterações que ainda não foram salvas. Deseja realmente voltar?
      </ConfirmDialog>

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
            autoFocus
            error={validationErrors?.name}
            helperText={validationErrors?.name}
          />

          <InputMask
            mask="999.999.999-99"
            maskChar=" "
            value={customer.ident_document}
            onChange={handleFieldChange}
          >
            {
              () => <TextField 
                id="ident_document"
                name="ident_document" 
                label="CPF" 
                variant="filled"
                required
                fullWidth
                error={validationErrors?.ident_document}
                helperText={validationErrors?.ident_document}
              />
            }
          </InputMask>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
            <DatePicker
              label="Data de nascimento"
              value={customer.birth_date}
              onChange={ value => 
                handleFieldChange({ target: { name: 'birth_date', value } }) 
              }
              slotProps={{ textField: { 
                variant: 'filled', 
                fullWidth: true,
                error: validationErrors?.birth_date,
                helperText: validationErrors?.birth_date
              }}}
            />
          </LocalizationProvider>

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
            error={validationErrors?.street_name}
            helperText={validationErrors?.street_name}
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
            error={validationErrors?.house_number}
            helperText={validationErrors?.house_number}
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
            error={validationErrors?.complements}
            helperText={validationErrors?.complements}
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
            error={validationErrors?.neighborhood}
            helperText={validationErrors?.neighborhood}
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
            error={validationErrors?.municipality}
            helperText={validationErrors?.municipality}
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
            error={validationErrors?.state}
            helperText={validationErrors?.state}
          >
            {states.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <InputMask
            mask="(99) _9999-9999"
            formatChars={maskFormatChars}
            maskChar="_"
            value={customer.phone}
            onChange={handleFieldChange}
          >
            {
              () => <TextField 
                id="phone"
                name="phone" 
                label="Celular / Telefone de contato" 
                variant="filled"
                required
                fullWidth
                value={customer.phone}
                onChange={handleFieldChange}
                error={validationErrors?.phone}
                helperText={validationErrors?.phone}
              />
            }
          </InputMask>

          <TextField 
            id="email"
            name="email" 
            label="E-mail" 
            variant="filled"
            required
            fullWidth
            value={customer.email}
            onChange={handleFieldChange}
            error={validationErrors?.email}
            helperText={validationErrors?.email}
          />
          
        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>
          { JSON.stringify(customer) }
        </Box>

        <Toolbar sx={{ justifyContent: "space-around" }}>
          <Button 
            variant="contained" 
            color="secondary" 
            type="submit"
          >
            Salvar
          </Button>
          
          <Button 
            variant="outlined"
            onClick={handleBackButtonClose}
          >
            Voltar
          </Button>
        </Toolbar>
      
      </form>
    </>

    
  )
}