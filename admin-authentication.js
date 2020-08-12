const formidable = require("formidable");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const {
    module: { mongodbUrl },
} = require("./service");

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
    const hashPassword = await hashParameter(password);
    const isSignupSuccessful = await saveParametersToDB({ username, password: hashPassword });
    const { insertedId, isSignup } = isSignupSuccessful;
    const hashId = await hashParameter(insertedId);

    return { hashId, isSignup };
};
const hashParameter = async (paramValue) => {
    console.log("paramValue : ", paramValue);
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.hash(paramValue.toString(), saltRounds, (err, hash) => {
            if (err) reject(err);
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
                    // console.log("seen here");
                    if (err) reject({ errorCode: 400, errorText: "username exits" });
                    if (response === null) {
                        collection.insertOne({ username, password }, (err, response) => {
                            if (err) reject(err);
                            console.log("Resolved response", response);
                            resolve({ ...response, isSignup: true });
                        });
                    } else {
                        reject({ errorCode: 400, errorText: "username exits", isSignup: false });
                    }
                });
            });
        });
    });
};

exports.module = { authenticateAdminUser, signAdminUp };
