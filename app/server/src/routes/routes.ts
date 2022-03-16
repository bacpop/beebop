import * as versionInfo from '../../resources/versionInfo.json';

export const router = (app => {
    app.get('/', (request, response) => {
        response.json({
            message: 'Welcome to beebop!'
        });
    });
    app.get('/version', getVersionInfo);
})

export async function getVersionInfo (request, response){
    response.send(versionInfo);
}

// Export 
// module.exports = {router, getVersionInfo, versionInfo};