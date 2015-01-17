import socketio from 'socket.io';
import {authorize} from 'passport.socketio';
import Redis from 'redis';
import sioRedis from 'socket.io-redis';
import cookieParser from 'cookie-parser';
import credentials from './credentials';
import _ from 'lodash';
import log4js from 'log4js';

var log = log4js.getLogger('chat');

export default class {
  constructor(server, sessionStore) {
    this.redis = Redis.createClient();
    //TODO handle multi-server (Here each new instance erase the connexions)
    this.redis.del('user-connexions');
    this.userList = {};

    var io = this.io = socketio(server);
    io.adapter(sioRedis('localhost:6379'));
    io.use(authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: credentials.session.secret,
      store: sessionStore,
      success(passportData, accept) {
        return accept();
      },
      fail(passportData, message, error, accept) {
        if(error) throw new Error(message);
        return accept();
      }
    }));

    io.on('connect', (socket) => {
      var user = socket.request.user;
      log.info(`${user.name || 'Unknown'} (${user.id || '?'}@${user.provider || '?'}) => connected`);
      user.connected = true;
      this.redis.lrange('messages', 0, -1, (error, result) => {        
        result.map((message) => socket.emit('message', JSON.parse(message)));
      });
      this.redis.hgetall('users', (error, users) => {
          if(error) return;
          socket.emit('user-list', _.mapValues(users, JSON.parse));
          if(user.logged_in) {
            this.redis.hset('users', user.id, JSON.stringify(user));
            this.redis.hincrby('user-connexions', user.id, 1);
            io.emit('add-user', user);
            socket.emit('userid', user.id);
            socket.on('disconnect', () => {
              this.redis.hincrby('user-connexions', user.id, -1, (error, value) => {
                log.info(`${user.name} (${user.id}@${user.provider}) => left(${value} connection(s) left)`);
                if(!error && value <= 0) {                  
                log.info(`${user.name} (${user.id}@${user.provider}) => disconnected`);
                  user.connected = false;
                  this.redis.hset('users', user.id, JSON.stringify(user));
                  io.emit('del-user', user.id);
                } 
              });
            });
            socket.on('message', (message) => {                  
              log.info(`${user.name} (${user.id}@${user.provider}) => message (${message})`);
              var msg = {sender: socket.request.user.id, message: message};
              this.redis.rpush('messages', JSON.stringify(msg));
              this.redis.ltrim('messages', -99, -1);
              io.emit('message', msg);
            });    
          }
      });
    });
  }
}