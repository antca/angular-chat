import {Router} from "express";
import * as passport from "passport";
import {Strategy as TwitterStrategy} from "passport-twitter";
import {Strategy as SteamStrategy} from "passport-steam";

import * as credentials from "../credentials";

//Authentification
passport.use(new TwitterStrategy({
  consumerKey: credentials.twitter.consumerKey,
  consumerSecret: credentials.twitter.consumerSecret,
  callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
},
function(token, tokenSecret, profile, done) {
  var filtredProfile = {
    provider: profile.provider,
    id: profile.id,
    name: profile.displayName,
    username: profile.username,
    image: profile.photos[0] && profile.photos[0].value
  }
  process.nextTick(function () {
    return done(null, filtredProfile);
  });
}
));
passport.use(new SteamStrategy({
  returnURL: 'http://127.0.0.1:8080/auth/steam/callback',
  realm: 'http://127.0.0.1:8080/',
  apiKey: credentials.steam.apiKey
},
function(identifier, profile, done) {
  var filtredProfile = {
    provider: profile.provider,
    id: profile.id,
    name: profile.displayName,
    username: profile.displayName,
    image: profile.photos[0] && profile.photos[0].value
  }
  process.nextTick(function () {
    return done(null, filtredProfile);
  });
}
));

var router = Router();

router
.get("/login", (req, res) => {
  res.render("login", {user: req.user});
})
.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})
.get("/twitter", passport.authenticate("twitter"), () => {})
.get("/steam", passport.authenticate("steam"), () => {})
.get("/twitter/callback",  passport.authenticate("twitter", {failureRedirect: "/auth/login", successRedirect: "/auth/login"}), () => {})
.get("/steam/callback",  passport.authenticate("steam", {failureRedirect: "/auth/login", successRedirect: "/auth/login"}),  () => {});


export default router;
