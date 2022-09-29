import { ComponentMeta } from '@storybook/react';

import RoomPlayer from './RoomPlayer';

const componentMeta: ComponentMeta<typeof RoomPlayer> = {
  title: '@urturn/RoomPlayer',
  component: RoomPlayer,
};
export default componentMeta;

export const Default = RoomPlayer.bind({});
Default.args = {
  // TODO: need to put in actual functions to play around
};
