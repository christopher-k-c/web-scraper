

const prettier = require('prettier');
const fs = require('fs')
const puppeteer = require('puppeteer');
const os = require('os');
const path = require('path');


exports.kristina_technoindex_get = (req, res) => {    
    
    async function scrape() {

        const records = [];
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://www.kristinarecords.com/techno');
        

        while (true) {    
            const links = await page.evaluate(() => 
                Array.from(document.querySelectorAll('.productlist-item'), (e) => {
                    const titleElement = e.querySelector('.productlist-meta .productlist-title-container .productlist-title');
                    const title = titleElement.innerText.trim();


                    const normalizeText = title.normalize('NFC')
                    const encoder = new TextEncoder();
                    const decoder = new TextDecoder('utf-8');
                    const normalizedData = encoder.encode(normalizeText);
                    const decodedData = decoder.decode(normalizedData);
                    const u2013 = /[\u2013\u200E]/g;
                    const change = decodedData.replace(u2013, "-");
                    let type = ""
                    change.includes("--") ? type += change.replace("--", "-") : type += change

                    


                    // const u2013 = /\u2013/g;
                    // const change = normalizeText.replace(u2013, "-")
                    // let type = ""
                    // const change = normalizeText.includes("/[-]/g") ? type += normalizeText.replace("/[-]/g", "-") : type += normalizeText
                    // const removeHyphen = title.includes("–") ? title.replace("–", "-") : title



                    const price = e.querySelector('.productlist-meta .productlist-price-container .product-price').innerText
                    const regex = /[\/\\\n]/g;
                    const cleanPrice = price.replace(regex, "")

                    const image = e.querySelector('.productlist-image--main').getAttribute('data-image');
                    const detailLink = e.querySelector('.productlist-item-link').getAttribute('href')
                    const homeURL = 'https://www.kristinarecords.com'
                    const fullLink = homeURL.concat(detailLink)


                    const [artist, recordName] = type.split(' - ');
                    return {
                        artist: artist,
                        recordName: recordName,
                        price: cleanPrice,
                        image: image,
                        productURL: fullLink,


                    };
                })
            );
            records.push(...links);

            // Stop scraping if the next button is disabled 
            if (await page.$('.productpager-item--next.disabled')) {
            break;
            }

            await Promise.all([
                // Navigate to the next page
                page.click('.productpager-item--next .productpager-link--next'),
                // Wait for page to finish loading  
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
        
        }
    
        await browser.close();

        const formattedJSON = prettier.format(JSON.stringify(records), { parser: 'json' });
        const d = new Date()
        const full = d.toUTCString()
        const short = d.toDateString()
        const [remove, rest] = full.split(',')
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
            res.redirect('/');
        }  
        saveFile()
    }
    scrape();
}

