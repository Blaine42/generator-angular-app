'use strict';

angular.module('<%=angularAppName%>')
    .factory('BootSwatchService', function ($http) {
        return {
            get: function() {
                return $http.get('https://bootswatch.com/api/3.json').then(function (response) {
                    return response.data.themes;
                });
            }
        };
    });
