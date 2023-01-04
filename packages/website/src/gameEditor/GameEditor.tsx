import {
  Button,
  Modal, Paper, Stack, TextField, Typography, InputAdornment,
} from '@mui/material';
import React, { useState } from 'react';
import { Game } from '@urturn/types-common';
import { Octokit } from 'octokit';
import { RequestError } from '@octokit/request-error';
import { useSnackbar } from 'notistack';
import { StatusCodes } from 'http-status-codes';
import logger from '../logger';
import {
  createGame, GameReqBody, updateGame,
} from '../models/game';

const octokit = new Octokit();
const githubURLRegExp = /^https:\/\/(www.)?github.com\/.+\/.+\/?/;
const customURLRegExp = /^[-0-9a-z]+$/;

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
    customURL: '',
  };
  const [form, setForm] = useState((editingGame != null)
    ? {
      name: editingGame.name,
      description: editingGame.description,
      githubURL: editingGame.githubURL,
      commitSHA: editingGame.commitSHA,
      customURL: editingGame.customURL,
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
    if (errors.size === 0) {
      // Before trying to create a game with UrTurn API, we should do basic validation for the build
      // artifict being used. This logic lives in the UI to avoid running into the GitHub REST API
      // rate limits in our integration tests and in production.
      const { commitSHA, githubURL: rawGitHubURL } = form;
      const githubURL = new URL(rawGitHubURL);
      const pathMatchResults = githubURL.pathname.match(/[^/]+/g);

      // This should never happen because githubURL was validated before. We check this to avoid the
      // typescript/linting errors
      if (pathMatchResults == null) {
        throw new Error('Unexpected error when trying to parse the GitHub owner and repo out of the github url!');
      }

      const owner = pathMatchResults[0];
      const repo = pathMatchResults[1];
      // make sure the github repo exists
      try {
        await octokit.rest.repos.get({ owner, repo });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === StatusCodes.NOT_FOUND) {
            enqueueSnackbar('GitHub repo does not exist! Make sure the repo is public!', {
              variant: 'error',
              autoHideDuration: null,
            });
          } else {
            enqueueSnackbar(`Unexpected error while checking GitHub repo: ${error.message}`, {
              variant: 'error',
              autoHideDuration: null,
            });
          }
        } else {
          throw error;
        }
        return;
      }

      // make sure commitSHA or branch name exists
      try {
        await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commitSHA, // commitSHA may also be a git branch name
        });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === StatusCodes.NOT_FOUND) {
            enqueueSnackbar('GitHub commit does not exist!', {
              variant: 'error',
              autoHideDuration: null,
            });
          } else if (error.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              autoHideDuration: null,
            });
          } else {
            enqueueSnackbar(`Unexpected error while checking GitHub commit: ${error.message}`, {
              variant: 'error',
              autoHideDuration: null,
            });
          }
        } else {
          throw error;
        }
        return;
      }

      // make sure index.js file exists
      try {
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'index.js',
          ref: commitSHA,
        });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === StatusCodes.NOT_FOUND) {
            enqueueSnackbar('Could not find index.js file! Are you using the published branch?', {
              variant: 'error',
              autoHideDuration: null,
            });
          } else if (error.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              autoHideDuration: null,
            });
          } else {
            enqueueSnackbar(`Unexpected error when checking index.js file: ${error.message}`, {
              variant: 'error',
              autoHideDuration: null,
            });
          }
        } else {
          throw error;
        }
        return;
      }

      // make sure frontend/build/index.html file exists
      try {
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'frontend/build/index.html',
          ref: commitSHA,
        });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === StatusCodes.NOT_FOUND) {
            enqueueSnackbar('Could not find frontend/build/index.html file! Are you properly building the frontend in your GitHub Actions?', {
              variant: 'error',
              autoHideDuration: null,
            });
          } else if (error.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              autoHideDuration: null,
            });
          } else {
            enqueueSnackbar(`Unexpected error when checking frontend/build/index.html file: ${error.message}`, {
              variant: 'error',
              autoHideDuration: null,
            });
          }
        } else {
          throw error;
        }
        return;
      }

      const gameObj: GameReqBody = form;
      const game = (editingGame != null)
        ? await updateGame(editingGame.id, gameObj)
        : await createGame(gameObj);
      enqueueSnackbar(`Successfully ${(editingGame != null) ? 'edited' : 'created'} the game`, {
        variant: 'success',
        autoHideDuration: 3000,
      });
      if (onClose != null) { onClose(); }
      if (onSubmit != null) { onSubmit(game); }
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
          // https://github.com/typescript-eslint/typescript-eslint/issues/4619
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit().catch((error) => {
              logger.error(error);
              enqueueSnackbar(`Error when ${(editingGame != null) ? 'editing' : 'creating'} game`, {
                variant: 'error',
                autoHideDuration: null,
              });
            });
            return false;
          }}
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
            error={errors.has('customURL')}
            helperText={errors.get('customURL')}
            label="Custom URL (e.g. urturn-game)"
            value={form.customURL}
            InputProps={{
              startAdornment: <InputAdornment position="start">www.urturn.app/play/</InputAdornment>,
            }}
            onChange={({ target: { value } }) => {
              if (!customURLRegExp.test(value)) {
                setError('customURL', 'invalid custom url format (only alphanumeric and "-" allowed)');
              } else {
                setError('customURL');
              }
              setField('customURL', value);
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
