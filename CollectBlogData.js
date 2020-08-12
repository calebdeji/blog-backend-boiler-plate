const { parse } = require("querystring");
const formidable = require("formidable");
const fs = require("fs");
const assert = require("assert");

const { MongoClient, ObjectId } = require("mongodb");
const {
    module: { mongodbUrl },
} = require("./service");

const addImageToFileSystem = ({ imageName, image: imageBase64 }) => {
    // fs.rename(image, `./files/${imageName}`, (err) => {
    //     if (err) throw err;
    //     console.log(`Image ${imageName} saved successfully`);
    // });
    let imgaeNameString = imageName.toString();
    fs.writeFile(`./public/${imgaeNameString}`, imageBase64, { encoding: "base64" }, (err) => {
        if (err) throw err;
        console.log(`Image ${imgaeNameString} saved successfully`);
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
            if (err) {
                console.log(err);
                reject("Invalid form fields");
            }
            // console.log("files :::: ", fields);
            const { file } = fields;
            let base64Image = file.split(";base64,").pop();
            resolve({ imageName: "unknow", image: base64Image, ...fields });
        });
    });
};

const saveDraft = async (req) => {
    const { title, details, image } = await getFormData(req);
    const url = convertTitleToURL(title);
    const dataToSave = { title, details, url };
    try {
        return new Promise((resolve, reject) => {
            if (isTitleOrDetailsEmpty({ title, details })) {
                reject("Title or Detail cannot be empty");
            }
            connectMongoDb((database, initialDB) => {
                console.log({ database, initialDB });
                database.collection("blog-drafts", async (err, collection) => {
                    if (err) reject(err);
                    collection.findOne({ title }, (err, response) => {
                        if (err) reject(err);
                        if (response === null) {
                            collection.insertOne(dataToSave, (err, res) => {
                                if (err) reject(err);
                                console.log(`Blog draft with title ${title} saved successfully`);
                                // addImageToFileSystem()
                                const { insertedId } = res;
                                addImageToFileSystem({ imageName: insertedId, image });
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

const editDraft = async (req) => {
    // console.log("Request :", req);
    const { title, details, image, id } = await getFormData(req);
    console.log("ID : ", id);
    const url = convertTitleToURL(title);
    const dataToSave = { $set: { title, details, url } };
    try {
        const correspondingObjectId = await convertStringToObjectId(id);

        console.log("corresponding ", correspondingObjectId);
        return new Promise((resolve, reject) => {
            if (isTitleOrDetailsEmpty({ title, details })) {
                reject("Title or Detail cannot be empty");
            }
            connectMongoDb((database, initialDB) => {
                database.collection("blog-drafts", async (err, collection) => {
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
                            image && addImageToFileSystem({ imageName: correspondingObjectId, image });
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

const publishBlog = async (req) => {
    const { title, details, image } = await getFormData(req);

    const url = convertTitleToURL(title);
    try {
        return new Promise((resolve, reject) => {
            if (isTitleOrDetailsEmpty({ title, details })) {
                reject("Title or Detail cannot be empty");
            }
            connectMongoDb((database, initialDB) => {
                database.collection("blog-collection", (err, collection) => {
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
                                addImageToFileSystem({ imageName: insertedId, image });

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

const editPublishBlog = async (req) => {
    const { title, details, image, id } = await getFormData(req);
    const url = convertTitleToURL(title);
    const dataToSave = { $set: { title, details, url } };

    try {
        const correspondingObjectId = await convertStringToObjectId(id);
        console.log("ID is ", correspondingObjectId);
        return new Promise((resolve, reject) => {
            if (isTitleOrDetailsEmpty({ title, details })) {
                reject("Title or Detail cannot be empty");
            }
            connectMongoDb((database, initialDB) => {
                database.collection("blog-collection", (err, collection) => {
                    if (err) reject(err);
                    collection.findOneAndUpdate(
                        { _id: correspondingObjectId },
                        dataToSave,
                        { returnOriginal: false },
                        (err, res) => {
                            if (err) {
                                reject(err);
                            }
                            console.log("Updated  : ", res);
                            image && addImageToFileSystem({ imageName: correspondingObjectId, image });
                            resolve(`Published Blog with title '${title}' has been edited successfully`);
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

const isTitleOrDetailsEmpty = ({ title, details }) => {
    const emptyString = "";
    return title.trim() === emptyString || details.trim() === emptyString;
};

exports.module = { editDraft, saveDraft, publishBlog, editPublishBlog };
