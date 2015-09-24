
describe('App Tests run block', function () {
	var $rootScope;

	beforeEach(module('<%=angularAppName%>'));

	beforeEach(inject(function(_$rootScope_) {
		$rootScope = _$rootScope_;
	}));

	it('should defined constant', function () {
		expect($rootScope.ENV).toBeDefined();
		expect($rootScope.ENV).not.toBe(null);
		expect($rootScope.ENV).not.toBe('');
		expect($rootScope.VERSION).toBeDefined();
		expect($rootScope.VERSION).not.toBe(null);
		expect($rootScope.VERSION).not.toBe('');
	});
});
