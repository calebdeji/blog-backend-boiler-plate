const express = require("express");
const app = express();
const fileServerPort = process.env.PORT || 5000;
const staticImagesFolder = `http://localhost:${fileServerPort}/images`;
//setting middleware
// app.use(express.static(__dirname + "/files")); //Serves resources from public folder

const startFileServer = () => {
    app.use("/images", express.static(__dirname + "/files"));

    const server = app.listen(fileServerPort);
};

exports.module = { fileServerPort, startFileServer, staticImagesFolder };
