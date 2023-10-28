const axios = require("axios");
const { response } = require("express");
require('dotenv').config()

const getAccessToken = async(clientId, code, verifier)=>{
    const params ={
        "client_id": clientId,
        "grant_type": "authorization_code",
        "code":code,
        "redirect_uri": process.env.SPO_CALLBACK_URL,
        "code_verifier": verifier,
    }


    try {
        const result = await axios.post("https://accounts.spotify.com/api/token",params, {
            headers:{
                "Content-Type": "application/x-www-form-urlencoded"
            }
        },)

        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

const getSpotify = async(url, access_token)=>{
    try {
        const getSpo = await axios.get(url, {headers:{"Authorization": access_token}})
        return getSpo
    } catch (error) {
        return error.response
    }
}

module.exports = {getAccessToken, getSpotify}