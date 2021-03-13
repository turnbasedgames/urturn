import {
  Button,
  createStyles, TextField, Theme, withStyles,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createGame, GameReqBody } from '../models/game';

type Props = {
  classes: any
};
const CreateView = ({ classes }: Props) => {
  const [name, setName] = useState('Playground');
  const [desc, setDesc] = useState('This is a cool game.');
  const history = useHistory();

  return (
    <form
      className={classes.root}
      onSubmit={async (event: any) => {
        event.preventDefault();
        const gameObj: GameReqBody = {
          name,
          description: desc,
        };
        const game = await createGame(gameObj);
        history.push(`/games/${game.id}`);
      }}
    >
      <div>
        <TextField required id="standard-required" label="Name" defaultValue={name} onChange={(e) => { setName(e.target.value); }} />
        <TextField label="Description" defaultValue={desc} onChange={(e) => { setDesc(e.target.value); }} />
      </div>
      <Button
        type="submit"
        variant="contained"
        color="primary"
      >
        Create Game
      </Button>
    </form>
  );
};

const styles = (theme: Theme) => createStyles({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch',
    },
    margin: '0 auto 0 auto',
    justifyContent: 'center',
  },
});

export default withStyles(styles)(CreateView);
