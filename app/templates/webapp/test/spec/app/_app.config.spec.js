describe('App Tests config block', function () {
	var $httpProvider;

    beforeEach(function () {
        angular.module('httpProviderConfig', [])
            .config(function(_$httpProvider_) {
                $httpProvider = _$httpProvider_;
                // spyOn($locationProvider, 'html5Mode');
            });
        module('httpProviderConfig');
        module('<%=angularAppName%>');
        inject();
    });

	it('should push interceptors', function() {
		expect($httpProvider.interceptors).toContain('errorHandlerInterceptor');
		expect($httpProvider.interceptors).toContain('authExpiredInterceptor');<% if (authenticationType == 'oauth2' || authenticationType == 'xauth') { %>
        expect($httpProvider.interceptors).toContain('authInterceptor');<% } %>
        expect($httpProvider.interceptors).toContain('notificationInterceptor');
	});

	<% if (authenticationType == 'session') { %>
    it('should set xsrf', function() {
		expect($httpProvider.defaults.xsrfCookieName).toBe('CSRF-TOKEN');
		expect($httpProvider.defaults.xsrfHeaderName).toBe('X-CSRF-TOKEN');
    });
	<% } %>
});
