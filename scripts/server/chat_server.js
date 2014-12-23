import * as socketio from "socket.io";
import {authorize} from "passport.socketio";
import * as cookieParser from "cookie-parser";
import * as credentials from "./credentials";

export default class {
  constructor(server, sessionStore) {
    this.userList = [];
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
        this.userList.push(socket);
      }
      this.messageList.map((message) => socket.emit('message', message));
      console.log(socket.request.user.name + " just connected !")
      //Disconnecting
      socket.on('disconnect', (message) => {
        console.log(socket.request.user.name + " just disconnected !")
        var index;
        if(index = this.userList.indexOf(socket) !== -1) this.userList.splice(index, 1);
      });
      //Incomming message
      socket.on('message', (message) => {
        console.log(socket.request.user.name + " sent a message: " + message)
        if(socket.request.user.logged_in) {
          var msg = {sender: socket.request.user.name, message: message};
          this.messageList.push(msg);
          io.emit('message', msg);
        }
      });
    });
  }
}
