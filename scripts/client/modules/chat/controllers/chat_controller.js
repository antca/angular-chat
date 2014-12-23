export default function($scope, chat) {
  $scope.username = "Apox";
  $scope.messages = [];

  chat.onMessage((messageObj) => {
    $scope.messages.push(messageObj);
    if($scope.messages.length > 100) $scope.messages.shift();
    $scope.$apply();
  });

  $scope.onKeyDown = ($event) => {
    if($event.keyIdentifier === "Enter") {
      chat.sendMessage($scope.messageToSend);
      $scope.messageToSend = "";
    }
  };
};
