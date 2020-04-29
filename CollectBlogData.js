const { parse } = require("querystring");
const formidable = require("formidable");
const fs = require("fs");
const assert = require("assert");

const { MongoClient, ObjectId } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";
const draftType = "draft";
const publishType = "publish";

const CollectBlogData = async (req) => {
    const form = new formidable.IncomingForm();
    try {
        const filesField = new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                const {
                    file: { name, path },
                } = files;
                resolve({ imageName: name, imagePath: path, ...fields });
            });
        });
        const resolvedField = await filesField;
        const finalFields = await initiateDbandSaveBlogData(resolvedField);
        console.log("Final fields is ");
        return finalFields;
    } catch (error) {
        console.log("Final final final");
        throw error;
    }
    // console.log("Returned promise is ", await returnedPromise);
};

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
const initiateDbandSaveBlogData = async ({ title, details, imagePath, type, id }) => {
    console.log("called seen");
    const url = convertTitleToURL(title);
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDB) => {
            if (err) throw err;
            // console.log("Db created");
            const db = initialDB.db("blog");
            if (type === publishType) {
                db.createCollection("blog-collection", (err, collection) => {
                    if (err) throw err;
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
            } else {
                db.createCollection("blog-drafts", async (err, collection) => {
                    console.log("blog drafts");
                    if (err) throw err;
                    if (id) {
                        const dataToSave = { $set: { title, details, url } };
                        const idToMongoDbObject = await convertStringToObjectId(id)
                            .then((res) => {
                                collection.findOneAndUpdate(
                                    { _id: res },
                                    dataToSave,
                                    { returnOriginal: false },

                                    (err, res) => {
                                        if (err) {
                                            console.log("Ati ri error o");
                                            reject(err);
                                        }
                                        console.log("Updated : ", res);
                                        initialDB.close();
                                        resolve(
                                            `Blog with title '${title}' has been edited successfully`
                                        );
                                    }
                                );
                                initialDB.close();
                            })
                            .catch((err) => {
                                console.log("Error here ", err);
                                reject(err);
                            });
                    } else {
                        const dataToSave = { title, details, url };
                        collection.insertOne(dataToSave, (err, res) => {
                            if (err) throw err;
                            console.log(`Blog draft with title ${title} saved successfully`);
                            // addImageToFileSystem()
                            const { insertedId } = res;
                            addImageToFileSystem({ imageName: insertedId, imagePath });
                            initialDB.close();
                            resolve(`Blog draft with title '${title}' saved successfully`);
                        });
                    }
                });
            }
        });
    });
};

exports.module = { CollectBlogData };
