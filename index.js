const express = require('express');
const app = express();
const mongoose  = require('mongoose');
const helper = require('./lib/helper');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());


app.post('/api/insertMultiBook', async(req, res) => {
    if(req.body.books.length > 0){
        await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,
        }).then(() => {
            helper.mongoDataModel("books").insertMany(req.body.books).then((data) => {
                helper.closeMongoDbConnAndModel("books");
                if(data){
                    res.status(200).json(JSON.parse(JSON.stringify({"status": "success", "message": "Books inserted."})));
                }else{
                    res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database insert error."})));
                }
            }).catch((err) => {
                console.log("err: ", err);
                helper.closeMongoDbConnAndModel("books");
                if(err) res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database insert error."})));
            });
        }).catch((err) => {
            console.log("err: ", err);
            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
        });
    }else{
        res.status(404).json(JSON.parse(JSON.stringify({"status": "error", "message": "No books to insert."})));
    }
});

app.post('/api/insertBook', async(req, res) => {
    await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,
    }).then(() => {
        const mongoBookModel = helper.mongoDataModel("books");
        const mongoBookDocument = new mongoBookModel({
            bookName: req.body.bookName,
            bookAuthor: req.body.bookAuthor,
            bookPage: req.body.bookPage
        });
        mongoBookDocument.save().then(() => {
            helper.closeMongoDbConnAndModel("books");
            res.status(200).json(JSON.parse(JSON.stringify({"status": "success", "message": "Book inserted."})));
        }).catch((err) => {
            console.log("err: ", err);
            helper.closeMongoDbConnAndModel("books");
            if(err) res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database insert error."})));
        });
    }).catch((err) => {
        console.log("err: ", err);
        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
    });
});

//TODO bookLis with pagination
app.get('/api/bookList', async(req, res) => {
    await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,
    }).then(() => {
        helper.mongoDataModel("books").find({}, '-__v').then((data) => {
            helper.closeMongoDbConnAndModel("books");
            if(data) res.status(200).json(JSON.parse(JSON.stringify({"status": "success", "count": data.length, "data": data})));
        }).catch(async (err) => {
            console.log("err: ", err);
            helper.closeMongoDbConnAndModel("books");
            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database fetch error."})));
        });
    }).catch((err) => {
        console.log("err: ", err);
        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
    });
});

//TODO Get only one book
app.get('/api/bookList/:id', async(req,res) => {
    await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,}).then(() => {
        helper.mongoDataModel("books").findById(req.params.id, '-__v').then((bookData) => {
            helper.closeMongoDbConnAndModel("books");
            if(bookData){
                res.json(JSON.parse(JSON.stringify({"status": "succes", "data": bookData})));
            }else{
                res.status(404).json(JSON.parse(JSON.stringify({"status": "error", "message": "Not found book!"})));
            }
        }).catch((err) => {
            console.log("err: ", err);
            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
        });
    }).catch((err) => {
        console.log("err: ", err);
        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
    });
});

app.delete('/api/deleteBook/:id', async(req, res) => {
    await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,
    }).then(() => {
        const bookIdModel = helper.mongoIdModel("books");
        bookIdModel.findOne({ "_id": req.params.id }).then(bookData => {
            if(bookData){
                bookIdModel.deleteOne({ _id: req.params.id }).then((result) => {
                        if(result){
                            helper.closeMongoDbConnAndModel("books");
                            res.status(200).json(JSON.parse(JSON.stringify({"status": "error", "message": "Succesfull delete book."})));
                        }else{
                            helper.closeMongoDbConnAndModel("books");
                            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database delete error!"})));
                        }
                    }).catch((err) => {
                        helper.closeMongoDbConnAndModel("books");
                        console.log("err: ", err);
                        res.end();
                    });
            } else{
                helper.closeMongoDbConnAndModel("books");
                res.status(404).json(JSON.parse(JSON.stringify({"status": "error", "message": "Book not found!"})));
            }
        }).catch((err) => {
            helper.closeMongoDbConnAndModel("books");
            console.log("err: ", err);
            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database fetch error."})));
        });
    }).catch((err) => {
        console.log("err: ", err);
        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
    });
});

app.put('/api/updateBook/:id', async(req, res) => {
    await mongoose.connect(process.env.mongoCloudUrl, {useNewUrlParser: true, useUnifiedTopology: true,
    }).then(() => {
        const bookIdModel = helper.mongoIdModel("books");
        bookIdModel.findOne({ "_id": req.params.id }).then(bookData => {
            if(bookData){
                if (mongoose.connection.models["books"]) delete mongoose.connection.models["books"];
                const bookDataModel = helper.mongoDataModel("books");
                bookDataModel.updateOne({_id: req.params.id}, { bookName: req.body.bookName, bookAuthor: req.body.bookAuthor, bookPage: req.body.bookPage}).then((result) => {
                    helper.closeMongoDbConnAndModel("books");
                    if(result){
                        res.status(200).json(JSON.parse(JSON.stringify({"status": "success", "message": "updated book."})));
                    }else{
                        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": ""})));
                    }
                });
            } else{
                helper.closeMongoDbConnAndModel("books");
                res.status(404).json(JSON.parse(JSON.stringify({"status": "error", "message": "Book not found!"})));
            }
        }).catch((err) => {
            helper.closeMongoDbConnAndModel("books");
            console.log("err: ", err);
            res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database fetch error."})));
        });
    }).catch((err) => {
        console.log("err: ", err);
        res.status(400).json(JSON.parse(JSON.stringify({"status": "error", "message": "Database connection failed."})));
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});