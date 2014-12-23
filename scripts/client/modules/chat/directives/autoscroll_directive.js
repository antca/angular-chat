export default function () {
  return {
    link: function postLink(scope, element, attrs) {
      scope.$watch(
        function () {
          return element.children().length;
        },
        function () {
          if(element.prop("scrollHeight") - element.prop("scrollTop") > 300) return;
          element.prop("scrollTop", element.prop("scrollHeight"));
        }
      );
    }
  };
};
