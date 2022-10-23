import React from 'react';
import { CardMedia, SxProps } from '@mui/material';
import { Game } from '@urturn/types-common';

function CardMediaWithFallback({ game, sx }: { game: Game, sx: SxProps }): React.ReactElement {
  const parsedGithubURL = new URL(game.githubURL);
  const repoOwner = parsedGithubURL.pathname.split('/')[1];
  const repo = parsedGithubURL.pathname.split('/')[2];

  const handleImageError = (e: any): void => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80';
  };

  return (
    <CardMedia
      sx={sx}
      component="img"
      image={`https://rawcdn.githack.com/${repoOwner}/${repo}/${game.commitSHA}/thumbnail.png`}
      alt={game.name}
      onError={handleImageError}
    />
  );
}

export default CardMediaWithFallback;
