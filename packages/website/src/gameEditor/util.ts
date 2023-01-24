// eslint-disable-next-line import/prefer-default-export
export function getOwnerRepoFromURL(rawGitHubURL: string): {
  owner: string
  repo: string
} {
  const githubURL = new URL(rawGitHubURL);
  const pathMatchResults = githubURL.pathname.match(/[^/]+/g);

  // This should never happen because githubURL was validated before. We check this to avoid the
  // typescript/linting errors
  if (pathMatchResults == null) {
    throw new Error('Unexpected error when trying to parse the GitHub owner and repo out of the github url!');
  }

  const owner = pathMatchResults[0];
  const repo = pathMatchResults[1];
  return { owner, repo };
}
