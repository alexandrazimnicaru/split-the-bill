import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '50px auto',
    padding: 20,
    maxWidth: 500,
    background: 'white',
    boxShadow: theme.shadows[5],
    borderRadius: 1,
  },
  right: {
   float: 'right',
   paddingLeft: 10,
  },
  paddingTop: {
    paddingTop: 10,
  },
}));

const SendMessage = ({ items, closeModal, clearItems }) =>  {
  const [message, updateMessage] = useState('');
  const classes = useStyles();

  const initializeMessage = () => {
    const sum = items
      .filter(item => item.isChecked)
      .map(item => parseFloat(item.amount.replace(",", ".")))
      .reduce((acc, curr) => acc + curr, 0);
    const names = items.map(item => item.name).join(", ");

    updateMessage(`Hi friend, please send me ${sum} euros for ${names}`);
  };

  const sendMessage = () => {
    if (!message) {
      return;
    }

    const endcodedMessage = window.encodeURI(message);
    window.open(`https://wa.me/?text=${endcodedMessage}`);
    clearItems();
  };

  const close = () => {
    updateMessage('');
    closeModal();
  };

  useEffect(() => {
    if (!items.length) {
      return;
    }

    initializeMessage();
  }, [items])

  if (!message) {
    return null;
  }

  return (
    <section className={classes.container}>
      <div>
        <Typography variant="h4" component="h2">
          Send a message to your friend
        </Typography>

        <Typography variant="subtitle1" component="h5" className={classes.paddingTop}>
          { message }
        </Typography>

        <div className={classes.paddingTop}>
          <Button variant="contained" color="secondary" onClick={sendMessage}>
            Send
          </Button>

          <Button variant="contained" className={classes.right} onClick={close}>
            Cancel
          </Button>
        </div>
      </div>
    </section>
  )
};

export default SendMessage;
