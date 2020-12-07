import { createMuiTheme } from '@material-ui/core/styles';
import { Shadows } from '@material-ui/core/styles/shadows';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#bb6bd9' },
  },
  shadows: new Array(25).fill('none') as Shadows,
});
export default theme;
