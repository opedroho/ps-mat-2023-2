import React from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns'
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import myfetch from '../utils/myfetch'
import Notification from '../components/ui/Notification'
import Waiting from '../components/ui/Waiting'

export default function CarsList() {

  const [state, setState] = React.useState({
    cars: {},
    openDialog: false,
    deleteId: null,
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    }
  })

  // Desestruturando as variáveis de estado
  const {
    cars,
    openDialog,
    deleteId,
    showWaiting,
    notification
  } = state

  // Este useEffect() será executado apenas uma vez, durante o
  // carregamento da página
  React.useEffect(() => {
    loadData()    // Carrega dos dados do back-end
  }, [])

  async function loadData(afterDeletion = false) {
    // Exibe a tela de espera
    setState({ ...state, showWaiting: true, openDialog: false })
    try {
      const result = await myfetch.get('car?related=1')

      let notif = {
        show: false,
        severity: 'success',
        message: ''
      }

      if(afterDeletion) notif = {
        show: true,
        severity: 'success',
        message: 'Exclusão efetuada com sucesso.'
      }

      setState({
        ...state, 
        cars: result, 
        showWaiting: false,
        openDialog: false,
        notification: notif
      })
    }
    catch(error) {
      setState({
        ...state,
        showWaiting: false,
        openDialog: false,
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        }
      })
      // Exibimos o erro no console
      console.error(error)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'brand',
      headerName: 'Marca',
      width: 150
    },
    {
      field: 'model',
      headerName: 'Modelo',
      align: 'left',
      headerAlign: 'left',
      width: 150
    },
    {
      field: 'color',
      headerName: 'Cor',
      align: 'left',
      headerAlign: 'left',
      width: 150
    },
    {
      field: 'year_manufacture',
      headerName: 'Ano fabricação',
      width: 200
    },
    {
      field: 'imported',
      headerName: 'Ano fabricação',
      width: 200,
      valueFormatter: params => {
        if(params.value === true)  return 'Sim'
        return 'Não'
      }
    },
    {
      field: 'plates',
      headerName: 'Placa',
      width: 200
    },
    {
      field: 'selling_price',
      headerName: 'Valor venda',
      headerAlign: 'right',
      align: 'right',
      width: 200,
      valueFormatter: params => {
        if(params.value) return Number(params.value).toLocaleString(
          'pt-BR',  // Português do Brasil
          { style: 'currency', currency: 'BRL' }   // Moeda: real brasileiro
        )
        else return ''
      }
    },
    {
      field: 'selling_date',
      headerName: 'Data venda',
      align: 'left',
      headerAlign: 'left',
      width: 100,
      valueFormatter: params => {
        if(params.value) return format(new Date(params.value), 'dd/MM/yyyy')
        else return ''
      }
    },
    {
      field: 'customer_id',
      headerName: 'Cliente adquirente',
      width: 250,
      valueGetter: params => {
        return params.row?.customer?.name
      }
    },
    {
      field: 'edit',
      headerName: 'Editar',
      headerAlign: 'left',
      align: 'left',
      width: 90,
      renderCell: params =>
        <Link to={'./' + params.id}>
          <IconButton aria-label="Editar">
            <EditIcon />
          </IconButton>
        </Link> 
    },
    {
      field: 'delete',
      headerName: 'Excluir',
      headerAlign: 'left',
      align: 'left',
      width: 90,
      renderCell: params =>
        <IconButton 
          aria-label="Excluir"
          onClick={() => handleDeleteButtonClick(params.id)}
        >
          <DeleteForeverIcon color="error" />
        </IconButton>
    }
  ];

  function handleDeleteButtonClick(id) {
    setState({ ...state, deleteId: id, openDialog: true })
  }

  async function handleDialogClose(answer) {
    // Fecha a caixa de diálogo de confirmação
    setState({ ...state, openDialog: false })

    if(answer) {
      try {
        // Faz a chamada ao back-end para excluir o cliente
        await myfetch.delete(`car/${deleteId}`)
        
        // Se a exclusão tiver sido feita com sucesso, atualiza a listagem
        loadData(true)
      }
      catch(error) {
        setState({
          ...state,
          showWaiting: false,
          openDialog: false,
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: ' + error.message
          }
        })
        console.error(error)
      }
    }
  }

  function handleNotificationClose() {
    setState({...state, notification: { 
      show: false,
      severity: 'success',
      message: ''
    }});
  }
  
  return (
    <>

      <ConfirmDialog
        title="Confirmar operação"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Deseja realmente excluir este item?
      </ConfirmDialog>

      <Waiting show={showWaiting} />

      <Notification
        show={notification.show}
        severity={notification.severity}
        message={notification.message}
        onClose={handleNotificationClose}
      />

      <Typography variant="h1" sx={{ mb: '50px' }}>
        Listagem de carros
      </Typography>

      <Box sx={{
        display: 'flex',
        justifyContent: 'right',
        mb: '25px'  // margin-bottom
      }}>
        <Link to="new">
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            startIcon={<AddBoxIcon />}
          >
            Cadastrar novo carro
          </Button>
        </Link>
      </Box>

      <Paper elevation={4} sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={cars}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </>
  )
}