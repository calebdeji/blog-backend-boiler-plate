const { parse } = require("querystring");
const formidable = require("formidable");
const fs = require("fs");
const assert = require("assert");

const { MongoClient, ObjectId } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const addImageToFileSystem = ({ imageName, imagePath }) => {
    fs.rename(imagePath, `./files/${imageName}`, (err) => {
        if (err) throw err;
        console.log(`Image ${imageName} saved successfully`);
    });
};

const convertTitleToURL = (title) => {
    const trimmedTitle = title.trim();
    const titleWithHyphen = trimmedTitle.replace(/\s+/g, "-").toLowerCase();
    return titleWithHyphen;
};
const convertStringToObjectId = (id) => {
    const validLength = 24;
    return new Promise((resolve, reject) => {
        if (id.length !== validLength) {
            reject("Invalid id");
        }
        resolve(ObjectId(id));
    });
};

const connectMongoDb = (callback) => {
    MongoClient.connect(mongodbUrl, (err, initialDB) => {
        if (err) throw new Error(err);
        const db = initialDB.db("blog");
        callback(db, initialDB);
    });
};

const getFormData = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) reject("Invalid form fields");
            const {
                file: { name, path },
            } = files;
            resolve({ imageName: name, imagePath: path, ...fields });
        });
    });
};

const editDraft = async (req) => {
    console.log("Request :", req);
    const { title, details, imagePath, id } = await getFormData(req);
    console.log("ID : ", id);
    const url = convertTitleToURL(title);
    const dataToSave = { $set: { title, details, url } };
    try {
        const correspondingObjectId = await convertStringToObjectId(id);
        return new Promise((resolve, reject) => {
            connectMongoDb((database, initialDB) => {
                database.createCollection("blog-drafts", async (err, collection) => {
                    if (err) reject(err);
                    collection.findOneAndUpdate(
                        { _id: correspondingObjectId },
                        dataToSave,
                        { returnOriginal: false },
                        (err, res) => {
                            if (err) {
                                reject(err);
                            }
                            console.log("Updated : ", res);
                            addImageToFileSystem({ imageName: correspondingObjectId, imagePath });
                            resolve(`Blog with title '${title}' has been edited successfully`);
                            initialDB.close();
                        }
                    );
                });
            });
        });
    } catch (error) {
        throw new Error(error);
    }
};

const saveDraft = async (req) => {
    const { title, details, imagePath } = await getFormData(req);
    const url = convertTitleToURL(title);
    const dataToSave = { title, details, url };
    try {
        return new Promise((resolve, reject) => {
            connectMongoDb((database, initialDB) => {
                database.createCollection("blog-drafts", async (err, collection) => {
                    if (err) reject(err);
                    collection.findOne({ title }, (err, response) => {
                        if (err) reject(err);
                        if (response === null) {
                            collection.insertOne(dataToSave, (err, res) => {
                                if (err) reject(err);
                                console.log(`Blog draft with title ${title} saved successfully`);
                                // addImageToFileSystem()
                                const { insertedId } = res;
                                addImageToFileSystem({ imageName: insertedId, imagePath });
                                initialDB.close();
                                resolve(`Blog draft with title '${title}' saved successfully`);
                            });
                        } else {
                            reject(`Blog with title ${title} already exists`);
                        }
                    });
                });
            });
        });
    } catch (error) {
        throw new Error(error);
    }
};

const publishBlog = async (req) => {
    const { title, details, imagePath } = await getFormData(req);
    const url = convertTitleToURL(title);
    try {
        return new Promise((resolve, reject) => {
            connectMongoDb((database, initialDB) => {
                database.createCollection("blog-collection", (err, collection) => {
                    if (err) reject(err);
                    // console.log("Collection created ", collection);
                    const dataToSave = { title, details, url };

                    collection.findOne({ title }, (err, response) => {
                        if (err) reject(err);
                        if (response === null) {
                            collection.insertOne(dataToSave, (err, res) => {
                                if (err) throw err;
                                // console.log(`Blog with id ${res} saved successfully`);
                                // addImageToFileSystem()
                                const { insertedId } = res;
                                addImageToFileSystem({ imageName: insertedId, imagePath });

                                initialDB.close();
                                resolve(`Blog with title '${title}' successfully Published`);
                            });
                        } else {
                            reject("Title already exists");
                        }
                    });
                });
            });
        });
    } catch (error) {
        throw new Error(error);
    }
};

exports.module = { editDraft, saveDraft, publishBlog };
