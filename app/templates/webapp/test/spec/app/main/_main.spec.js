describe('main routes', function () {

    var $state, $injector, state = 'home';
    var view = 'scripts/app/main/main.html';

    beforeEach(module('<%=angularAppName%>'));

    beforeEach(inject(function(_$state_, $templateCache) {
        $state     = _$state_;

        // We need add the template entry into the templateCache if we ever
        // specify a templateUrl
        $templateCache.put(view, '');
    }));

    it('should respond to URL', function() {
        expect($state.href(state, {})).toEqual('#/');
    });

    it('should map state route to state View template', function () {
        expect($state.get(state).views['content@'].templateUrl).toEqual(view);
    });

    it('of state should work with $state.go', function () {
        $state.go(state);
        expect($state.is(state));
    });
});
