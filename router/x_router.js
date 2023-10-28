const x_router = require('express').Router()
const xapi = require('twitter-api-v2')
require('dotenv').config()

const X_CLIENT_ID = process.env.X_CLIENT_ID
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET
const X_CALLBACK_URL = process.env.X_CALLBACK_URL

x_router.get('/xlogin', async(req, res)=>{
  const client = new xapi.TwitterApi({clientId: X_CLIENT_ID, clientSecret: X_CLIENT_SECRET})
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(X_CALLBACK_URL, { scope: ['tweet.read', 'tweet.write','users.read', 'offline.access'] });
  res.cookie("x_code_verifier", codeVerifier)
  res.cookie("x_code_state", state)
  res.redirect(url)

})
x_router.get('/xcallback', async(req, res)=>{
    // Extract state and code from query string
  const { state, code } = req.query;
  // Get the saved codeVerifier from session
//   const { codeVerifier, state: sessionState } = req.session;
  const codeVerifier = req.cookies['x_code_verifier']
  const sessionState = req.cookies['x_code_state']

  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  if (state !== sessionState) {
    return res.status(400).send('Stored tokens didnt match!');
  }

  // Obtain access token
  const client = new xapi.TwitterApi({ clientId: X_CLIENT_ID, clientSecret: X_CLIENT_SECRET });

  client.loginWithOAuth2({ code, codeVerifier, redirectUri: X_CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {

        console.log("access token", accessToken)

        res.cookie("x_access_token", accessToken)
        res.cookie("x_refresh_token", refreshToken)

        return res.send("ANDA BERHASIL LOGIN X")
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
})

module.exports = x_router