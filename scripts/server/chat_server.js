import * as socketio from "socket.io";
import {authorize} from "passport.socketio";
import * as cookieParser from "cookie-parser";
import * as credentials from "./credentials";
import * as _ from "lodash"

export default class {
  constructor(server, sessionStore) {
    this.userList = {};
    this.messageList = [];

    var io = socketio(server);
    io.use(authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: credentials.session.secret,
      store: sessionStore,
      success(passportData, accept) {
        console.log(passportData.user.name + " just authentified !");
        return accept();
      },
      fail(passportData, message, error, accept) {
        if(error)  throw new Error(message);
        console.log(passportData.user.name + " did not authentified !");
        return accept();
      }
    }));
    io.on('connect', (socket) => {
      //Connecting
      if(socket.request.user.logged_in) {
        if(this.userList[socket.request.user.id]) this.userList[socket.request.user.id].disconnect();
        this.userList[socket.request.user.id] = socket;
        console.log(_.values(this.userList).map(socket => socket.request.user.id));
        //Send userList
        io.emit('user-list', _.mapValues(this.userList, s => s.request.user));
        socket.emit('userid', socket.request.user.id);
      } else {
        socket.emit('user-list', _.mapValues(this.userList, s => s.request.user));
      }
      //Send messages
      this.messageList.map((message) => socket.emit('message', message));
      console.log(socket.request.user.name + " just connected !")
      //Disconnecting
      socket.on('disconnect', (message) => {
        console.log(socket.request.user.name + " just disconnected !");
        if(this.userList[socket.request.user.id]) {
          delete this.userList[socket.request.user.id];
          io.emit('user-list', _.mapValues(this.userList, s => s.request.user));
        }
      });
      //Incomming message
      socket.on('message', (message) => {
        console.log(socket.request.user.name + " sent a message: " + message)
        if(socket.request.user.logged_in) {
          var msg = {sender: socket.request.user.name, message: message};
          this.messageList.push(msg);
          if(this.messageList > 100) this.messageList.shift();
          io.emit('message', msg);
        }
      });
    });
  }
}
