const { serial: test } = require('ava');
const WebSocket = require('ws');

require('../util/absolutePath');
const setupTestApp = require('test/util/app');

function createConnection(wss) {
  const ws = new WebSocket(`ws://localhost:${wss.address().port}`);

  return new Promise((res) => {
    ws.on('open', () => {
      res(ws);
    });
  });
}

function getNextMsg(ws) {
  return new Promise((res) => {
    const eventName = 'message';
    const onMessage = (msg) => {
      res(JSON.parse(msg));
    };
    ws.once(eventName, onMessage);
  });
}

test.beforeEach(async (t) => {
  const app = setupTestApp();

  // eslint-disable-next-line no-param-reassign
  t.context = { app };
});

test.afterEach(async (t) => {
  t.context.app.cleanup();
});

test('Should receive error message if client sends non json message', async (t) => {
  const { wss } = t.context.app;
  const ws = await createConnection(wss);
  const invalidMsg = 'InvalidMsg';
  const errorMsg = 'SyntaxError: Unexpected token I in JSON at position 0';

  ws.send(invalidMsg);

  const msg = await getNextMsg(ws);

  t.is(msg.e, errorMsg);
});
