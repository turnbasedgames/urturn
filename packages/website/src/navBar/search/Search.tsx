import React, { useState } from 'react';
import { logEvent } from 'firebase/analytics';
import {
  IconButton, InputBase, Paper,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { analytics } from '../../firebase/setupFirebase';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const onSearch = (text: string) => {
    logEvent(analytics, 'search', {
      search_term: text,
    });
  };
  return (
    <Paper>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        value={searchText}
        placeholder="Search"
        onKeyPress={(ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            onSearch(searchText);
          }
        }}
        onChange={(ev) => {
          setSearchText(ev.target.value);
        }}
      />
      <IconButton
        type="submit"
        aria-label="search"
        onClick={(ev) => {
          ev.preventDefault();
          onSearch(searchText);
        }}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default Search;
