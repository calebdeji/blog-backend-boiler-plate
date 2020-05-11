const readRequestData = (req, callback) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", async () => {
        const { id: url } = JSON.parse(body);
        callback(url);
    });
};

exports.module = { readRequestData };
