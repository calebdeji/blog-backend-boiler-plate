const { parse } = require("querystring");
const formidable = require("formidable");
const fs = require("fs");

const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const CollectBlogData = (req) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) throw err;
        const {
            file: { name, path },
        } = files;
        console.log("path ", files);
        // const blob = new Buffer(fs.readFileSync(path)).toString("base64");
        // fs.writeFile("./files/test.jpg", `data:image/jpg;base64,${blob}`, (err) => {
        //     if (err) throw err;
        // });
        initiateDbandSaveBlogData({ ...fields, imagePath: path, imageName: name });
    });
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

const initiateDbandSaveBlogData = ({ title, details, imagePath }) => {
    console.log("called seen");
    const url = convertTitleToURL(title);
    MongoClient.connect(mongodbUrl, (err, initialDB) => {
        if (err) throw err;
        // console.log("Db created");
        const db = initialDB.db("blog");
        db.createCollection("blog-collection", (err, collection) => {
            if (err) throw err;
            // console.log("Collection created ", collection);
            const dataToSave = { title, details, url };

            collection.insertOne(dataToSave, (err, res) => {
                if (err) throw err;
                console.log(`Blog with id ${res} saved successfully`);
                // addImageToFileSystem()
                const { insertedId } = res;
                addImageToFileSystem({ imageName: insertedId, imagePath });
                initialDB.close();
            });
        });
    });
};

exports.module = { CollectBlogData };
