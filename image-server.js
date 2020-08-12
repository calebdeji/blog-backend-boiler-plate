const express = require("express");
const app = express();
const fileServerPort = process.env.PORT || 5000;
const staticImagesFolder = `https://secure-waters-09245.herokuapp.com/images`;
//setting middleware
// app.use(express.static(__dirname + "/files")); //Serves resources from public folder

const startFileServer = () => {
    app.use("/images", express.static(__dirname + "/files"));

    const server = app.listen(fileServerPort);
};

exports.module = { fileServerPort, startFileServer, staticImagesFolder };
