
describe('Controllers Tests ', function () {

    beforeEach(module('webappApp'));

    describe('MainController', function () {
        var $scope;

        beforeEach(inject(function ($rootScope, $controller) {
            $scope = $rootScope.$new();
            $controller('MainController', {$scope: $scope});
        }));

        it('title should be egual', function () {
            expect($scope.title).to.equal('test');
        });
    });
});
