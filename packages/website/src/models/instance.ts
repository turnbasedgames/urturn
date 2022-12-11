import axios from 'axios';

// eslint-disable-next-line import/prefer-default-export
export const getDate = async (): Promise<Date> => {
  const res = await axios.get('instance/date');
  return new Date(res.data.date);
};
