import React, { useState, useEffect } from 'react';

import './Bill.css';

const Bill = ({ output }) =>  {
  const [items, updateItems] = useState(output);
  const [isEditing, updateIsEditing] = useState(true);

  const removeItem = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    updateItems(copy);
  }

  const updateItemProp = (event, index, prop) => {
    const copy = [...items];
    copy[index][prop] = event.target.value;
    updateItems(copy);
  }

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
      {
        items.length ? (
          <form>
            <ul className="bill__items">
              {
                items.map(({ name, amount }, index) => (
                  <li key={name} className="bill__item">
                    { renderItemProp(name, index, 'name') }
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
                    { renderItemProp(amount, index, 'amount') }
                  </li>
                ))
              }
            </ul>

            {
              isEditing && (
                <button
                  type="button"
                  className="bill__confirm-btn"
                  onClick={confirmItems}>
                    Confirm
                </button>
              )
            }
          </form>
          ) :
          <p>We couldn't read your bill</p>
      }
    </section>
  )
};

export default Bill;
