require('dotenv').config();

fetch('https://api.api-ninjas.com/v2/quoteoftheday', {
    headers: {
        'X-Api-Key': process.env.API_KEY
    }
})
.then(response => response.json())
.then(data => {
    console.log(data);
    console.log(data[0].quote);
    console.log(data[0].author);
});
