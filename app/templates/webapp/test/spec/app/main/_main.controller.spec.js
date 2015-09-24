
describe('Main Controllers Tests ', function () {

    var controller;

    beforeEach(module('<%=angularAppName%>'));

    beforeEach(inject(function(_$rootScope_, _$controller_) {
        $rootScope = _$rootScope_;
        scope      = $rootScope.$new();
        controller = _$controller_('MainController', { $scope: scope });
    }));


    it('should be created successfully', function () {
        expect(controller).toBeDefined();
    });
});
