import { LinearProgress } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserContext } from './models/user';

interface Options {
  redirectOnAnonymous?: Boolean
}

const withUser = (
  WrappedComponent: any,
  options: Options = {},
): React.FC => {
  const { redirectOnAnonymous } = options;
  return function ComponentWithUser(props: any) {
    return (
      <UserContext.Consumer>
        {({ user, setUser }) => {
          if (user?.firebaseUser?.isAnonymous === true && (redirectOnAnonymous != null)) {
            return <Navigate to="/" replace />;
          }
          if (((user != null) && !user.firebaseUser.isAnonymous) || (redirectOnAnonymous == null)) {
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
};

export default withUser;
