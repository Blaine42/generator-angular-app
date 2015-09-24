'use strict';

angular.module('<%=angularAppName%>.account', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('account', {
                abstract: true,
                parent: 'site',
                url : '/account',
                views: {
                    'content@': {
                        template: '<ui-view/>'
                    }
                },
            });
    });
