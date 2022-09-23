import {
  Button, LinearProgress, Stack, Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import GameEditor from '../gameEditor'
import DevGameCard from './DevGameCard'
import { Game, getGames } from '../models/game'
import { User } from '../models/user'
import withUser from '../withUser'

interface Props {
  user: User
}

const CreatorView = ({ user }: Props) => {
  const [games, setGames] = useState<Game[] | null>(null)
  const gamesLoading = games == null
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const history = useHistory()
  const setupGames = async () => {
    const gamesRaw = await getGames({ creator: user.id })
    setGames(gamesRaw)
  }
  useEffect(() => {
    setupGames()
  }, [])

  return (
    <Stack direction="column">
      <LinearProgress sx={{
        position: 'relative',
        visibility: gamesLoading ? 'visible' : 'hidden'
      }}
      />
      <GameEditor
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(game) => { history.push(`/games/${game.id}`) }}
      />
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
      >
        <Stack
          direction="column"
          spacing={1}
          m={2}
          justifyContent="flex-start"
        >
          <Typography
            variant="h5"
            color="text.primary"
          >
            Developer Resources
          </Typography>
          <Button
            href="https://docs.urturn.app/"
            variant="outlined"
            target="_blank"
          >
            API Reference
          </Button>
          <Button
            variant="outlined"
            href="https://discord.gg/myWacjdb5S"
            target="_blank"
          >
            Discord
          </Button>
        </Stack>
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          spacing={1}
          m={2}
          width="70%"
          minWidth="400px"
          maxWidth="500px"
        >
          <Button
            sx={{ width: '100%' }}
            variant="contained"
            onClick={() => setOpenCreate(true)}
          >
            Create Game
          </Button>
          {(games != null) && games.map((game) => (
            <DevGameCard
              onUpdate={setupGames}
              onDelete={setupGames}
              key={`DevGameCard-${game.id}`}
              game={game}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default withUser(CreatorView, { redirectOnAnonymous: true })
