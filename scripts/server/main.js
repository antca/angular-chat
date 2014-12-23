import * as path from "path";
import * as express from "express";
import * as session from "express-session";
import * as SQLiteStore from "connect-sqlite3";
import * as stylus from "stylus";
import * as nib from "nib";
import * as to5 from "jade-6to5";
import * as jade from "jade";
import * as passport from "passport";
//Routes
import indexRouter from "./routes/index";
import authRouter from "./routes/auth";
import templatesRouter from "./routes/templates";
//Chat Server
import ChatServer from "./chat_server";
import {Server} from 'http';

import * as credentials from "./credentials";

var appDir = path.dirname(require.main.filename);

var app = express();

//Templates
jade = to5({}, jade);
app.engine("jade", jade.__express);
app.set("view engine", "jade");
app.set("views", appDir + "/views");
//Styles
app.use(stylus.middleware({
  src: appDir + "/stylesheets",
  dest: appDir + "/public",
  compile: function (str, path) {
    return stylus(str)
    .set("filename", path)
    .set("compress", true)
    .use(nib());
  }
}));
//Static files
app.use("/public", express.static(appDir + "/public"));
//Session Store
var sessionStore = new (SQLiteStore(session));
app.use(session({
  store: sessionStore,
  secret: credentials.session.secret,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));
//Authentification
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/templates", templatesRouter);

//Chat Server
var server = Server(app);
app.chat = new ChatServer(server, sessionStore);

var port = Number(process.env.PORT || 8080);
server.listen(port);

(msg => console.log(`Hello from ${msg} ! Listening on port ${port}`))("Node");
