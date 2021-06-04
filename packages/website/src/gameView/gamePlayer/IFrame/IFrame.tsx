import React, { useEffect } from 'react';

interface Props {
  githubURL: string,
  commitSHA: string
}

const IFrame = ({ githubURL, commitSHA }: Props) => {
  useEffect(() => {
    const handler = (event: MessageEvent<any>) => {
      if (event.origin === 'null') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = JSON.parse(event.data);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      title="gameFrame"
      sandbox="allow-scripts"
      src={githubURL
        .replace('raw.githubusercontent', 'rawcdn.githack')
        .replace('master', commitSHA)}
      id="gameFrame"
      style={{ height: 'calc(100vh - 50px)', width: '100%', border: 'none' }}
    />
  );
};

export default IFrame;
