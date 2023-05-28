const mongoose = require('mongoose');

const mongoDataModel = (collectionName) => {
    const bookSchema = new mongoose.Schema({
        bookName: {
            type: String,
            required: true,
        },
        bookAuthor: {
            type: String,
            required: true,
        },
        bookPage: {
            type: Number,
            required: true,
        },
    });
    return mongoose.model(collectionName, bookSchema);
};

const mongoIdModel = (collectionName) => {
    const bookIdSchema = new mongoose.Schema({
        id: String
    });
    return mongoose.model(collectionName, bookIdSchema);
};

const closeMongoDbConnAndModel = (collectionName) => {
    mongoose.disconnect();
    if (mongoose.connection.models[collectionName]) {
        delete mongoose.connection.models[collectionName];
    }
};

module.exports = {
    mongoDataModel,
    mongoIdModel,
    closeMongoDbConnAndModel,
};