import axios from 'axios';
import passport from 'passport';
import config from '../resources/config.json';

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.json(false);
    } else {
        next();
    }
}

export const router = (app => {
    app.get('/',
        (request, response) => {
            response.json({
                message: 'Welcome to beebop!'
            });
        }
    );

    app.get('/version',
        getVersionInfo);

    app.get('/login/google',
        passport.authenticate('google', { scope: ['profile'] }));

    app.get('/login/github',
        passport.authenticate('github', { scope: ['profile'] }));

    app.get('/user',
        authCheck,
        (request, response) => {
            if (request.user.provider == 'github') {
                response.json({
                    id: request.user.id,
                    provider: request.user.provider,
                    name: request.user.username
                });
            } else {
                response.json({
                    id: request.user.id,
                    provider: request.user.provider,
                    name: request.user.name.givenName
                });
            }
        }
    );

    app.get('/logout',
        (req, res) => {
            req.logout();
            res.redirect(config.client_url);
        }
    );

    app.get('/return/google',
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect(config.client_url);
        }
    );

    app.get('/return/github',
        passport.authenticate('github', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect(config.client_url);
        }
    );
})

export async function getVersionInfo(request, response) {
    await axios.get(`${config.api_url}/version`)
        .then(res => response.send(res.data));
}
