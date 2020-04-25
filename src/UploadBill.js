import React, { useState , useEffect, useRef } from 'react';
import { createWorker, OEM } from 'tesseract.js';

import Bill from './Bill';

import { uuidv4 } from './utils';

import { TOTAL_FORMATS } from './constants';

import './UploadBill.css';

const BILL_AMOUNT_FORMAT = /^\s*?\d+(\.|,\d{1,2})\s*$/;
const PER_ITEM_AMOUNT_FORMAT = /^\s*(\d{1,3})+\s*x|X\s*$/;

const Croppie = require('croppie');
require('exif-js');

const UploadImg = () => {
  const [img, updateImg] = useState(null);
  const [isReading, updateIsReading] = useState(false);
  const [output, updateOutput] = useState(null);
  const [croppie, updateCroppie] = useState(null);
  const reader = new FileReader();
  const croppieEl = useRef(null);

  const isAmountPerItemLine = (text) => (
    PER_ITEM_AMOUNT_FORMAT.test(text)
  );

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

    let timesForNextLine = 1
    let amountForNextLine = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const amountIndex = getAmountIndex(line.words);
      if (amountIndex === -1) {
        continue; // we don't read lines without an amount
      }

      // if the line had times amount, remmeber times
      const amount = line.words[amountIndex].text;
      const nameWords = [ ...line.words.slice(0, amountIndex) ].map(({text}) => text);
      const name = nameWords.join(' ');
      if (hasTotal(name)) {
        break; // we don't read the receipt after total
      }

      // if it's line with times amount, remember times 
      if (isAmountPerItemLine(name)) {
        timesForNextLine = parseInt(name, 10);
        amountForNextLine = amount;
        continue;
      }

      for (let j = 0; j < timesForNextLine; j++) {
        output.push({ name, amount: amountForNextLine || amount, id: uuidv4(), confirmed: true });
        console.log(output);
      }
      timesForNextLine = 1;
      amountForNextLine = null
    }

    return output;
  };

  const readImgText = (imgToRead) => {
    updateIsReading(true);

    const worker = createWorker();
    
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.TESSERACT_ONLY,
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
      });
      const { data } = await worker.recognize(imgToRead);
      await worker.terminate();

      const output = outputItemsList(data.lines);
      updateIsReading(false);
      updateOutput(output);
    })();
  };

  const cropImage = () => {
    croppie.result({ type: 'base64', size: 'original' }).then((base64) => {
      updateImg(base64);
      readImgText(base64);
    });
  }

  const readImgForDisplay = (file) => {
    reader.onload = () => {
      updateImg(reader.result);
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
    if (!croppieEl.current || !img) {
      return;
    }

    // once an image was cropped,
    // show cropped image without croppie
    if (croppie) {
      croppie.destroy();
      updateCroppie(null);
    } else {
      updateCroppie(new Croppie(croppieEl.current, {
        enableExif: true,
        enableResize: true,
        viewport: { width: 150, height: 200 },
        showZoomer: false,
        enableOrientation: true,
      }));
    }
  }, [croppieEl, img]);

  return (
    <div className="upload">
      <div className="upload__section">
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
              <div>
                <div className="upload__img-wrapper">
                  <img className="upload__img" ref={croppieEl} src={img} alt="Upload" />
                </div>

                {
                  croppie && (
                    <button
                      className="upload__crop-btn"
                      onClick={cropImage}>
                      Crop
                    </button>
                  )
                }
                
                {
                  !isReading && (
                    <button
                      className="upload__remove-btn"
                      onClick={removeImg}>
                        Remove
                    </button>
                  )
                }
              </div>
            </section>
          )
        }
      </div>

      <div className="upload__section">
        {
          isReading && <div>Please wait while we read your bill...</div>
        }
        {
          !isReading && <Bill output={output} />
        }
      </div>
    </div>
  )
};

export default UploadImg;

// const outputItemsList = (lines) => {
//   const output = [];

//   let timesForNextLine = 1;
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];
//     console.log(line);

//     const amountIndex = getAmountIndex(line.words);
//     if (amountIndex === -1) {
//       continue; // we don't read lines without an amount
//     }

//     // if the line had times amount, remmeber times

//     const nameWords = [ ...line.words.slice(0, amountIndex) ].map(({text}) => text);
//     const name = nameWords.join(' ');
//     if (hasTotal(name)) {
//       break; // we don't read the receipt after total
//     }

//     // if it's line with times amount, remember times 
//     // if (isAmountPerItemLine(name)) {
//     //   timesForNextLine = parseInt(name, 10);
//     //   continue;
//     // } else {
//     //   timesForNextLine = 1; 
//     // }

//     const amount = line.words[amountIndex].text;
//     console.log(timesForNextLine, new Array(timesForNextLine));
//     output.push({ name, amount, id: uuidv4(), confirmed: true });
//   }