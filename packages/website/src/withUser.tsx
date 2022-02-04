import { LinearProgress } from '@mui/material';
import React from 'react';
import { Redirect } from 'react-router-dom';

import { UserContext } from './models/user';

type Options = {
  redirectOnAnonymous?: Boolean
};

const withUser = (
  WrappedComponent: any,
  options: Options = {},
) => {
  const { redirectOnAnonymous } = options;
  return (props: any) => (
    <UserContext.Consumer>
      {({ user, setUser }) => {
        if (user && user.firebaseUser.isAnonymous && redirectOnAnonymous) {
          return <Redirect to="/" />;
        }
        if ((user && !user.firebaseUser.isAnonymous) || !redirectOnAnonymous) {
          // eslint-disable-next-line react/jsx-props-no-spreading
          return <WrappedComponent user={user} setUser={setUser} {...props} />;
        }
        return (
          <LinearProgress sx={{
            position: 'relative',
          }}
          />
        );
      }}
    </UserContext.Consumer>
  );
};

export default withUser;
