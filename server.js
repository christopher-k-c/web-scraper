const mongoose = require("mongoose");
const puppeteer = require('puppeteer');
const {Record} = require("./models/Record");
const radash = require('radash');

async function scrape() {

    const records = [];
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.kristinarecords.com/techno');

    // Get Genre 
    const genre = await page.evaluate(() => {
        const cleanGenre = /[//-]/g; 
        return document.querySelector('.catnav-link').getAttribute('href').replace(cleanGenre, " ").trim() 
    })

    // Infinite loop that breaks when next button is disabled 
    while (true) {    

        // Access the page dom
        const links = await page.evaluate(() => 

            // Search dom and create array from ".productlist-item" node-list 
            Array.from(document.querySelectorAll('.productlist-item'), (e) => {

                // Select unique identifier 
                const dataId = e.getAttribute('data-item-id')

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
                    recId: dataId,
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

            recId: el.recId,
            artist: el.artist,
            recordName: el.recordName,
            price: {
                discounted: el.price.sale || null,
                full: el.price.full || null
              },
            image: el.image,
            productURL: el.productURL,
            genre: genre,
            store: "Kristina Records"

        })



        // check if database reqId exists in the records array, if not remove 
        const allDocuments = await Record.find()
        allDocuments.forEach(document => {
            if(records.includes(document.recId)){
                Record.find({recId:document.recId}).remove().exec()
            }
        })


        // Store the database object matched using the findOne method other wise return null
        // Need collate the data-item-id and replace the artist/recordName as values to search the database by
        const existingRecord = await Record.findOne({ recId: `${el.recId}` });
        if (existingRecord) {
            const databaseRecord = radash.pick(existingRecord, [existingRecord.artist, existingRecord.recordName, existingRecord.price.full, existingRecord.price.discounted, existingRecord.price.image, existingRecord.price.productURL])
            const updatedRecord = radash.pick(el, [el.artist, el.recordName, el.price.full, el.price.discounted, el.price.image, el.price.productURL])
            if(radash.isEqual(databaseRecord, updatedRecord)){
                console.log("WE ARE EQUAL")
                return
            } else if(!radash.isEqual(databaseRecord, updatedRecord)){
                console.log("SOMETHING HAS GONE WRONG")
                // Implement mongoose Method to update
                existingRecord.updateOne(el)
            }


        } else {
            // Save the individual model to mongoDB using mongoose save method  
            await kristinaRecords.save();
        }

        // If exists on mongodb database
            // Don't add another instance of it  
            // However, if it has an updated field, update that field on the document that already exists on the mongo database 

        // If the record does not exist on the mongo database upload it 

        // If a record exists on the database but not in the records array... remove the instance of the record from the data base

        // // Save the individual model to mongoDB using mongoose save method  
        // await kristinaRecords.save();
    })   
}
scrape();

// Suppress Mongoose Deprecation Warning 
mongoose.set('strictQuery', true)
// Connect to the db
mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'collate',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}, err => err ? console.log(err) : console.log('Connected to database'));