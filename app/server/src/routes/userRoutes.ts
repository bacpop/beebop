import {Application, Request, Response} from "express";
import {BeebopConfig, BeebopRoutes} from "../types/app";
import passport, { Profile } from "passport";
import {authCheck, sendSuccess} from "../utils";

export default {
    addRoutes(app: Application, config: BeebopConfig) {
        app.get('/login/google',
            passport.authenticate('google', { scope: ['profile'] }));

        app.get('/login/github',
            passport.authenticate('github', { scope: ['profile'] }));

        app.get('/user',
            authCheck,
            (request: Request, response: Response) => {
                const user = request.user as Profile;
                if (user.provider == 'github') {
                    sendSuccess(response, {
                        id: user.id,
                        provider: user.provider,
                        name: user.username
                    });
                } else {
                    sendSuccess(response, {
                        id: user.id,
                        provider: user.provider,
                        name: user.name.givenName
                    });
                }
            }
        );

        app.get('/logout',
            (req: Request, res: Response) => {
                req.logout();
                res.redirect(config.client_url);
            }
        );

        app.get('/return/google',
            passport.authenticate('google', { failureRedirect: '/' }),
            (req: Request, res: Response) => {
                res.redirect(config.client_url);
            }
        );

        app.get('/return/github',
            passport.authenticate('github', { failureRedirect: '/' }),
            (req: Request, res: Response) => {
                res.redirect(config.client_url);
            }
        );
    }
} as BeebopRoutes;