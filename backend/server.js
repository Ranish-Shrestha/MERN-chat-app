const express = require('express');
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const cors = require('cors');

const app = express()
// Use CORS middleware
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

dotenv.config()

app.get('/', (req, res) => {
    res.send('API is running')
})

app.get('/api/chat', (req, res) => {
    res.send(chats);
})

app.get('/api/chat/:id', (req, res) => {
    // console.log(req.params.id)
    const singleChat = chats.find((x) => x._id === req.params.id);
    res.send(singleChat)
})


const PORT = process.env.PORT;
const server = app.listen(PORT, console.log(`Server started on ${PORT}`))

// Set a higher timeout (default is 2 minutes)
server.timeout = 500000; // Set timeout to 500 seconds (for testing purposes)