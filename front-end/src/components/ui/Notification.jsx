import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification({
    show = false, 
    message, 
    severity = 'success',
    timeout = 4000,
    onClose
}) {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if(typeof onClose === 'function') onClose(event, reason)
  };

  return (
    <Snackbar open={show} autoHideDuration={timeout} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        { message }
      </Alert>
    </Snackbar>
  );
}