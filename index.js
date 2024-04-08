const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Function to fetch the latest stories from the specified URL
async function fetchData() {
  try {
    // Make GET request to the specified URL
    const response = await axios.get('https://time.com/');

    // Load HTML response into Cheerio
    const $ = cheerio.load(response.data);

    // Find the specific element with class name "partial latest-stories"
    const latestStories = $('.partial.latest-stories');

    // Extract the HTML content of the found element
    const latestStoriesHtml = latestStories.html();

    // Define regex patterns
    const titleRegex = /<h3 class="latest-stories__item-headline">(.*?)<\/h3>/g;
    const hrefRegex = /<li class="latest-stories__item">\s*<a\s*href="(.*?)">/g;

    // Initialize arrays to store extracted data
    const titles = [];
    const hrefs = [];

    // Extract titles
    let titleMatch;
    while ((titleMatch = titleRegex.exec(latestStoriesHtml)) !== null) {
      titles.push(titleMatch[1]);
    }

    // Extract hrefs
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(latestStoriesHtml)) !== null) {
      hrefs.push(hrefMatch[1]);
    }

    // Combine titles and hrefs into data array
    const data = titles.map((title, index) => ({
      title,
      link: `https://time.com${hrefs[index]}`
    }));

    // Return the data
    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}

// Define a route to handle GET requests to /getTimeStories
app.get('/getTimeStories', async (req, res) => {
  try {
    // Fetch the latest stories
    const latestStories = await fetchData();

    // Send the response as a JSON object array
    res.json(latestStories);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
