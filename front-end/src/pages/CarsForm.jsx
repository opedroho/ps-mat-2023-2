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
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import ptLocale from 'date-fns/locale/pt-BR'
import { parseISO } from 'date-fns'
import { FormControlLabel, Switch } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'

export default function CarForm() {

  const navigate = useNavigate()
  const params = useParams()

  const carDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_price: '',
    customer_id: ''
  }

  const [state, setState] = React.useState({
    car: carDefaults, 
    customers: [],   
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
    openDialog: false,
    isFormModified: false
  })

  const {
    car,
    customers,
    showWaiting,
    notification,
    openDialog,
    isFormModified
  } = state
  
  const maskFormChars = {
    '9': '[0-9]',
    'A': '[A-Za-z]',
    '*': '[A-Za-z0-9]',
    '@': '[A-Ja-j0-9]', // Aceita letras de A a J (maiúsculas ou minúsculas) e dígitos
    '_': '[\s0-9]'
  }
  
  const years = []

  // Anos, do mais recente ao mais antigo
  for(let year = 2023; year >= 1940; year--) years.push(year)

  // useEffect com vetor de dependências vazio. Será executado
  // uma vez, quando o componente for carregado
  React.useEffect(() => {
    // Verifica se existe o parâmetro id na rota.
    // Caso exista, chama a função fetchData() para carregar
    // os dados indicados pelo parâmetro para edição
    fetchData(params.id)
  }, [])

  async function fetchData(isUpdating) {
    // Exibe o backdrop para indicar que uma operação está ocorrendo
    // em segundo plano
    setState({ ...state, showWaiting: true })
    try {

      let car = carDefaults

      // Se estivermos no modo de atualização, devemos carregar o
      // registro indicado no parâmetro da rota 
      if(isUpdating) {
        car = await myfetch.get(`car/${params.id}`)
        car.selling_date = parseISO(car.selling_date)
      }

      // Busca a listagem de clientes para preencher o componente
      // de escolha
      let customers = await myfetch.get('customer')

      // Cria um cliente "fake" que permite não selecionar nenhum
      // cliente
      customers.unshift({id: null, name: '(Nenhum cliente)'})

      setState({ ...state, showWaiting: false, car, customers })

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
    const newCar = { ...car }
    
    if (event.target.name === 'imported'){
      newCar[event.target.name] = event.target.checked
    } else {
      newCar[event.target.name] = event.target.value
    }

    setState({ 
      ...state, 
      car: newCar,
      isFormModified: true      // O formulário foi alterado
    })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
  
    try {
      let result 
      // se id então put para atualizar
      if(car.id) result = await myfetch.put(`car/${car.id}`, car)
      //senão post para criar novo 
      else result = await myfetch.post('car', car)
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

    // Se o usuário tiver respondido quer quer voltar à página
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
        Cadastro de carros
      </Typography>

      <form onSubmit={handleFormSubmit}>

        <Box className="form-fields">
        
          <TextField 
            id="brand"
            name="brand" 
            label="Marca" 
            variant="filled"
            required
            fullWidth
            value={car.brand}
            onChange={handleFieldChange}
            autoFocus
          />

          <TextField 
            id="model"
            name="model" 
            label="Modelo" 
            variant="filled"
            required
            fullWidth
            placeholder="Ex.: Rua Principal"
            value={car.model}
            onChange={handleFieldChange}
          />

          <TextField 
            id="color"
            name="color" 
            label="Cor" 
            variant="filled"
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
          />

          <TextField
            id="year_manufacture"
            name="year_manufacture" 
            label="Ano de fabricação"
            select
            defaultValue=""
            fullWidth
            variant="filled"
            helperText="Selecione o ano"
            value={car.year_manufacture}
            onChange={handleFieldChange}
          >
            {years.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel 
            className="MuiFormControl-root"
            sx={{ justifyContent: "start" }}
            onChange={handleFieldChange} 
            control={<Switch defaultChecked />} 
            label="Importado" 
            id="imported" 
            name="imported" 
            labelPlacement="start" 
            checked={car.imported}
          />

          <InputMask
            formatChars={maskFormChars}
            mask="AAA-9@99"
            value={car.plates.toUpperCase() /* Placas em maiúsculas */ }
            onChange={handleFieldChange}
            maskChar=" "
          >
            {
              () =>
              <TextField 
                id="plates"
                name="plates" 
                label="Placa" 
                variant="filled"
                required
                fullWidth
                inputProps={{style: {textTransform: 'uppercase'}}}
              />
            }
          </InputMask>

          <TextField 
            id="selling_price"
            name="selling_price" 
            label="Preço de venda" 
            variant="filled"
            fullWidth
            type="number"
            InputProps={{ 
              startAdornment: <InputAdornment position="start">R$</InputAdornment>
            }}         
            value={car.selling_price}
            onChange={handleFieldChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
            <DatePicker
              label="Data de venda"
              value={car.selling_date}
              onChange={ value => 
                handleFieldChange({ target: { name: 'selling_date', value } }) 
              }
              slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
            />
          </LocalizationProvider>

          <TextField
            id="customer_id"
            name="customer_id" 
            label="Cliente adquirente"
            select
            defaultValue=""
            fullWidth
            variant="filled"
            helperText="Selecione o cliente"
            value={car.customer_id}
            onChange={handleFieldChange}
          >
            {customers.map(customer => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </TextField>
          
        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>
          { JSON.stringify(car) }
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