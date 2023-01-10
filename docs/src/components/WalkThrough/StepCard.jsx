import React from 'react';
import {
  Typography, Card, CardContent, CardActionArea, Link,
} from '@mui/material';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import DocusaurusLink from '@docusaurus/Link';
import PropTypes from 'prop-types';

function StepCard({
  title, body, docsLink, selected, onClick, Icon,
}) {
  return (
    <Card elevation={0} sx={{ backgroundColor: !selected ? 'transparent' : undefined, borderWidth: '2px' }} variant={selected ? 'outlined' : undefined}>
      <CardActionArea onClick={onClick} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Icon sx={{ fontSize: 30, marginLeft: 2, color: 'var(--ifm-color-primary-light)' }} />
        <CardContent>
          <Typography variant="body2" fontWeight="bold" marginBottom={1}>
            {title}
          </Typography>
          <Typography variant="body2" marginBottom={1}>
            {body}
          </Typography>
          <Link
            href={docsLink}
            variant="body2"
            fontWeight="bold"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 24,
              '& > svg': { transition: '0.2s' },
              '&:hover > svg': { transform: 'translateX(3px)' },
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            component={DocusaurusLink}
          >
            <span>Docs</span>
            {' '}
            <KeyboardArrowRightRounded fontSize="small" sx={{ mt: '1px', ml: '2px' }} />
          </Link>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

StepCard.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  docsLink: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  Icon: PropTypes.elementType.isRequired,
};

StepCard.defaultProps = {
  selected: false,
};

export default StepCard;
