import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

import Bill from './Bill';

import './UploadBill.css';

const BILL_AMOUNT_FORMAT = /^\s*?\d+(\.|,\d{1,2})\s*$/;

const UploadImg = () => {
  const [img, updateImg] = useState(null);
  const [isReading, updateIsReading] = useState(false);
  const [output, updateOutput] = useState(null);
  const reader = new FileReader();

  const matchesBillAmountFormat = (text) => (
    BILL_AMOUNT_FORMAT.test(text)
  );

  const getAmountIndex = (words) => {
    let index = -1;
    words.forEach((word, i) => {
      if (matchesBillAmountFormat(word.text)) {
        index = i;
      }
    });
    return index;
  };

  const hasInfoBTWOrVAT = (words) => {
    let hasInfo = false;
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(/VAT/) || words[i].match(/BTW/)) {
        hasInfo = true;
        break;
      }
    }
    return hasInfo;
  };

  const outputItemsList = (lines) => {
    const output = [];
    lines.forEach((line) => {
      const amountIndex = getAmountIndex(line.words);
      if (amountIndex === -1) {
        return;
      }
      
      const nameWords = [ ...line.words.slice(0, amountIndex) ].map(({text}) => text);
      if (hasInfoBTWOrVAT(nameWords)) {
        return;
      }
      const name = nameWords.join(' ');
      const amount = line.words[amountIndex].text;
      output.push({ name, amount })
    });

    return output;
  };

  const readImgText = (imgToRead) => {
    updateIsReading(true);

    Tesseract.recognize(imgToRead, 'nld')
    .then(({ data: { lines } }) => {
      const output = outputItemsList(lines);
      updateIsReading(false);
      updateOutput(output);
    });
  };

  const readImgForDisplay = (file) => {
    reader.onload = () => {
      updateImg(reader.result);
      readImgText(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const loadImg = (event) => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }

    const file = event.target.files[0];
    readImgForDisplay(file);
  };

  const removeImg = () => {
    updateImg(null);
  }

  return (
    <div className="upload">
      {
        !img && (
          <>
            <label htmlFor="upload" className="upload__label">
              Upload your bill
            </label>
            <input type="file" id="upload" onChange={loadImg} />
          </>
        )
      }
      {
        img && (
          <section>
            <div className="upload__img">
              <img src={img} width="400" alt="Uploaded" />
              <button
                className="upload__remove-btn"
                onClick={removeImg}>
                  x
              </button>
            </div>
          </section>
        )
      }
      {
        isReading && <div>Please wait while we read your bill...</div>
      }
      {
        !isReading && <Bill output={output} />
      }
    </div>
  )
};

export default UploadImg;
