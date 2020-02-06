const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

let sessions = {
    "45tqo2sn8": {
        id: "45tqo2sn8",
        username: "test",
        messages: [
            { "username": "john", "message": "what's up?" },
            { "username": "smith", "message": "what's up?" },
        ],
        changed: false
    }
};

const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(express.static('public'));
app.use(express.static('assets'));

// create a chat room.
app.post('/create', (request, response) => {
    let session = {
        id: Math.random().toString(36).substr(2, 9),
        username: request.body.username,
        messages: [],
        changed: false
    };

    const payload = {
        session: session,
        success: true
    };

    sessions[session.id] = session;

    response.set('Content-Type', 'application/json');
    response.send(payload);
});

// get the messages in a long pooling fashion.
app.get('/messages', (request, response) => {
    // pull user from the session.
    const session = sessions[request.query.session_id] || null;

    if (!session) {
        response.send({'success': false, 'message': 'invalid session id'});
        return;
    }

    const maxTime = Math.round(new Date().getTime() / 1000) + 10;

    let payload = { success: true, messages: session.messages, timestamp: null };

    response.set('Content-Type', 'application/json');

    (function run() {
        let now = Math.round(new Date().getTime() / 1000);

        if (maxTime - now <= 0) {
            response.send(payload);
            return;
        }

        if (session.changed) {
            payload.messages = session.messages;
            session.changed = false;
            response.send(payload);
            return;
        }

        setTimeout(run, 500);
    })();
});

// add a message to a session.
app.post('/messages', jsonParser, async (request, response) => {
    let session = sessions[request.body.session_id] || null;

    if (!session) {
        response.send({'success': false, 'message': 'invalid session id'});
        return;
    }

    session.changed = true;

    const message = {
        username: request.body.username,
        message: request.body.message
    }

    session.messages.push(message);

    const payload = {
        data: session.messages,
        success: true
    };

    response.set('Content-Type', 'application/json');
    response.send(payload);
});

app.listen(port, () => console.log(`Server is listening on port ${port}!`))
