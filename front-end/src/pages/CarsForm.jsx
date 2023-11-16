import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import myfetch from '../utils/myfetch';
import Waiting from '../components/ui/Waiting';
import Notification from '../components/ui/Notification';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import InputMask from 'react-input-mask';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptLocale from 'date-fns/locale/pt-BR';
import { parseISO } from 'date-fns';
import { FormControlLabel, Switch } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Car from '../models/car';
import { ZodError } from 'zod';

export default function CarForm() {
  const navigate = useNavigate();
  const params = useParams();

  // Valores padrão para um novo carro
  const carDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_price: undefined,
    customer_id: '',
  };

  // Estado inicial do componente
  const [state, setState] = React.useState({
    car: carDefaults,
    customers: [],
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: '',
    },
    openDialog: false,
    isFormModified: false,
    validationErrors: {},
  });

  // Destruturação do estado para facilitar o acesso aos valores
  const {
    car,
    customers,
    showWaiting,
    notification,
    openDialog,
    isFormModified,
    validationErrors,
  } = state;

  // Máscara para formatar a entrada do usuário
  const maskFormChars = {
    '9': '[0-9]',
    'A': '[A-Za-z]',
    '*': '[A-Za-z0-9]',
    '@': '[A-Ja-j0-9]', // Aceita letras de A a J (maiúsculas ou minúsculas) e dígitos
    '_': '[\\s0-9]', // Aceita espaços e dígitos
  };

  // Lista de anos para seleção no formulário
  const years = [];

  // Preenche a lista de anos, do mais recente ao mais antigo
  for (let year = 2023; year >= 1940; year--) years.push(year);

  // Efeito colateral para carregar dados ao carregar o componente
  React.useEffect(() => {
    fetchData(params.id); // Chama a função para carregar dados quando o componente é montado
  }, []); // Vetor de dependências vazio indica que o efeito só ocorre uma vez

  // Função assíncrona para buscar dados do carro e clientes
  async function fetchData(isUpdating) {
    setState({ ...state, showWaiting: true }); // Exibe o backdrop para indicar uma operação em segundo plano
    try {
      let car = carDefaults;

      // Se estivermos no modo de atualização, carregamos o registro indicado no parâmetro da rota
      if (isUpdating) {
        car = await myfetch.get(`car/${params.id}`);
        car.selling_date = parseISO(car.selling_date);
      }

      // Busca a listagem de clientes para preencher o componente de escolha
      let customers = await myfetch.get('customer');

      // Adiciona um cliente "fake" que permite não selecionar nenhum cliente
      customers.unshift({ id: null, name: '(Nenhum cliente)' });

      setState({ ...state, showWaiting: false, car, customers });
    } catch (error) {
      setState({
        ...state,
        showWaiting: false,
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message,
        },
      });
    }
  }

  // Função para lidar com mudanças nos campos do formulário
  function handleFieldChange(event) {
    const newCar = { ...car };

    // Lida com casos específicos, como campos de switch e number
    if (event.target.name === 'imported') {
      newCar[event.target.name] = event.target.checked;
    } else if (event.target.name === 'selling_price') {
      console.log(event.target.valueAsNumber);
      newCar[event.target.name] = event.target.valueAsNumber;
    } else {
      newCar[event.target.name] = event.target.value;
    }

    setState({
      ...state,
      car: newCar,
      isFormModified: true, // O formulário foi alterado
    });
  }

  // Função para lidar com o envio do formulário
  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }); // Exibe o backdrop
    event.preventDefault(false); // Evita o recarregamento da página

    try {
      Car.parse(car); // Validação utilizando a biblioteca Zod
      let result;

      // Se o carro já possui um ID, faz uma requisição PUT para atualizar
      if (car.id) result = await myfetch.put(`car/${car.id}`, car);
      // Senão, faz uma requisição POST para criar um novo
      else result = await myfetch.post('car', car);

      setState({
        ...state,
        showWaiting: false,
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.',
          validationErrors: {},
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error);

        // Preenche o estado validationError para exibir os erros para o usuário
        let valErrors = {};
        for (let e of error.issues) valErrors[e.path[0]] = e.message;

        setState({
          ...state,
          validationErrors: valErrors,
          showWaiting: false,
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: há campos inválidos no formulário.',
          },
        });
      } else {
        setState({
          ...state,
          showWaiting: false,
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: ' + error.message,
            validationErrors: {},
          },
        });
      }
    }
  }

  // Função para lidar com o fechamento da notificação
  function handleNotificationClose() {
    const status = notification.severity;

    // Fecha a barra de notificação
    setState({
      ...state,
      notification: {
        show: false,
        severity: status,
        message: '',
      },
    });

    // Volta para a página de listagem se a ação foi bem-sucedida
    if (status === 'success') navigate('..', { relative: 'path' });
  }

  // Função para lidar com o botão de voltar
  function handleBackButtonClose(event) {
    // Se o formulário tiver sido modificado, abre a caixa de diálogo
    // para perguntar se quer mesmo voltar, perdendo as alterações
    if (isFormModified) setState({ ...state, openDialog: true });
    // Senão, volta à página de listagem
    else navigate('..', { relative: 'path' });
  }

  // Função para lidar com o fechamento da caixa de diálogo
  function handleDialogClose(answer) {
    // Fecha a caixa de diálogo
    setState({ ...state, openDialog: false });

    // Se o usuário quiser voltar à página de listagem mesmo com alterações pendentes, faz a vontade dele
    if (answer) navigate('..', { relative: 'path' });
  }

  return (
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
            error={validationErrors?.brand}
            helperText={validationErrors?.brand}
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
            error={validationErrors?.model}
            helperText={validationErrors?.model}
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
            error={validationErrors?.color}
            helperText={validationErrors?.color}
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
            value={car.year_manufacture}
            error={validationErrors?.year_manufacture}
            helperText={validationErrors?.year_manufacture}
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
            sx={{ justifyContent: 'start' }}
            onChange={handleFieldChange}
            control={<Switch defaultChecked />}
            label="Importado"
            id="imported"
            name="imported"
            labelPlacement="start"
            checked={car.imported}
            error={validationErrors?.imported}
            helperText={validationErrors?.imported}
          />

          <InputMask
            formatChars={maskFormChars}
            mask="AAA-9@99"
            value={car.plates.toUpperCase()} /* Placas em maiúsculas */
            onChange={handleFieldChange}
            maskChar=" "
          >
            {() => (
              <TextField
                id="plates"
                name="plates"
                label="Placa"
                variant="filled"
                required
                fullWidth
                error={validationErrors?.plates}
                helperText={validationErrors?.plates}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            )}
          </InputMask>

          <TextField
            id="selling_price"
            name="selling_price"
            label="Preço de venda"
            variant="filled"
            fullWidth
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            value={car.selling_price}
            error={validationErrors?.selling_price}
            helperText={validationErrors?.selling_price}
            onChange={handleFieldChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
            <DatePicker
              label="Data de venda"
              value={car.selling_date}
              onChange={(value) => handleFieldChange({ target: { name: 'selling_date', value } })}
              slotProps={{
                textField: {
                  variant: 'filled',
                  fullWidth: true,
                  error: validationErrors?.selling_date,
                  helperText: validationErrors?.selling_date,
                },
              }}
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
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>{JSON.stringify(car)}</Box>

        <Toolbar sx={{ justifyContent: 'space-around' }}>
          <Button variant="contained" color="secondary" type="submit">
            Salvar
          </Button>

          <Button variant="outlined" onClick={handleBackButtonClose}>
            Voltar
          </Button>
        </Toolbar>
      </form>
    </>
  );
}
