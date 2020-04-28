import React from 'react';

import Header from './Header';
import UploadBill from './UploadBill';

import './App.css';

function App() {
  return (
    <article>
      <Header />

      <main className="main">
        <UploadBill />
      </main>
    </article>
  );
}

export default App;
