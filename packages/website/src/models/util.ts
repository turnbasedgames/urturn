if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL env variable not set! This must be set in order to send requests to the right backend.');
}

const API_URL = process.env.REACT_APP_API_URL;
export default API_URL;
