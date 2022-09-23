import React, { useCallback, useEffect, useState } from 'react'
import { connectToChild } from 'penpal'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Typography } from '@mui/material'
import {
  Errors, makeMove, Room, generateBoardGame
} from '../../../models/room'
import API_URL from '../../../models/util'
import { User } from '../../../models/user'

const socket = io(API_URL, { transports: ['websocket'] })

socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('socket connected: ', socket.id)
})

socket.on('disconnect', (reason) => {
  // eslint-disable-next-line no-console
  console.log('socket disconnected with reason: ', reason)
  if (reason === 'io server disconnect') {
    // eslint-disable-next-line no-console
    console.log('manually trying to reconnect socket')
    socket.connect()
  }
})

interface WatchRoomRes {
  error: string
}

interface UnwatchRoomRes {
  error: string
}

interface Props {
  room: Room
  user: User
}

const IFrame = ({
  room,
  user
}: Props): React.ReactElement => {
  if (room.game == null) {
    return (
      <Typography
        marginTop="10px"
        variant="h4"
        align="center"
        color="text.primary"
      >
        Game not found
      </Typography>
    )
  }

  const roomId = room.id
  const { game: { githubURL, commitSHA } } = room
  const parsedGithubURL = new URL(githubURL)
  const repoOwner = parsedGithubURL.pathname.split('/')[1]
  const repo = parsedGithubURL.pathname.split('/')[2]
  // TODO: make this configurable by an environment variable for testing
  const cdnURL = `https://rawcdn.githack.com/${repoOwner}/${repo}/${commitSHA}/frontend/build/index.html`
  const [childClient, setChildClient] = useState<any | null>()

  useEffect(() => {
    if (childClient == null) {
      return () => {}
    }

    function handleNewBoardGame (boardGame: any): void {
      childClient.stateChanged(boardGame)
    }

    async function setupRoomSocket (): Promise<void> {
      socket.on('room:latestState', handleNewBoardGame)
      socket.emit('watchRoom', { roomId }, (res: null | WatchRoomRes) => {
        if (res != null) {
          // eslint-disable-next-line no-console
          console.error('error trying to watch room', res.error)
        }
      })
      childClient.stateChanged(generateBoardGame(room, room.latestState))
    }

    setupRoomSocket().catch(console.error)
    return () => {
      socket.emit('unwatchRoom', { roomId }, (res: null | UnwatchRoomRes) => {
        if (res != null) {
          // eslint-disable-next-line no-console
          console.error('error trying to unwatch room', res.error)
        }
      })
      socket.off('room:latestState', handleNewBoardGame)
    }
  }, [childClient])

  const iframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframe != null) {
      // eslint-disable-next-line no-param-reassign
      iframe.src = cdnURL
      const connection = connectToChild({
        iframe,
        methods: {
          async getLocalPlayer () {
            return { id: user.id, username: user.username }
          },
          async makeMove (move: any) {
            try {
              await makeMove(roomId, move)
              return { success: true }
            } catch (err) {
              if (
                axios.isAxiosError(err) && (err.response != null)
              ) {
                if (err.response.data.name === Errors.CreatorError) {
                  return { error: err.response.data.creatorError }
                }
                return { error: err.response.data }
              }
              return { error: err }
            }
          }
        }
        // debug: true,
        // childOrigin: 'null',
      })
      connection.promise.then((child) => {
        setChildClient(child)
      }).catch(console.error)
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      title="gameFrame"
      sandbox="allow-scripts allow-forms allow-same-origin" // TODO: concept of least privelege, why do we need these?
      id="gameFrame"
      style={{ height: 'calc(100vh - 50px)', width: '100%', border: 'none' }}
    />
  )
}

export default IFrame
