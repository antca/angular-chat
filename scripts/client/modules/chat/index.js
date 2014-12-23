import "angular";
import chatDirective from "./directives/chat_directive";
import autoScrollDirective from "./directives/autoscroll_directive";
import chatController from "./controllers/chat_controller";
import chatService from "./services/chat_service";

angular.module("chat", [])
.directive("chat", chatDirective)
.directive("autoScroll", autoScrollDirective)
.controller("chat", chatController)
.service("chat", chatService);
