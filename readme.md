<a href="https://github.com/christopher-k-c/collate"> Scraper built for the collate application </a>

# Record Store Scraper Project

This code is a Node.js script that uses Puppeteer, a headless browser automation tool, to scrape data from the Kristina Records website. The script visits the Techno section of the site, and uses an infinite loop to click on the "Next" button and scrape the details of each record in the list until there are no more records left.

The data extracted includes the artist name, record name, price (full and discounted), image URL, and product detail URL. The script then creates an array of objects containing this data, and iterates over the array to save each record as a document in a MongoDB database using the Mongoose ORM.

*The scrape function collates, cleans and outputs each individual record as an object like so:

![alt text](https://i.imgur.com/lyjIVpc.png)

To do:

- [ ] Dynamically scrape all categories on Kristina 
- [ ] Decided on the collection/document design - (Maybe should have started with this but wanted to get coding) 
  - [ ] Embedded or Reference
  - [ ] Record store, artist and record relationships etc 
- [ ] Choose Next Record Store to Scrape 



