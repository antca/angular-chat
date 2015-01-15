import {EventEmitter} from 'events';
import io from 'socket.io-client';

export default class extends EventEmitter{
  constructor() {
    super();
    this._socket = io.connect();
    this._socket.on('connect', (event) => {
      console.log('We are connected !');
    });
    this._socket.on('disconnect', (event) => {
      console.log('We got disconnected !');
    });

    this._socket.on('message', (messageObj) => this.emit('message', messageObj));
    this._socket.on('user-list', (messageObj) => this.emit('user-list', messageObj));
    this._socket.on('userid', (userid) => this.emit('userid', userid));
    this._socket.on('add-user', (user) => this.emit('add-user', user));
    this._socket.on('del-user', (userid) => this.emit('del-user', userid));
  }
  sendMessage(message) {
    this._socket.emit('message', message);
  }
};
