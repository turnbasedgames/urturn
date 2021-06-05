function waitFor(testAsyncFunc, timeoutMs = 10000, bufferMs = 200, errorMsg = 'Test Function did not pass') {
  const timeoutThreshold = Date.now() + timeoutMs;
  return new Promise((res, rej) => {
    const interval = setInterval(async () => {
      try {
        const result = await testAsyncFunc();
        clearInterval(interval);
        res(result);
      } catch (err) {
        if (Date.now() > timeoutThreshold) {
          clearInterval(interval);
          rej(new Error(`${errorMsg} after ${timeoutMs}ms`));
        }
      }
    }, bufferMs);
  });
}

module.exports = { waitFor };
