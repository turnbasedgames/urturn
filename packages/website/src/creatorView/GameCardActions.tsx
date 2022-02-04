import {
  Button, IconButton, Menu, MenuItem, Modal, Paper, Stack, Typography,
} from '@mui/material';
import {
  GitHub as GitHubIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import React from 'react';

import GameEditor from '../gameEditor';
import { deleteGame, Game } from '../models/game';
import { UserContext } from '../models/user';

type Props = {
  onDelete?: () => void
  onUpdate?: () => void
  game: Game
};

const GameCardActions = ({ game, onDelete, onUpdate }: Props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openEditor, setOpenEditor] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <UserContext.Consumer>
      {({ user }) => {
        const ownsGame = game && user && game.creator.id === user.id;

        return (
          <>
            <GameEditor
              editingGame={game}
              open={openEditor}
              onClose={() => setOpenEditor(false)}
              onSubmit={onUpdate}
            />
            <Modal
              open={openDeleteModal}
              onClose={() => setOpenDeleteModal(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Paper>
                <Stack
                  m={2}
                >
                  <Typography gutterBottom variant="h6">{`Permanently Delete "${game.name}"?`}</Typography>
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={2}
                  >
                    <Button onClick={() => {
                      setOpenDeleteModal(false);
                    }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        await deleteGame(game.id);
                        setOpenDeleteModal(false);
                        if (onDelete) {
                          onDelete();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Modal>
            <Stack direction="row">
              <IconButton
                href={`${game.githubURL}/commit/${game.commitSHA}`}
                aria-label="github"
                rel="noreferrer"
                target="_blank"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <GitHubIcon />
              </IconButton>
              {ownsGame && (
                <IconButton
                  aria-controls="game-options-short-menu"
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  aria-label="settings"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={handleClick}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              <Menu
                id="game-options-short-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  dense
                  onClick={() => {
                    setOpenEditor(true);
                    handleClose();
                  }}
                  disableRipple
                >
                  <EditIcon />
                  <Typography sx={{ paddingLeft: 1 }}>Edit</Typography>
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setOpenDeleteModal(true);
                    handleClose();
                  }}
                  disableRipple
                >
                  <DeleteIcon />
                  <Typography sx={{ paddingLeft: 1 }}>Delete</Typography>
                </MenuItem>
              </Menu>
            </Stack>
          </>
        );
      }}
    </UserContext.Consumer>
  );
};

export default GameCardActions;
