import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';
import {
  Paper, IconButton, InputBase, Stack, Tooltip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { analytics } from '../../firebase/setupFirebase';

function Search(): React.ReactElement {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const onSearch = (text: string): void => {
    logEvent(analytics, 'search', {
      search_term: text,
    });
    navigate(`/games?searchText=${text}`);
  };
  return (
    <Paper>
      <Stack direction="row" alignItems="center">
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
        <Tooltip disableFocusListener title="Search">
          <IconButton
            type="submit"
            aria-label="search"
            size="small"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
            onClick={(ev) => {
              ev.preventDefault();
              onSearch(searchText);
            }}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

export default Search;
