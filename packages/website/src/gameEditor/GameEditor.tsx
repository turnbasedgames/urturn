import {
  Button,
  Modal, Paper, Stack, TextField, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import {
  createGame, Game, GameReqBody, updateGame,
} from '../models/game';

const githubURLRegExp = /^https:\/\/(www.)?github.com\/.+\/.+\/?/;

type Props = {
  editingGame?: Game
  open: boolean
  onClose?: () => void
  onSubmit?: (game :Game) => void
};

type GameFormErrors = {
  name?: string,
  description?: string,
  githubURL?:string,
  commitSHA?:string
};

const GameEditor = ({
  open, onClose, onSubmit, editingGame,
} : Props) => {
  const emptyForm = {
    name: '',
    description: '',
    githubURL: '',
    commitSHA: '',
  };
  const [form, setForm] = useState(editingGame
    ? {
      name: editingGame.name,
      description: editingGame.description,
      githubURL: editingGame.githubURL,
      commitSHA: editingGame?.commitSHA,
    }
    : emptyForm);
  const [errors, setErrors] = useState<GameFormErrors>({});
  const titleText = editingGame ? 'Edit Game' : 'Create Game';
  const setField = (field: string, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };
  const setError = (field: string, value?: string) => {
    const newErrors: any = { ...errors };
    if (value === undefined) {
      delete newErrors[field];
    } else {
      newErrors[field] = value;
    }
    setErrors(newErrors);
  };
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (Object.keys(errors).length === 0) {
      const gameObj: GameReqBody = form;
      const game = editingGame
        ? await updateGame(editingGame.id, gameObj)
        : await createGame(gameObj);
      if (onClose) { onClose(); }
      if (onSubmit) { onSubmit(game); }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper sx={{ width: '50%', minWidth: '500px' }}>
        <Stack
          m={2}
          component="form"
          spacing={2}
          noValidate
          autoComplete="off"
        >
          <Typography gutterBottom variant="h6">{titleText}</Typography>
          <TextField
            required
            label="Name"
            value={form.name}
            onChange={({ target: { value } }) => {
              setField('name', value);
            }}
          />
          <TextField
            error={'githubURL' in errors}
            helperText={errors.githubURL}
            required
            label="GitHub Repo URL"
            value={form.githubURL}
            onChange={({ target: { value } }) => {
              if (!githubURLRegExp.test(value)) {
                setError('githubURL', 'invalid github url format');
              } else {
                setError('githubURL');
              }
              setField('githubURL', value);
            }}
          />
          <TextField
            required
            label="Commit or branch"
            value={form.commitSHA}
            onChange={({ target: { value } }) => {
              setField('commitSHA', value);
            }}
          />
          <TextField
            multiline
            rows={5}
            label="Description"
            value={form.description}
            onChange={({ target: { value } }) => {
              setField('description', value);
            }}
          />
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
          >
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingGame ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default GameEditor;
