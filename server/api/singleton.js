/* eslint-disable */

const AuthClient = require('./AuthClient');

const singleTon = (function() {
  let singleClient;

  const createInstance = () =>
    new Promise((resolve, reject) => {
      const client = new AuthClient();

      client
        .authClient()
        .then(() => {
          console.log('Google Docs Auth Completed.');
          resolve(client);
        })
        .catch(err => {
          console.log('Something went wrong with singleton/GDocs: ', err);
          reject(Error(err));
        });
    });

  const getInstance = async () => {
    if (!singleClient) {
      singleClient = await createInstance();
    }
    return singleClient;
  };

  return {
    getInstance
  };
})();

module.exports = singleTon;