import { User } from '@urturn/types-common';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import logger from '../logger';
import { API_URL } from './util';

const useSocket = (user: User | undefined): [Socket | undefined, boolean, string | undefined] => {
  const [socket, setSocket] = useState<Socket | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [lastPong, setLastPong] = useState<string | undefined>();

  useEffect(() => {
    if (user == null) { return () => {}; }

    const newSocket = io(API_URL, {
      auth: (cb) => {
        user.firebaseUser.getIdToken().then((token: string) => {
          // disabled because eslint expects callback to be in format cb(error, result)
          // but socket.io-client interface is cb(result)
          // https://socket.io/docs/v4/client-options/#auth
          // example discussion of this in electronJs:
          // https://github.com/electron/electron/issues/9685#issuecomment-306668498
          // eslint-disable-next-line n/no-callback-literal
          cb({ token });
        }).catch(logger.error);
      },
    });

    newSocket.on('connect', () => {
      logger.info('socket connected: ', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      logger.info('socket disconnected with reason: ', reason);
      setIsConnected(false);
    });

    newSocket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    setSocket(newSocket);

    return () => {
      logger.info('force socket to be disconnected as we are closing it');
      newSocket.close();
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('pong');
    };
  }, [user]);

  return [socket, isConnected, lastPong];
};

export default useSocket;
