

const prettier = require('prettier');
const fs = require('fs')
const puppeteer = require('puppeteer');
const os = require('os');
const path = require('path');


exports.kristina_technoindex_get = (req, res) => {
    async function run(){
        // This launches a browser programmatically, allowing us to access pages, fire off events etc
        const browser = await puppeteer.launch()
        // To access a new page we initialize a page var 
        const page = await browser.newPage()
        // Select the page you want to go to
        await page.goto('https://www.kristinarecords.com/techno')
    
    
        const links = await page.evaluate(() => 
        Array.from(document.querySelectorAll('.productlist-item'), (e) => {
            const titleElement = e.querySelector('.productlist-meta .productlist-title-container');
            const title = titleElement.innerText.trim();
            const price = e.querySelector('.productlist-meta .productlist-price-container .product-price').innerText
            const image = e.querySelector('.productlist-image--main').getAttribute('data-image');
            const detailLink = e.querySelector('.productlist-item-link').getAttribute('href')
            const homeURL = 'https://www.kristinarecords.com'
            const fullLink = homeURL.concat(detailLink)
    
            const [artist, recordName] = title.split(' - ');
            return {
            artist: artist,
            recordName: recordName,
            price: price,
            image: image,
            productURL: fullLink
            };
        })
        );

        const formattedJSON = prettier.format(JSON.stringify(links), { parser: 'json' });
        const d = new Date()
        const full = d.toUTCString()
        const short = d.toDateString()
        const [remove, rest] = full.split(',')
        // const path = `~/Desktop/Kristina`

        const homeDir = os.homedir();
        const folderName = 'Kristina';
        const folderPath = path.join(homeDir, 'Desktop', folderName);

        async function saveFile(){
            try {
                // Does directory exist
                const files = await fs.promises.readdir(folderPath)
    
                if (files.includes(`${folderPath}/${short}`)) {
                    // If the folder exists save the file 
                    await fs.promises.writeFile(`${folderPath}/${short}/Kristina_Techno_${rest}.json`, formattedJSON);
                    console.log('File Saved');
                } else {
                    // If the folder does not exist create a directory with the current data and save the file to it
                    try {
                        await fs.promises.mkdir(`${folderPath}/${short}`);
                    } catch (err) {
                        if (err.code !== 'EEXIST') throw err
                    }
                    await fs.promises.writeFile(`${folderPath}/${short}/Kristina_Techno_${rest}.json`, formattedJSON);
                    console.log('File Saved');
                }
            }
            catch (err) {
                console.log(err);
            }
            // Stop loading error
            res.redirect('/');
        }
        saveFile()
    
            //  Close browser
            await browser.close()
        }

    
    
    run()








}

