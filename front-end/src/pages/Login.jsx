import React from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

export default function Login() {

  return <>
    <Box>
      
      <Typography variant="h1" sx={{ mb: '50px' }}>
        Autentique-se
      </Typography>

      <Paper>

        <TextField
          id="email"
          name="email"
          label="E-mail"
          variant="filled"
        />

        <TextField
          id="password"
          name="password"
          type="password"
          label="Senha"
          variant="filled"
        />

      </Paper>

    </Box>
  </>
}