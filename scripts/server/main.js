import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import session from 'express-session';
import redis from 'connect-redis';
import stylus from 'stylus';
import bootstrap from 'bootstrap-styl';
import nib from 'nib';
import to5 from 'jade-6to5';
import jade from 'jade';
import passport from 'passport';
//Routes
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import templatesRouter from './routes/templates';
//Chat Server
import ChatServer from './chat_server';
import {Server} from 'http';

import log4js from 'log4js';

import * as credentials from './credentials';

var appDir = path.dirname(require.main.filename);

log4js.configure('logger_config.json', { cwd: `${appDir}/logs`});

var app = express();

//Logger
app.use(log4js.connectLogger(log4js.getLogger('http')));
//Templates
jade = to5({}, jade);
app.engine('jade', jade.__express);
app.set('view engine', 'jade');
app.set('views', appDir + '/views');
//Styles
app.use(stylus.middleware({
  src: appDir + '/stylesheets',
  dest: appDir + '/public',
  compile: function (str, path) {
    return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .use(bootstrap());
  }
}));
//Static files
app.use('/public', express.static(appDir + '/public'));
//Session Store
var sessionStore = new (redis(session))({
  host: 'localhost',
  port: 6379
});
app.use(session({
  store: sessionStore,
  secret: credentials.session.secret,
  resave: false,
  saveUninitialized: true,
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

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/templates', templatesRouter);

//Chat Server
var server = Server(app);
app.chat = new ChatServer(server, sessionStore);

var port = Number(process.argv[2] || process.env.PORT || 8080);
server.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
