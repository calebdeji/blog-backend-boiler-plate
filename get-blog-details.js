const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";
const fs = require("fs");
var express = require("express");
var app = express();

//setting middleware
// app.use(express.static(__dirname + "/files")); //Serves resources from public folder
const fileServerPort = 5000;
app.use("/images", express.static(__dirname + "/files"));

var server = app.listen(fileServerPort);

const staticImagesFolder = `http://localhost:${fileServerPort}/images`;

const getBlogs = async (collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDb) => {
            if (err) reject(err);
            const db = initialDb.db("blog");
            db.collection(collectionName, (err, collection) => {
                if (err) reject(err);
                collection.find({}).toArray((err, result) => {
                    resolve(result);
                    initialDb.close();
                });
            });
        });
    });
};

const getAllBlogsLink = async (req, res) => {
    const blogs = await getBlogs("blog-collection");
    console.log("Blogs ", blogs);
    return blogs.map(({ _id, url, title }, index) => {
        const imageURL = `${staticImagesFolder}/${_id}`;

        return { id: _id, url, title, imageURL };
    });
};
const getBlogData = async ({ id, title }) => {
    const blogs = await getBlogs("blog-collection");
    console.log(" Blogs are : ", blogs, id);
    const imageURL = `${staticImagesFolder}/${id}`;
    const blogExist = blogs.find((blog) => blog._id == id);
    if (blogExist) {
        const { _id: id } = blogExist;

        delete blogExist._id;
        return { imageURL, id, ...blogExist };
    }
    throw new Error("Blog details invalid");
};

const getAllBlogsDraftLink = async () => {
    const blogDrafts = await getBlogs("blog-drafts");
    console.log(blogDrafts);
    return blogDrafts.map((blog, index) => {
        const { _id, url } = blog;
        return { id: _id, url };
    });
};

const getBlogDraftData = async ({ id }) => {
    console.log(`ID :::::::::::::: ${id}`);
    const stringId = id.toString();
    const blogs = await getBlogs("blog-drafts");
    console.log("blog", blogs);
    return blogs.find((blog) => {
        console.log("Type of id ", typeof blog._id);
        const blogId = blog._id.toString();
        return blogId === stringId;
    });
};

exports.module = { getAllBlogsLink, getBlogData, getAllBlogsDraftLink, getBlogDraftData };
