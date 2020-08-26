//Import Dependencies
const mongoose = require('mongoose'); // Used for MongoDB
require('dotenv').config(); // Used for environmental variables

//Import Application Middlewares & Routes
const app = require('./app');

//Handle Exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 🤯 Shutting down....');
    console.log(err.name, err.message);
    process.exit(1)
});

//Handle Rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHADLED REJECTION! 🤯 Shutting down....');
    console.log(err.name, err.message);
    //Here we give the server time to finish all the requests that are still pending
    //or being handled at the time, and only after that the server is killed
    server.close(() => {
        process.exit(1);
    });
});

//Connect to database
//TODO: Change MONGO_URI env variable in .env file if you're using a hosted database
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => console.log('Successfully connected to the database!'));
//No need to add the catch block
//`uncaughtException` and `unhandledRejection` which will take care of that

//Start listening to requests
//TODO: Change PORT env variable in .env file. Default port is 5000
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {

    console.log(`Server is running on port ${port}....`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHADLED REJECTION! 🤯 Shutting down....');
    console.log(err.name, err.message);
    //Here we give the server time to finish all the requests that are still pending
    //or being handled at the time, and only after that the server is thein basically killed
    server.close(() => {
        process.exit(1);
    });
});