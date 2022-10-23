if (process.env.REACT_APP_API_URL == null) {
  throw new Error('REACT_APP_API_URL env variable not set! This must be set in order to send requests to the right backend.');
}

const API_URL = process.env.REACT_APP_API_URL;

// disabled for now until we add more exported utilities
// eslint-disable-next-line import/prefer-default-export
export { API_URL };
