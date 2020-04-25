import React, { useState , useEffect } from 'react';
import Tesseract from 'tesseract.js';

import Bill from './Bill';

import { uuidv4 } from './utils';

import { MOCK_LINES, TOTAL_FORMATS } from './constants';

import './UploadBill.css';

const BILL_AMOUNT_FORMAT = /^\s*?\d+(\.|,\d{1,2})\s*$/;

const UploadImg = () => {
  const [img, updateImg] = useState(null);
  const [isReading, updateIsReading] = useState(false);
  const [output, updateOutput] = useState(null);
  const reader = new FileReader();

  const hasTotal = (words) => {
    const uppercased =words.toUpperCase();
    let hasTotalStr = false;
    for (let i = 0; i < TOTAL_FORMATS.length; i++) {
      if (uppercased.match(TOTAL_FORMATS[i])) {
        hasTotalStr = true;
        break;
      }
    }
    return hasTotalStr;
  };

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

  const outputItemsList = (lines) => {
    const output = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const amountIndex = getAmountIndex(line.words);
      if (amountIndex === -1) {
        continue; // we don't read lines without an amount
      }
      
      const nameWords = [ ...line.words.slice(0, amountIndex) ].map(({text}) => text);
      const name = nameWords.join(' ');
      console.log(name, hasTotal(name));
      if (hasTotal(name)) {
        break; // we don't read the receipt after total
      }

      const amount = line.words[amountIndex].text;
      output.push({ name, amount, id: uuidv4(), confirmed: true })
    }

    return output;
  };

  const readImgText = (imgToRead) => {
    updateIsReading(true);

    Tesseract.recognize(
      imgToRead,
      'eng+nld',
      { logger: m => console.log(m) }
    )
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
  };

  useEffect(() => {
    updateOutput(outputItemsList(MOCK_LINES));
  }, []);

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
