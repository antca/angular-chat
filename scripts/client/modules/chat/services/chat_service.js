import {EventEmitter} from "events";
import * as io from "socket.io-client";

export default class extends EventEmitter{
  constructor() {
    super();
    this._socket = io.connect();
    this._socket.on("connect", (event) => {
      console.log("We are connected !");
    });

    this._socket.on("message", (messageObj) => this.emit('message', messageObj));
  }
  sendMessage(message) {
    this._socket.emit('message', message);
  }
  onMessage(callback) {
    this.on('message', callback);
  }
};
