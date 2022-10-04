import React from 'react';
import { User } from '@urturn/types-common';

interface RoomPlayerProps {
    user: User;
    src: string;
    makeMove: (move: any) => Promise<void>;
    setChildClient: (childClient: any) => void;
}

declare function RoomPlayer({ user, src, setChildClient, makeMove, }: RoomPlayerProps): React.ReactElement;

export { RoomPlayer };
