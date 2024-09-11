const express = require('express');
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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
connectDB()

app.use(express.json())  // To accept JSON data

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use('/api/user', userRoutes)

app.get('/api/chats', (req, res) => {
    res.send('Chat page')
})

app.use(notFound)
app.use(errorHandler)


const PORT = process.env.PORT;
const server = app.listen(PORT, console.log(`Server started on ${PORT}`))

// Set a higher timeout (default is 2 minutes)
server.timeout = 500000; // Set timeout to 500 seconds (for testing purposes)