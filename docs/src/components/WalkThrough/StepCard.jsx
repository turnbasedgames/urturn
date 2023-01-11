import React from 'react';
import {
  Typography, Card, CardContent, CardActionArea, Link,
} from '@mui/material';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import DocusaurusLink from '@docusaurus/Link';
import PropTypes from 'prop-types';

function StepCard({
  title, body, docsLink, selected, onClick, Icon, sx,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: !selected ? 'transparent' : undefined,
        borderWidth: '2px',
        ...sx,
      }}
      variant={selected ? 'outlined' : undefined}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: '100%',
          width: '100%',
        }}
      >
        <Icon sx={{
          display: { xs: 'none', md: 'inline-block' },
          fontSize: 30,
          marginLeft: 2,
          marginTop: 'auto',
          marginBottom: 'auto',
          color: 'var(--ifm-color-primary-light)',
        }}
        />
        <CardContent sx={{ padding: 1 }}>
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
  sx: PropTypes.shape({ height: PropTypes.number, width: PropTypes.number }),
};

StepCard.defaultProps = {
  selected: false,
  sx: {},
};

export default StepCard;
