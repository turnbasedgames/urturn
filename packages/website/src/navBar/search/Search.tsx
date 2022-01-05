import React from 'react';
import { IconButton, InputBase, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const Search = () => (
  <Paper>
    <InputBase
      sx={{ ml: 1, flex: 1 }}
      placeholder="Search"
    />
    <IconButton type="submit" aria-label="search">
      <SearchIcon />
    </IconButton>
  </Paper>
);

export default Search;
