import React from 'react';
import {
  ThemeProvider, Typography, Stack, Box, List, ListItem, ListItemText, Paper, Snackbar, Alert, Fade,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  theme,
  board,
  ThemeProvider,
  Typography,
  Stack,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert,
  Fade
};

export default ReactLiveScope;