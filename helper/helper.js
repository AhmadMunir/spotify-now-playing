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
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    var hash = crypto.createHash('sha256')
    hash_data = hash.update(data, 'utf-8')
    const digest = hash_data.digest('hex')

    return base64encode(digest);
}
const base64encode = (string) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } 

module.exports = {generateRandomString, generateCodeChallenge}