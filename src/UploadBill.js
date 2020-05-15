import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { createWorker, OEM } from 'tesseract.js';

import Bill from './Bill';
import Upload from './Upload';
import Image from './Image';

import { uuidv4 } from './utils';

import { TOTAL_FORMATS } from './constants';

const BILL_AMOUNT_FORMAT = /^\s*?\d+(\.|,\d{1,2})\s*$/;
const PER_ITEM_AMOUNT_FORMAT = /^\s*(\d{1,3})+\s*x|X\s*$/;

const useStyles = makeStyles((theme) => ({
  container: {
    'flex-direction': 'column-reverse',

    [theme.breakpoints.up('sm')]: {
      'flex-direction': 'row',
    },
  },
  reading: {
   textAlign: 'center',
  },
}));

const UploadImg = () => {
  const [img, updateImg] = useState(null);
  const [isReading, updateIsReading] = useState(false);
  const [output, updateOutput] = useState(null);
  const reader = new FileReader();
  const classes = useStyles();

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
        output.push({ name, amount: amountForNextLine || amount, id: uuidv4(), confirmed: true, isChecked: false });
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

  const updateCroppedImg = (base64) => {
    updateImg(base64);
    readImgText(base64);
  };

  const readImgForDisplay = (file) => {
    reader.onload = () => {
      updateImg(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeImg = () => {
    updateImg(null);
  };

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={12} sm={6}>
        {
          !img && <Upload readImgForDisplay={readImgForDisplay} />
        }
        {
          img && (
            <Image
              img={img}
              isReading={isReading}
              updateImg={updateCroppedImg}
              removeImg={removeImg} />
          )
        }
      </Grid>

      <Grid item xs={12} sm={6}>
        {
          isReading && (
            <div className={classes.reading}>
              <Typography variant="h6" component="h4">
                Reading bill
              </Typography>
              <CircularProgress color="secondary" />
            </div>
          )
        }
        {
          !isReading && <Bill output={output} />
        }
      </Grid>
    </Grid>
  )
};

export default UploadImg;
