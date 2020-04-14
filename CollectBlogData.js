const { parse } = require("querystring");
const formidable = require("formidable");
const fs = require("fs");

const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const CollectBlogData = (req, callback) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) throw err;
        const {
            file: { name, path },
        } = files;
        // console.log("path ", files);
        const newFilePath = `./files/${name}`;
        const blob = new Buffer(fs.readFileSync(path)).toString("base64");
        initiateDbandSaveBlogData({ ...fields, imageUrl: blob });
    });
};

const initiateDbandSaveBlogData = ({ imageUrl, title, details, id }) => {
    console.log("called seen");
    MongoClient.connect(mongodbUrl, (err, initialDB) => {
        if (err) throw err;
        // console.log("Db created");
        const db = initialDB.db("blog");
        db.createCollection("blog-collection", (err, collection) => {
            if (err) throw err;
            // console.log("Collection created ", collection);
            collection.findOne({ _id: id }, (err, result) => {
                if (err) throw err;
                const dataToSave = { imageUrl, title, details, _id: id };
                if (result === null) {
                    collection.insert(dataToSave, (err, res) => {
                        if (err) throw err;
                        console.log(`Blog with id ${id} saved successfully`);
                        initialDB.close();
                    });
                } else {
                    collection.updateOne({ _id: id }, { $set: dataToSave }, (err, res) => {
                        if (err) throw err;
                        console.log(`Blog with is ${id} has been updated successfully `);
                    });
                }
            });
        });
    });
};

const saveBlogData = ({ imageUrl, title, details, id }) => {};

exports.module = { CollectBlogData };
