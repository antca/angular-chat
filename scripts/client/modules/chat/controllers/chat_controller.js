import _ from 'lodash';

export default function($scope, chat) {
  $scope._ = _;
  $scope.me = {name: 'Unknown', logged_in: false};
  $scope.messages = [];
  $scope.users = {};

  chat.on('userid', (userid) => {
    $scope.$apply(() => {
      $scope.myId = userid;
      $scope.me = $scope.users[userid];
    });
  });

  chat.on('message', (messageObj) => {
    $scope.$apply(() => {
      $scope.messages.push(messageObj);
      if($scope.messages.length > 100) $scope.messages.shift();
    });
  });

  chat.on('user-list', (userList) => {
    $scope.$apply(() => {
      $scope.users = userList;
      console.log($scope.users);
    });
  });

  chat.on('add-user', (user) => {
    $scope.$apply(() => {
      $scope.users[user.id] = user;
    });
  });

  chat.on('del-user', (id) => {
    $scope.$apply(() => {
      $scope.users[id].connected = false;
    });
  });  

  $scope.sendMessage = ($event) => {
    if($event.type === 'keydown' && $event.keyCode === 13 || $event.type === 'click') {
      if($scope.messageToSend.length > 0) {
        chat.sendMessage($scope.messageToSend);
        $scope.messageToSend = '';
      }
    }
  };

  //Login
  var popup;
  $scope.login = ($event) => {
    $event.preventDefault();
    popup = popitup('/auth/login');
  }
  window.addEventListener('message', (event) => {
    if(event.source === popup && event.data === 'done') {
      popup.close();
      window.location = '/';
    }
  });
};

function popitup(url) {
  var newwindow = window.open(url,'Login','height=500,width=500');
  if (window.focus) {
    newwindow.focus()
  }
  return newwindow;
}
