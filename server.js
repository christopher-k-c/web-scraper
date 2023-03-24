const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
// const $ = require('jquery');
const express = require('express')


const app = express()


const kristinaTechnoURL = 'https://www.kristinarecords.com/techno/'

axios(kristinaTechnoURL,  {  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }})
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)
        const records = []

        $('.productlist-item', html).each(function() {
            const title = $(this).find('.productlist-text-wrapper .productlist-title').text()
            const image = $(this).find('.productlist-image--main').attr('data-src');
            records.push({
                title,
                image
            })
        })
        // Final Array
        let recordDetailArray = []
        // Loop through initial array separating the string into Artist and Record name key pair values.
        for(let b = 0; b < records.length; b++){
            let createArrayFromObject = records[b].title.split("-")
            recordDetailArray.push({
              artist: createArrayFromObject[0],
              record: createArrayFromObject[1],
              image: records[b].image,
            //   trim() not working? TypeError: Cannot read properties of undefined (reading 'trim')
            })
          }
          console.log(recordDetailArray)

    }).catch(err => {
        console.log(err)
    })


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

