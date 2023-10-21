const express = require('express')
const axios = require('axios')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const { generateRandomString, generateCodeChallenge } = require('./helper/helper')
const LocalStorage = require('node-localstorage').LocalStorage;

const app = express()
app.use(cookieParser())
const port = 8888

require('dotenv').config()
const SPO_CLIENT_ID = process.env.SPO_CLIENT_ID
const SPO_CLIENT_SECRET = process.env.SPO_CLIENT_SECRET

localStorage = new LocalStorage('./snp');

app.get('/', (req, res)=>{
    res.send("HALO")
})

app.get('/spologin', async(req, res)=>{
    const codeVerifier = generateCodeChallenge(128)
    const state = generateRandomString(16)
    const scope = 'user-read-private user-read-email'

    localStorage.setItem('code_verifier', codeVerifier);

    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: SPO_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPO_CALLBACK_URL,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeVerifier
    }));
})

app.get('/spocallback', async(req, res)=>{
    console.log("MASUK SINI")
    var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: "/",
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(SPO_CLIENT_ID + ':' + SPO_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    console.log(authOptions)
  }
})

app.listen(port, ()=>{
    console.log(`SERVER RUNNING IN ${port}`)
})