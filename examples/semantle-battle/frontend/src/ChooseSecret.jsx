import React from 'react';
import PropTypes from 'prop-types';
import SubmitWord from './SubmitWord';

function ChooseSecret({ setRecentErrorMsg }) {
  return (
    <SubmitWord
      setRecentErrorMsg={setRecentErrorMsg}
      createMoveFn={((word) => ({ secret: word }))}
      submitText="submit secret"
      textFieldDefault="Secret Word"
    />
  );
}

ChooseSecret.propTypes = {
  setRecentErrorMsg: PropTypes.func.isRequired,
};

export default ChooseSecret;
