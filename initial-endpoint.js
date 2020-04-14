const http = require("http");
const url = require("url");

const {
    module: { CollectBlogData },
} = require("./CollectBlogData");

const adminURL = "/admin";

const handleServerCreation = (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });

    if (req.url === adminURL && req.method === "POST") {
        CollectBlogData(req, () => {
            console.log("Call back hello");
        });
    } else {
        const {
            query: { action },
        } = url.parse(req.url, true);
        switch (action) {
            case "":
                break;

            default:
                break;
        }
    }
    res.end("Hello");
};

// connectDB();

const server = http.createServer(handleServerCreation).listen(8080);
