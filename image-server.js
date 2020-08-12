const express = require("express");
const app = express();
const fileServerPort = process.env.PORT || 8888;
const staticImagesFolder = `http://localhost:8888/`;
//setting middleware
// app.use(express.static(__dirname + "/files")); //Serves resources from public folder
app.use("/", express.static(__dirname + "/files"));
const startFileServer = () => {
    // const server = app.listen(fileServerPort);
};

exports.module = { fileServerPort, startFileServer, staticImagesFolder, app };
