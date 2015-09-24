'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhSwitchTheme', function(localStorageService) {
        /*Directive binds to anchor to update the bootswatch theme selected*/
        return {
            restrict: 'A',
            scope: {
                theme : '=jhSwitchTheme'
            },
            link: function (scope, element, attrs) {
                var currentTheme = localStorageService.get('bootswatch') ? localStorageService.get('bootswatch') : $("#bootswatch-css").attr('title');
                if(scope.theme.name === currentTheme){
                    element.parent().addClass("active");
                    $("#bootswatch-css").attr("href", scope.theme.css);
                }

                element.on('click',function(){
                    localStorageService.set('bootswatch', scope.theme.name);
                    $("#bootswatch-css").attr("href", scope.theme.css);
                    $(".theme-link").removeClass("active");
                    element.parent().addClass("active");
                });
            }
        };
    });
