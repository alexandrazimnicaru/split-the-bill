import React from 'react';

import UploadBill from './UploadBill';

import './App.css';

function App() {
  return (
    <article>
      <header className="header">
        Split the Bill
      </header>

      <main className="main">
        <UploadBill />
      </main>
    </article>
  );
}

export default App;
