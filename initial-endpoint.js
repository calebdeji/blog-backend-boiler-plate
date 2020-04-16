const http = require("http");
const url = require("url");

const {
    module: { CollectBlogData },
} = require("./CollectBlogData");
const {
    module: { getAllBlogsLink, getBlogData },
} = require("./get-blog-details");
const {
    module: { authenticateAdminUser, signAdminUp },
} = require("./admin-authentication");

const adminURL = "/admin";
const adminLoginURL = "/admin/login";
const adminSignupURL = "/admin/signup";
const getLinksURL = "/get-links";
const getBlogDataURL = "/get-blog";
const postMethod = "POST";
const getMethod = "GET";

const handleServerCreation = async (req, res) => {
    const { url, method } = req;
    const writeHead = (statusCode) => {
        res.writeHead(statusCode, { "Content-Type": "json" });
    };
    const strignifyData = (data) => {
        return JSON.stringify(data);
    };
    switch (url) {
        case adminURL:
            if (method === postMethod) {
                try {
                    const saveBlogData = CollectBlogData(req);
                    const returnData = {
                        isError: false,
                        operationText: "Blog data saved successfully",
                        data: "empty",
                    };
                    res.writeHead(200, { "Content-Type": "json" });
                    res.end(strignifyData(returnData));
                } catch (error) {
                    const returnData = {
                        isError: true,
                        operationText: "Blog data not saved",
                        error: error,
                    };
                    console.log(error);
                    writeHead(400);
                    res.end(strignifyData(returnData));
                }
            }
            break;
        case adminLoginURL:
            if (method === postMethod) {
                try {
                    const isAuthtenticationValid = await authenticateAdminUser(req);
                    const returnData = {
                        isError: false,
                        operationText: isAuthtenticationValid
                            ? "Login successfully"
                            : "Login failed",
                        data: null,
                    };
                    writeHead(200);
                    res.end(strignifyData(returnData));
                } catch (error) {
                    const returnData = { isError: true, operationText: "Login failed", error };
                    writeHead(400);
                    res.end(strignifyData(returnData));
                }
            }
            break;
        case adminSignupURL:
            if (method === postMethod) {
                try {
                    const { hashId, isSignup } = await signAdminUp(req);

                    const returnData = {
                        isError: false,
                        operationText: isSignup ? "Signup successfull" : "Signup failed",
                        data: { hashId, isSignup },
                    };
                    writeHead(200);
                    res.end(strignifyData(returnData));
                } catch (error) {
                    console.log(error);
                    const returnData = { isError: true, operationText: "Signup failed", error };
                    writeHead(400);
                    res.end(strignifyData(returnData));
                }
            }
            break;
        case getLinksURL:
            if (method === getMethod) {
                try {
                    const blogLinks = await getAllBlogsLink();
                    const returnData = {
                        isError: false,
                        operationText: "Blog data retrieved",
                        data: blogLinks,
                    };
                    writeHead(200);
                    res.end(strignifyData(returnData));
                } catch (error) {
                    const returnData = {
                        isError: true,
                        operationText: "Blog links not retrieved",
                        error,
                    };
                    console.log(error);
                    writeHead(400);
                    res.end(strignifyData(returnData));
                }
            }
            break;
        case getBlogDataURL:
            if (method === getMethod) {
                try {
                    const blogData = await getBlogData("5e98028f50eb1c1db8d272e7");
                    const returnData = {
                        isError: false,
                        operationText: "Blog request succeed",
                        data: blogData,
                    };
                    writeHead(200);
                    res.end(strignifyData(returnData));
                } catch (error) {
                    const returnData = {
                        isError: true,
                        operationText: "Blog request failed",
                        error,
                    };
                    console.log(error);
                    writeHead(400);
                    res.end(strignifyData(returnData));
                }
            }
            break;
        default:
            writeHead(400);
            res.end("Invalid link");
            break;
    }
};

const returnData = ({ isError, operationText, error, data }) => {
    return isError
        ? JSON.stringify({ isError, operationText, error })
        : JSON.stringify({ isError, operationText, data });
};
// connectDB();

const server = http.createServer(handleServerCreation).listen(8888);
