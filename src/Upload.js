import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
  },
  input: {
    fontSize: '100px',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
    cursor: 'pointer',
  }
}));

const Upload = ({ readImgForDisplay }) => {
  const classes = useStyles();

  const loadImg = (event) => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }

    const file = event.target.files[0];
    readImgForDisplay(file);
  };

  return (
    <form>
      <label htmlFor="upload">
        <Typography variant="h6" component="h4">
          Upload your bill
        </Typography>
      </label>

      <div className={classes.wrapper}>
        <Button variant="contained" color="secondary">
          Choose file
        </Button>
    
        <input
          id="upload"
          className={classes.input}
          type="file"
          name="upload"
          onChange={loadImg} />  
      </div>
    </form>
  );
};

export default Upload;
