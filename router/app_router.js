const app_router = require('express').Router()
const xapi = require('twitter-api-v2').TwitterApi
const { getSpotify } = require('../helper/spohelper')
require('dotenv').config()

app_router.get('/nowplay', async (req, res)=>{
    // res.cookie('x_username', 'khalila')
    // res.send("tes")
    const auto_x = req.query.auto_x
    const token = "Bearer " + req.cookies['access_token']
    const nowPlaying = await getSpotify("https://api.spotify.com/v1/me/player/currently-playing", token)
    var x_username = req.cookies['x_username']
    console.log(x_username)
    const x_token = req.cookies['x_access_token']
    const x_client = new xapi(x_token)
    if(!x_username){
        console.log("X Username belum ada")
        const getUsername = await x_client.v2.me({'user.fields': ["name"]})
        x_username = getUsername.data.name
    }

    if(nowPlaying.status == 200){
        const itemData = nowPlaying.data.item
        // console.log(nowPlaying.data)
        const title = itemData.name
        const link = itemData.external_urls.spotify
        const artist = itemData.album.artists[0].name
        const stateSong = nowPlaying.data.progress_ms
        const durationSong = itemData.duration_ms
        const refreshOn = Math.round(((durationSong-stateSong)/1000) + 10)

        var text = `sedang mendengarkan ${title}-${artist} \n\n ${link}`
        if(auto_x ==1){
            // console.log(text)
            x_client.v2.tweet(text)

           
            text = x_username + ' ' + text
            
            data = {
                text,link,artist, stateSong,durationSong, refreshOn
            }

            console.log(data)

            // res.send(text)
            res.render("now_playing.pug",data)
        }else{
            res.send("auto x tidak aktif")
        }
    }else{
        console.log(nowPlaying.status)
        res.send("error")
    }
})

module.exports = app_router