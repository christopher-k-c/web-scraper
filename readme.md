<a href="https://github.com/christopher-k-c/collate"> Scraper built for the collate application </a>

# Record Store Scraper Project

This code is a Node.js script that uses Puppeteer, a headless browser automation tool, to scrape data from the Kristina Records website. The script visits the Techno section of the site, and uses an infinite loop to click on the "Next" button and scrape the details of each record in the list until there are no more records left.

The data extracted includes the artist name, record name, price (full and discounted), image URL, and product detail URL. The script then creates an array of objects containing this data, and iterates over the array to save each record as a document in a MongoDB database using the Mongoose ORM.

**The scrape function collates, cleans and outputs each individual record as an object like so:**

![alt text](https://i.imgur.com/lyjIVpc.png)

## Tech Stack

* Node.js: a JavaScript runtime environment that allows you to run JavaScript code outside of a web browser
* Mongoose: an Object Document Mapping (ODM) library for MongoDB that provides schema-based interface for interacting with MongoDB databases
* Puppeteer: a Node.js library that provides a high-level API for controlling Chromium browsers/scraping

**Likely to be installed:**

* Dotenv: loads environment variables and can be used to keep sensitive information like passwords and API keys out of your codebase
* Cron: A library for scheduling tasks in Node.js based on the Unix cron syntax.


## To-do:

- [ ] Only want code to add to database if it does not already exist (Mongoose tinker)
- [ ] Connect up to Mongodb Online cluster
    - [ ] Set-up dot-env
- [ ] Dynamically scrape all categories on Kristina 
- [ ] Decided on the collection/document design - (Maybe should have started with this but wanted to get coding) 
  - [ ] Embedded or Reference
  - [ ] Record store, artist and record relationships etc 
- [ ] Look into cron-tab/job/scheduling 
- [ ] Choose Next Record Store to Scrape 



