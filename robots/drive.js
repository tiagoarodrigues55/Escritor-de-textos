const express = require('express');
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;

const state = require('./state');
const open = require('open');


  content = state.load()
async function robot(){
  console.log('> [drive-robot] Starting...')

  await authenticateWithOAuth()
  state.save(content)
  

  async function authenticateWithOAuth() {
    console.log('> [drive-robot] get authenticated')

    const webServer = await startWebServer();
    const OAuthClient = await createOAuthClient();
    requestUserConsent(OAuthClient);
    const authorizationToken = await waitForGoogleCallback(webServer);
    await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
    await setGlobalGoogleAuthentication(OAuthClient);
    await stopWebServer(webServer);
    const drive = google.drive({
      version: 'v3',
      auth: OAuthClient
    });
    const docs = google.docs({
      version: 'v1',
      auth: OAuthClient
    })
    // await duplicate(content)
    await createFile(content)
    async function startWebServer() {
      return new Promise((resolve, reject) => {
        const port = 5000;
        const app = express();

        const server = app.listen(port, () => {

          console.log(`> [drive-robot] Listening on http://localhost:${port}`);

          resolve({
            app,
            server
          });
        });
      });
    };
    async function createOAuthClient() {

    console.log('> [drive-robot] create OAuth Client')

      const credentials = require('../credentials/credentials.json');

      const OAuthClient = new OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      );

      return OAuthClient;
    }

    function requestUserConsent(OAuthClient) {

    console.log('> [drive-robot] request user consent')

      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/documents']
      });

      open(consentUrl); //open url browser
    }

    async function waitForGoogleCallback(webServer) {
      return new Promise((resolve, reject) => {
        console.log('\n\n> [drive-robot] Waiting for user consent\n\n');

        webServer.app.get('/oauth', (req, res) => {
          const authCode = req.query.code;
          console.log(`> [drive-robot] Consent given: ${authCode}`);

          res.send('<h1>Thank you!</h1><p>Now close this tab.</p>');
          resolve(authCode);
        });
      });
    };

    async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) {
            return reject(error);
          }

          console.log('\n\n[drive-robot] Access tokens received!\n\n');

          OAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    };

    function setGlobalGoogleAuthentication(OAuthClient) {
        google.options({
        auth: OAuthClient
      });
    };

    async function stopWebServer(webServer) {

    console.log('> [drive-robot] stop server')

      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
          resolve();
        });
      });
    };
    async function duplicate(content){
      
      let requests = [
        {
          replaceAllText: {
            containsText: {
              text: '{{texto}}',
              matchCase: true,
            },
            replaceText: content.textoFinal,
          },
        },
        {
          replaceAllText: {
            containsText: {
              text: '{{tema}}',
              matchCase: true,
            },
            replaceText: content.tema,
          },
        },
        {
          replaceAllText: {
            containsText: {
              text: '{{primeiraKeyword}}',
              matchCase: true,
            },
            replaceText: content.keywords[0],
          },
        },
        {
          replaceAllText: {
            containsText: {
              text: '{{links}}',
              matchCase: true,
            },
            replaceText: content.link,
          },
        },
        
      ];
    
      google
          .discoverAPI(
              'https://docs.googleapis.com/$discovery/rest?version=v1&key=AIzaSyAwgBDKwa7QLIDEpx26TWfLx5xjfDGaMK8')
          .then(function(docs) {
            docs.documents.batchUpdate(
                {
                  documentId: '1I17QqMa7t-236of-h-KT1zvEIBU9nKKFUWbZ7ktTlP0',
                  resource: {
                    requests,
                  },
                },
                (err, {data}) => {
                  if (err) return console.log('The API returned an error: ' + err);
                  console.log(data);
                });
          });
    }
    async function createFile(content){
      
        var body = {'title': `${content.tema}, ${content.keywords[0]}`};
        var request = await drive.files.copy({
          'fileId': '1I17QqMa7t-236of-h-KT1zvEIBU9nKKFUWbZ7ktTlP0',
          'resource': {'title': `${content.tema}, ${content.keywords[0]}`, 
          'name': `${content.tema}, ${content.keywords[0]}`
        },
        });
        console.log(request.data)
       

      console.log('> [drive-robot] Create the file')
    }
  };

  
  
  

}

module.exports = robot