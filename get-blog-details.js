const { MongoClient } = require("mongodb");
const mongodbUrl = "mongodb://127.0.0.1:27017/";

const getBlogs = async () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongodbUrl, (err, initialDb) => {
            const db = initialDb.db("blog");
            db.collection("blog-collection", (err, collection) => {
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
    const blogs = await getBlogs();
    return blogs.map((blog, index) => {
        const { _id, url } = blog;
        return { id: _id, url };
    });
};
const getBlogData = async ({ id, title }) => {
    const blogs = await getBlogs();
    return blogs.find((blog) => blog.id === id);
};

exports.module = { getAllBlogsLink, getBlogData };
