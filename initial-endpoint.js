const http = require("http");
const url = require("url");

const {
    module: { CollectBlogData },
} = require("./CollectBlogData");
const {
    module: { getAllBlogsLink, getBlogData, getAllBlogsDraftLink, getBlogDraftData },
} = require("./get-blog-details");
const {
    module: { authenticateAdminUser, signAdminUp },
} = require("./admin-authentication");

const adminURL = "/admin";
const adminLoginURL = "/admin/login";
const adminSignupURL = "/admin/signup";
const getLinksURL = "/get-links";
const getBlogDataURL = "/get-blog";
const getBlogDraftLinks = "/get-draft";
const getBlogDraftDataURL = "/get-draft-data";
const postMethod = "POST";
const getMethod = "GET";

const handleServerCreation = async (req, res) => {
    const { url, method } = req;
    const writeHead = (statusCode) => {
        res.writeHead(statusCode, { "Content-Type": "json" });
    };
    switch (url) {
        case adminURL:
            if (method === postMethod) {
                try {
                    const saveBlogData = await CollectBlogData(req);
                    const returnData = getReturnData({
                        isError: false,
                        operationText: saveBlogData,
                        data: [],
                    });
                    console.log("Save blgo data ", saveBlogData);
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {
                    const returnData = getReturnData({
                        isError: true,
                        operationText: "Blog data not saved",
                        error: error,
                    });
                    console.log("Return datat nowww ", error);
                    writeHead(400);
                    res.end(returnData);
                }
            }
            break;
        case adminLoginURL:
            if (method === postMethod) {
                try {
                    const isAuthtenticationValid = await authenticateAdminUser(req);
                    const returnData = getReturnData({
                        isError: false,
                        operationText: isAuthtenticationValid
                            ? "Login successfully"
                            : "Login failed",
                        data: null,
                    });
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {
                    const returnData = getReturnData({
                        isError: true,
                        operationText: "Login failed",
                        error,
                    });
                    writeHead(400);
                    res.end(returnData);
                }
            }
            break;
        case adminSignupURL:
            if (method === postMethod) {
                try {
                    const { hashId, isSignup } = await signAdminUp(req);

                    const returnData = getReturnData({
                        isError: false,
                        operationText: isSignup ? "Signup successfull" : "Signup failed",
                        data: { hashId, isSignup },
                    });
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {
                    console.log(error);
                    const returnData = getReturnData({
                        isError: true,
                        operationText: "Signup failed",
                        error,
                    });
                    writeHead(400);
                    res.end(returnData);
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
                    const blogData = await getBlogData({ id: "5ea7e872d2d65033bec6d532" });
                    const returnData = getReturnData({
                        isError: false,
                        operationText: "Blog request succeed",
                        data: blogData,
                    });
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {
                    const returnData = getReturnData({
                        isError: true,
                        operationText: "Blog request failed",
                        error,
                    });
                    console.log(error);
                    writeHead(400);
                    res.end(returnData);
                }
            }
            break;
        case getBlogDraftLinks:
            if (method === getMethod) {
                try {
                    const blogDrafts = await getAllBlogsDraftLink();
                    const returnData = getReturnData({
                        isError: false,
                        operationText: " Blog drafts seen",
                        data: blogDrafts,
                    });
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {}
            }
            break;
        case getBlogDraftDataURL:
            if (method === getMethod) {
                try {
                    const draftDetails = await getBlogDraftData({ id: "5ea7e46ba288892798f0c152" });
                    console.log(draftDetails);
                    const returnData = getReturnData({
                        isError: false,
                        operationText: "Draft fetched",
                        data: draftDetails,
                    });
                    writeHead(200);
                    res.end(returnData);
                } catch (error) {
                    const returnData = getReturnData({
                        isError: true,
                        operationText: "Draft request failed",
                        error,
                    });
                    writeHead(400);
                    res.end(returnData);
                }
            }
        default:
            writeHead(400);
            res.end("Invalid link");
            break;
    }
};

const getReturnData = ({ isError, operationText, error, data }) => {
    return isError
        ? JSON.stringify({ isError, operationText, error })
        : JSON.stringify({ isError, operationText, data });
};
// connectDB();

const server = http.createServer(handleServerCreation).listen(8888);
