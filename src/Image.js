import React, { useRef, useState , useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import Close from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const Croppie = require('croppie');
require('exif-js');

const useStyles = makeStyles(() => ({
  wrapper: {
    position: 'relative',
    paddingTop: 10,
    width: 400,
    height: 400,
    maxWidth: '100%',
    margin: '0 auto',
  },
  close: {
    top: -10,
    right: -10,
    position: 'absolute',
    zIndex: 2,
  }
}));

const Image = ({ img, isReading, updateImg, removeImg }) => {
  const classes = useStyles();
  const croppieEl = useRef();
  const [croppie, updateCroppie] = useState(null);

  const cropImg = () => {
    croppie.result({ type: 'base64', size: 'original' }).then(updateImg);
  };

  useEffect(() => {
    if (!croppieEl.current || !img) {
      return;
    }

    // once an image was cropped, show it without croppie
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
    <form>
      <Typography variant="h6" component="h4">
        { croppie && 'Crop the list of items' }
        { !croppie && 'Items' }
      </Typography>

      <div>
        {
          croppie && (
            <Button variant="contained" color="secondary" onClick={cropImg}>
              Crop
            </Button>
          )
        }             
      </div>

      <div className={classes.wrapper}>
        <img ref={croppieEl} src={img} alt="Upload" width="100%" />

        {
          !isReading && (
            <Fab
              className={classes.close}
              color="secondary"
              aria-label="remove image"
              size="small"
              onClick={removeImg}>
              <Close />
            </Fab>
          )
        }
      </div>
    </form>
  );
};

export default Image;
