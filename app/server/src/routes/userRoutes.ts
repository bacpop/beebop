import {Application} from "express";
import {BeebopConfig, BeebopRoutes} from "../types/app";
import passport from "passport";
import {authCheck, sendSuccess} from "../utils";

export default {
    addRoutes(app: Application, config: BeebopConfig) {
        app.get('/login/google',
            passport.authenticate('google', { scope: ['profile'] }));

        app.get('/login/github',
            passport.authenticate('github', { scope: ['profile'] }));

        app.get('/user',
            authCheck,
            (request, response) => {
                if (request.user.provider == 'github') {
                    sendSuccess(response, {
                        id: request.user.id,
                        provider: request.user.provider,
                        name: request.user.username
                    });
                } else {
                    sendSuccess(response, {
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
    }
} as BeebopRoutes;