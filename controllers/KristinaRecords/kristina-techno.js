const puppeteer = require('puppeteer');
const {Record} = require("../../models/Record");


exports.kristina_technoindex_get = (req, res) => {    
    
    async function scrape() {

        const records = [];
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://www.kristinarecords.com/techno');
        

        // Infinite loop that breaks when next button is disabled 
        while (true) {    

            // Access the page dom
            const links = await page.evaluate(() => 

                // Search dom and create array from ".productlist-item" node-list 
                Array.from(document.querySelectorAll('.productlist-item'), (e) => {

                    // Target all record titles and trim leading and trailing spaces
                    const titleElement = e.querySelector('.productlist-meta .productlist-title-container .productlist-title');
                    const title = titleElement.innerText.trim();

                    // Fix for targeting and cleaning incorrect unicodes found in the title
                    const normalizeText = title.normalize('NFC')
                    const encoder = new TextEncoder();
                    const decoder = new TextDecoder('utf-8');
                    const normalizedData = encoder.encode(normalizeText);
                    const decodedData = decoder.decode(normalizedData);
                    const u2013 = /[\u2013\u200E]/g;
                    const change = decodedData.replace(u2013, "-");
                    let type = ""
                    change.includes("--") ? type += change.replace("--", "-") : type += change
                    // Because the title contains the record name (divided by a -) the following separates the two
                    const [artist, recordName] = type.split(' - ');

                    // Get all prices
                    const price = e.querySelector('.productlist-meta .productlist-price-container .product-price').innerText
                    // Clean price information, removing all instances of /, \ or n
                    const regex = /[\/\\\n]/g;
                    const cleanPrice = price.replace(regex, "")
                    // Store the final price as an object
                    let extraFinalPrice = {}
                    // Remove the text "Sale Price" or "Original Price" when found in the price data -  need to refine
                    if(cleanPrice.includes("Sale Price:")){
                        let saleColon = cleanPrice.indexOf(":");
                        let removeSalePrice = cleanPrice.slice(saleColon+1)
                        let originalStr = removeSalePrice.indexOf("O");
                        let originalColon = removeSalePrice.indexOf(":");
                        let finalOutput = removeSalePrice.slice(0, originalStr) + removeSalePrice.slice(originalColon+1)
                        let [sale, original] = finalOutput.split(" ")
                      
                        extraFinalPrice = {
                      
                          "sale": sale,
                          "full": original,
                      
                        }

                    } else {
                        
                        extraFinalPrice = {
                        
                            "full": cleanPrice
                        
                        }  
                    }

                    // Get the image url 
                    const image = e.querySelector('.productlist-image--main').getAttribute('data-image');
                    // Get the product detail url and concat with the main url
                    const detailLink = e.querySelector('.productlist-item-link').getAttribute('href')
                    const homeURL = 'https://www.kristinarecords.com'
                    const fullLink = homeURL.concat(detailLink)

                    // The links const will return an array of objects 
                    return {
                        artist: artist,
                        recordName: recordName,
                        price: extraFinalPrice,
                        image: image,
                        productURL: fullLink,


                    };
                })
            );

            // Using spread operator pushes only the objects instead of the array of objects
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

        // Iterate over records array
        records.forEach(async (el) => {

            // Invoke a new instance of the Record model 
            const kristinaRecords = new Record({

                artist: el.artist,
                recordName: el.recordName,
                price: {
                    discounted: el.price.sale || null,
                    full: el.price.full || null
                  },
                image: el.image,
                productURL: el.productURL,
    
            })

            // Save the individual model to mongoDB using mongoose save method  
            await kristinaRecords.save();
        })   
    }
    scrape();
}

