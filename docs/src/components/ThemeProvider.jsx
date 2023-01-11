import React, { useMemo } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';

// eslint-disable-next-line react/prop-types
function ThemeProvider({ children }) {
  const { colorMode } = useColorMode();
  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: colorMode,
      },
    }),
    [colorMode],
  );

  return (
    <MUIThemeProvider theme={theme}>
      {children}
    </MUIThemeProvider>
  );
}

export default ThemeProvider;
