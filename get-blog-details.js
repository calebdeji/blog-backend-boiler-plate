const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const getBlogs = async (collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDb) => {
            const db = initialDb.db("blog");
            db.collection(collectionName, (err, collection) => {
                if (err) throw err;
                collection.find({}).toArray((err, result) => {
                    resolve(result);
                    initialDb.close();
                });
            });
        });
    });
};

const getAllBlogsLink = async () => {
    const blogs = await getBlogs("blog-collection");
    return blogs.map((blog, index) => {
        const { _id, url } = blog;
        return { id: _id, url };
    });
};
const getBlogData = async ({ id, title }) => {
    const blogs = await getBlogs("blog-collection");
    return blogs.find((blog) => blog.id === id);
};

const getAllBlogsDraftLink = async () => {
    const blogDrafts = await getBlogs("blog-drafts");
    console.log(blogDrafts);
    return blogDrafts.map((blog, index) => {
        const { _id, url } = blog;
        console.log("Blog drafts ", blog);
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
