const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = 3000;

const data = {
    "messages": [
        { "name": "john", "message": "what's up?" },
        { "name": "smith", "message": "what's up?" },
    ]
};

const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(express.static('public'));
app.use(express.static('assets'));

app.get('/messages', (request, response) => {
    response.set('Content-Type', 'application/json');
    response.send(data);
});

app.post('/messages', jsonParser, (req, response) => {
    response.set('Content-Type', 'application/json');
    console.log(req.body);
    response.send(data);
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`))
