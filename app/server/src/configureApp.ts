import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from 'passport';
import session from 'express-session';
import PassportGoogle from 'passport-google-oauth20';
import PassportGithub from 'passport-github';

import config from './resources/config.json';

export const configureApp = (app => {
    //set up passport
    passport.use(
        new PassportGoogle.Strategy(
            {
                clientID: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                callbackURL: config.server_url + '/return/google'
            },
            (accessToken, refreshToken, profile, cb) => {
                return cb(null, profile);
            }
        )
    );

    passport.use(
        new PassportGithub.Strategy({
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.server_url + '/return/github'
        },
            (accessToken, refreshToken, profile, cb) => {
                return cb(null, profile);
            }
        )
    );

    passport.serializeUser((user, cb) => {
        cb(null, user);
    });

    passport.deserializeUser((obj, cb) => {
        cb(null, obj);
    });

    app.use(session({ secret: config.SESSION_SECRET, cookie: { secure: false }, resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(morgan('tiny'));
    app.use(
        cors({
            origin: [
                config.client_url
            ],
            credentials: true,
        })
    );
    // increase body size limit to 1GB (size per sketch ~280kB)
    app.use(express.json({ limit: 1000000000 }));
    app.use(express.urlencoded({
        extended: true
    }));
})