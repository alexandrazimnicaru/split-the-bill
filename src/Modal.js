import React, { useState, useEffect } from 'react';

import './Modal.css';

const Modal = ({ items, closeModal, clearItems }) =>  {
  const [message, updateMessage] = useState('');

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
    <section className="modal">
      <div className="modal__inner">
        <h2>Send your message to your friend</h2>

        <p>{ message }</p>

        <button
          type="button"
          className="modal__send-btn"
          onClick={sendMessage}>
          Send
        </button>
        <button
          type="button"
          className="modal__cancel-btn"
          onClick={close}>
          Cancel
        </button>
      </div>
    </section>
  )
};

export default Modal;
