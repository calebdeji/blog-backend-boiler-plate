const { MongoClient } = require("mongodb");
const {
    module: { mongodbUrl },
} = require("./service");
const fs = require("fs");
const {
    module: { startFileServer, staticImagesFolder },
} = require("./image-server");
startFileServer();

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
    const blogs = await getBlogListFromCollection("blog-collection");
    return blogs;
};
const getBlogData = async ({ url }) => {
    const blogs = await getBlogs("blog-collection");
    const blogExist = blogs.find(({ url: databaseURL }) => url === databaseURL);
    if (blogExist) {
        const imageURL = getImageURL(blogExist._id);

        return { imageURL, ...blogExist };
    }
    throw new Error("Blog details invalid");
};

const getAllBlogsDraftLink = async () => {
    const blogDrafts = await getBlogListFromCollection("blog-drafts");
    return blogDrafts;
};

const getBlogListFromCollection = async (collection) => {
    const blogs = await getBlogs(collection);
    console.log("Blogs ", blogs);
    return blogs.map(({ _id, url, title, details }, index) => {
        const imageURL = getImageURL(_id);
        // const strimmedDetails = strimDetails(details);
        return { id: _id, url, title, details, imageURL };
    });
};

const getBlogDraftData = async ({ url }) => {
    const blogs = await getBlogs("blog-drafts");
    // console.log("blog", blogs);
    const data = blogs.find(({ url: databaseURL }) => {
        return url === databaseURL;
    });
    if (data) {
        const imageURL = getImageURL(data._id);
        return { ...data, imageURL };
    } else {
        throw new Error("Invalid Link");
    }
};
const getImageURL = (id) => {
    return `${staticImagesFolder}/${id}`;
};
const strimDetails = (details) => {
    let strimmedDetails = details.replace(/(<([^>]+)>)/gi, "");

    return `${strimmedDetails.substr(0, 100)} ...`;
};

exports.module = { getAllBlogsLink, getBlogData, getAllBlogsDraftLink, getBlogDraftData };
