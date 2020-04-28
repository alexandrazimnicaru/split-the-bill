import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';

import Modal from './Modal';

import { uuidv4 } from './utils';

import './Bill.css';

const useStyles = makeStyles(() => ({
  item: {
   display: 'flex',
   justifyContent: 'space-between',
  },
  add: {
    paddingBottom: 10,
  }
}));

const Bill = ({ output }) =>  {
  const [items, updateItems] = useState(output);
  const [checkedItems, updateCheckedtems] = useState([]);
  const [isEditing, updateIsEditing] = useState(true);
  const classes = useStyles();

  const removeItem = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    updateItems(copy);
  };

  const updateItemProp = (event, index, prop) => {
    event.preventDefault();

    const copy = [...items];
    copy[index][prop] = event.target.value;
    updateItems(copy);
  };

  const updatIsChecked = (index) => {
    const copy = [...items];
    copy[index].isChecked = !copy[index].isChecked;
    updateItems(copy);
  };

  const addItem = () => {
    updateItems([...items, {  name: '', amount: '', id: uuidv4(), isChecked: false }]);
  };

  const confirmItems = () => {
    updateIsEditing(false);
  };

  const openSendItemModal = () => {
    updateCheckedtems(items.filter(item => item.isChecked));
  };

  const closeModal = () => {
    updateCheckedtems([]);
  };

  const clearItems = () => {
    updateItems(items.filter(item => !item.isChecked));
    closeModal();
  };

  const renderItemField = (value, index, prop) => (
    <TextField
      type="text"
      className={classes[prop]}
      value={value}
      onChange={(e) => updateItemProp(e, index, prop)}
    />
  );

  const renderEditableItem = (item, index) => (
    <>
      { renderItemField(item.name, index, 'name') }
      { renderItemField(item.amount, index, 'amount') }

      <div>
        <IconButton aria-label="delete" onClick={() => removeItem(index)}>
          <DeleteIcon />
        </IconButton>
      </div>
    </>
  );

  const renderConfirmedItem = (item, index) => (
    <FormControlLabel
        control={
          <Checkbox
            checked={item.isChecked}
            onChange={(e) => updatIsChecked(index)}
            name={item.name}
            color="primary"
          />
        }
        label={`${item.name} ${item.amount}`}
      />
  );

  const renderEditableButtons = () => (
    <>
      <div className={classes.add}>
        <Fab
          aria-label="add"
          size="small"
          onClick={addItem}>
          <AddIcon />
        </Fab>
      </div>

      <Button variant="contained" color="secondary" onClick={confirmItems}>
        Confirm
      </Button>
    </>
  );

  const renderConfirmedButtons = () => (
    <Button variant="contained" color="secondary" onClick={openSendItemModal}>
      Send to friend
    </Button>
  );

  const renderItems = () => {
    if (!items.length) {
      return  <p>We couldn't read your bill</p>;
    }

    return (
      <form>
        <ul className="bill__items">
          {
            items.map((item, index) => (
              <li key={item.id} className={classes.item}>
                {
                  isEditing && renderEditableItem(item, index)
                }
                {
                  !isEditing && renderConfirmedItem(item, index)
                }
              </li>
            ))
          }
        </ul>

        {
          isEditing && renderEditableButtons()
        }
        {
          !isEditing && renderConfirmedButtons()
        }
      </form>
    );
  }

  useEffect(() => {
    updateItems(output);
  }, [output])

  if (!items) {
    return null;
  }

  return (
    <section className="bill">
      <Typography variant="h6" component="h4">
        Your bill
      </Typography>
      {
        isEditing && items.length && (
          <Typography variant="subtitle1" component="h5">
            Edit what we got wrong
          </Typography>
        )
      }
      { renderItems() }

      {
        // !!checkedItems.length && (
          <Modal
            items={checkedItems}
            closeModal={closeModal}
            clearItems={clearItems}
          />
        // )
      }
    </section>
  )
};

export default Bill;
