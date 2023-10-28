const express = require('express')
const axios = require('axios')
const https = require('https')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const { generateRandomString, generateCodeChallenge } = require('./helper/helper')
const { getAccessToken } = require('./helper/spohelper')
const x_router = require('./router/x_router')
const app_router = require('./router/app_router')
const LocalStorage = require('node-localstorage').LocalStorage;

const opt = {
  key: fs.readFileSync('crt/key.pem'),
  cert: fs.readFileSync('crt/cert.pem'),
  passphrase: "iloveyou"
}

const app = express()
app.use(cookieParser())
const port = 8888

require('dotenv').config()
const SPO_CLIENT_ID = process.env.SPO_CLIENT_ID
const SPO_CLIENT_SECRET = process.env.SPO_CLIENT_SECRET

localStorage = new LocalStorage('./snp');

app.use('', x_router)
app.use('', app_router)

app.get('/', (req, res)=>{
    res.send("HALO")
})

app.get('/spologin', async(req, res)=>{
    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateRandomString(16)
    const scope = 'user-read-currently-playing'

    res.cookie('code_verifier', codeVerifier);
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: SPO_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPO_CALLBACK_URL,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    }));
})

app.get('/spocallback', async(req, res)=>{
    console.log("MASUK SINI")
    console.log("CODE", req.cookies['code_verifier'])
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
    if(!code) redirectToAuth(SPO_CLIENT_ID)
    
    try {
      const reqAccessToken = await getAccessToken(SPO_CLIENT_ID, code, req.cookies["code_verifier"])
      
      console.log(reqAccessToken.data)
      if(reqAccessToken.status){
        const {access_token, refresh_token} = reqAccessToken.data
        
        res.cookie("access_token", access_token)
        res.cookie("refresh_token", refresh_token)

        return res.send("ANDA BERHASIL LOGIN")
      }else{
        if(reqAccessToken.response.status != 200) return res.redirect("/spologin")
      }
      
    } catch (error) {
      return res.send("LOGIN LAGI")
    }
  }
})

// app.listen(port, ()=>{
//     console.log(`SERVER RUNNING IN ${port}`)
// })



https.createServer(opt,app).listen(port,()=>{
  console.log("LISTEN ON ", port)
})