/* eslint-disable */

const AuthClient = require('./AuthClient');

const singleTon = (function() {
  let instance;

  const createInstance = () => {
    let client = new AuthClient();

    client
      .authClient()
      .then(() => {
        return client;
      })
      .catch(() => {
        return;
      });
  };

  const getInstance = () => {
    if (!instance) {
      instance = createInstance();
    }
    return instance;
  };

  return {
    getInstance
  };
})();

module.exports = singleTon;
