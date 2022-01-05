import React, { useEffect } from 'react';

interface Props {
  githubURL: string,
  commitSHA: string
}

const IFrame = ({ githubURL, commitSHA }: Props) => {
  useEffect(() => {
    const handler = (event: MessageEvent<any>) => {
      if (event.origin === 'null') {
        // TODO: figure out what to do with penpal
        console.log(event.data);
        console.log(JSON.parse(event.data));
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      title="gameFrame"
      sandbox="allow-scripts"
      src={`${githubURL.replace('github.com', 'raw.githack.com')}/${commitSHA}/frontend/dist/index.html`}
      id="gameFrame"
      style={{ height: 'calc(100vh - 50px)', width: '100%', border: 'none' }}
    />
  );
};

export default IFrame;
