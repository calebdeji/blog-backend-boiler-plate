const formidable = require("formidable");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const getFormFields = (req) => {
    const form = new formidable.IncomingForm();
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) throw err;
            resolve(fields);
        });
    });
};

const authenticateAdminUser = async (req) => {
    const { username, password } = await getFormFields(req);
    const isLoginSuccessful = await isAuthenticationParametersValid({ username, password });
    return isLoginSuccessful;
};

const isAuthenticationParametersValid = async ({ username, password }) => {
    const { password: hashpassword } = await retrieveUsernameAndPasswordInDB(username);
    console.log("password is ", hashpassword);
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashpassword, (err, result) => {
            if (err) reject(err);
            console.log(result);
            if (result) {
                resolve({ result });
            } else {
                reject({ result, errorCode: 400, errorText: "Invalid login details" });
            }
        });
    });
};

const retrieveUsernameAndPasswordInDB = (username) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDB) => {
            if (err) reject(err);
            const db = initialDB.db("blog");
            db.collection("admin-auth").findOne({ username }, (err, response) => {
                if (err) reject(err);
                if (response !== null) {
                    console.log("Response ", response);
                    resolve(response);
                } else {
                    reject({ errorCode: 400, errorText: "username not found" });
                }
                initialDB.close();
            });
        });
    });
};

const signAdminUp = async (req) => {
    const { username, password } = await getFormFields(req);
    // console.log("username and password ", username, password);
    const hashPassword = await hashUserPassword(password);
    const isSignupSuccessful = await saveParametersToDB({ username, password: hashPassword });
    return isSignupSuccessful;
};
const hashUserPassword = async (password) => {
    // console.log("password : ", password);
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err);
            // console.log(hash);
            resolve(hash);
        });
    });
};

const saveParametersToDB = ({ username, password }) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDB) => {
            if (err) reject(err);
            const db = initialDB.db("blog");
            db.createCollection("admin-auth", (err, collection) => {
                if (err) reject(err);
                collection.findOne({ username }, (err, response) => {
                    console.log("seen here");
                    if (err) reject({ errorCode: 400, errorText: "username exits" });
                    if (response === null) {
                        collection.insertOne({ username, password }, (err, response) => {
                            if (err) reject(err);
                            resolve(response);
                        });
                    } else {
                        reject({ errorCode: 400, errorText: "username exits" });
                    }
                });
            });
        });
    });
};

exports.module = { authenticateAdminUser, signAdminUp };
