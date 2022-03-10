const router = app => {
    app.get('/', (request, response) => {
        response.json({
            message: 'Welcome to beebop!'
        });
    });
    app.get('/version', getVersionInfo);
}

async function getVersionInfo (request, response){
    response.send(version_info);
};

const version_info = {
    "status":"success",
    "errors":[],
    "data":[{"name":"beebop","version":"0.1.0"},{"name":"poppunk","version":"2.4.0"}]
}

// Export the router
module.exports = {router, getVersionInfo, version_info};