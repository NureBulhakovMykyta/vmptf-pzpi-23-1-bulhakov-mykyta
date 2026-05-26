fetch('quotes.json')
    .then(response => response.text())
    .then(text => {

        const quotes = JSON.parse(text);
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        document.getElementById('quote-container').innerHTML = `
            <p>"${randomQuote.quote}"</p>
            <h3>- ${randomQuote.author}</h3>
        `;
    })
    .catch(error => {
        console.log('Error:', error);
    });

