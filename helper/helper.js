const crypto = require('crypto')

const generateRandomString = (length)=>{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const generateCodeChallenge = async(codeVerifier)=>{
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64urlencode(hashed)

    return codeChallenge
}
function base64urlencode(a){
        return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    }
async function sha256(plain) {
      const encoder = new TextEncoder()
      const data = encoder.encode(plain)
    
      return crypto.webcrypto.subtle.digest('SHA-256', data)
    } 

module.exports = {generateRandomString, generateCodeChallenge}