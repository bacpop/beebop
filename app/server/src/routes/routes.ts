import axios from 'axios';
import config from '../resources/config.json';

export const router = (app => {
    app.get('/', (request, response) => {
        response.json({
            message: 'Welcome to beebop!'
        });
    });
    app.get('/version', getVersionInfo);
})

export async function getVersionInfo (request, response){
    await axios.get(`${config.api_url}/version`)
        .then(res => response.send(res.data));
}
