import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import RoomPlayer  from './RoomPlayer';

export default {
  title: '@urturn/RoomPlayer',
  component: RoomPlayer,
} as ComponentMeta<typeof RoomPlayer>;

const Template: ComponentStory<typeof RoomPlayer> = (args) => <RoomPlayer {...args} />;

export const Default = Template.bind({});
Default.args = {
  // TODO: need to put in actual functions to play around
};
