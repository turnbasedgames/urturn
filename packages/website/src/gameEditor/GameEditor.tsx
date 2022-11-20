import {
  Button,
  Modal, Paper, Stack, TextField, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Game } from '@urturn/types-common';

import { useSnackbar } from 'notistack';
import logger from '../logger';
import {
  createGame, GameReqBody, updateGame,
} from '../models/game';

const githubURLRegExp = /^https:\/\/(www.)?github.com\/.+\/.+\/?/;

interface Props {
  editingGame?: Game
  open: boolean
  onClose?: () => void
  onSubmit?: (game: Game) => void
}

function GameEditor({
  open, onClose, onSubmit, editingGame,
}: Props): React.ReactElement {
  const emptyForm = {
    name: '',
    description: '',
    githubURL: '',
    commitSHA: '',
  };
  const [form, setForm] = useState((editingGame != null)
    ? {
      name: editingGame.name,
      description: editingGame.description,
      githubURL: editingGame.githubURL,
      commitSHA: editingGame?.commitSHA,
    }
    : emptyForm);
  const [errors, setErrors] = useState(new Map());
  const { enqueueSnackbar } = useSnackbar();

  const titleText = (editingGame != null) ? 'Edit Game' : 'Create Game';
  const setField = (field: string, value: string): void => {
    setForm({
      ...form,
      [field]: value,
    });
  };
  const setError = (field: string, value?: string): void => {
    if (value === undefined) {
      errors.delete(field);
    } else {
      errors.set(field, value);
    }
    setErrors(errors);
  };
  const handleSubmit = async (): Promise<void> => {
    try {
      if (errors.size === 0) {
        const gameObj: GameReqBody = form;
        const game = (editingGame != null)
          ? await updateGame(editingGame.id, gameObj)
          : await createGame(gameObj);
        if (onClose != null) { onClose(); }
        if (onSubmit != null) { onSubmit(game); }
      }
    } catch (e: any) {
      logger.error(e);
      enqueueSnackbar(`Error when ${(editingGame != null) ? 'editing' : 'creating'} game`, {
        variant: 'error',
        autoHideDuration: 3000,
      });
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
          autoComplete="off"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit}
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
            error={errors.has('githubURL')}
            helperText={errors.get('githubURL')}
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
            label="Commit SHA (e.g. cd7614c90db0e9c4d2c99800da9c0bdd107bc7fa)"
            value={form.commitSHA}
            onChange={({ target: { value } }) => {
              setField('commitSHA', value);
            }}
          />
          <TextField
            required
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
            <Button
              type="submit"
              variant="contained"
            >
              {(editingGame != null) ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
}

export default GameEditor;
