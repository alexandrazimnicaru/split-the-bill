import React, { useState, useEffect } from 'react';

import Modal from './Modal';

import { uuidv4 } from './utils';

import './Bill.css';

const Bill = ({ output }) =>  {
  const [items, updateItems] = useState(output);
  const [checkedItems, updateCheckedtems] = useState([]);
  const [isEditing, updateIsEditing] = useState(true);

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
    updateItems([...items, {  name: '', amount: '', id: uuidv4(), confirmed: false, isChecked: false }]);
  };

  const confirmItem = (item, index) => {
    if (!item.name || !item.amount) {
      return;
    }
    const copy = [...items];
    copy.splice(index, 1, { ...item, confirmed: true });
    updateItems(copy);
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
    <input
      type="text"
      className={`bill__item__${prop}`}
      value={value}
      onChange={(e) => updateItemProp(e, index, prop)}
    />
  );

  const renderEditableItem = (item, index) => (
    <>
      { renderItemField(item.name, index, 'name') }
      <button
        type="button"
        className="bill__remove-btn"
        onClick={() => removeItem(index)}>
          x
      </button>
      {
        !item.confirmed && (
          <button
            type="button"
            className="bill__confirm-btn"
            onClick={() => confirmItem(item, index)}>
            ok
          </button>
        )
      }
      { renderItemField(item.amount, index, 'amount') }
    </>
  );

  const renderConfirmedItem = (item, index) => (
    <>
      <input
        type="checkbox"
        className="bill__item__checkbox"
        value={item.isChecked}
        onChange={(e) => updatIsChecked(index)}
      />
      <span className={`bill__item__name`}>{item.name}</span>
      <span className={`bill__item__amount`}>{item.amount}</span>
    </>
  );

  const renderEditableButtons = () => (
    <>
      <button
        type="button"
        className="bill__add-btn"
        onClick={addItem}>
          Add item
      </button>

      <button
        type="button"
        className="bill__confirm-btn"
        onClick={confirmItems}>
          Confirm
      </button>
    </>
  );

  const renderConfirmedButtons = () => (
    <button
      type="button"
      className="bill__send-btn"
      onClick={openSendItemModal}>
      Send to friend
    </button>
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
              <li key={item.id} className="bill__item">
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
      <h2>Your bill</h2>
      {
        isEditing && items.length && <h4>Edit if we got something wrong :)</h4>
      }
      { renderItems() }

      {
        !!checkedItems.length && (
          <Modal
            items={checkedItems}
            closeModal={closeModal}
            clearItems={clearItems}
          />
        )
      }
    </section>
  )
};

export default Bill;
