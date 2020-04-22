import React, { useState, useEffect } from 'react';

import { uuidv4 } from './utils';

import './Bill.css';

const Bill = ({ output }) =>  {
  const [items, updateItems] = useState(output);
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

  const addItem = () => {
    updateItems([...items, {  name: '', amount: '', id: uuidv4(), confirmed: false }]);
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
  }

  const renderItemProp = (value, index, prop) => {
    if (isEditing) {
      return (
        <input
          type="text"
          className={`bill__item__${prop}`}
          value={value}
          onChange={(e) => updateItemProp(e, index, prop)}
        />
      )
    }

    return <span className={`bill__item__${prop}`}>{value}</span>
  };

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
                { renderItemProp(item.name, index, 'name') }
                {
                  isEditing && (
                    <button
                      type="button"
                      className="bill__remove-btn"
                      onClick={() => removeItem(index)}>
                        x
                    </button>
                  )
                }
                {
                  isEditing && !item.confirmed && (
                    <button
                      type="button"
                      className="bill__confirm-btn"
                      onClick={() => confirmItem(item, index)}>
                      ok
                    </button>
                  )
                }
                { renderItemProp(item.amount, index, 'amount') }
              </li>
            ))
          }
        </ul>

        {
          isEditing && (
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
          )
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
      <h2>You bill</h2>
      {
        isEditing && <h4>Edit if we got something wrong :)</h4>
      }
      { renderItems() }
    </section>
  )
};

export default Bill;
