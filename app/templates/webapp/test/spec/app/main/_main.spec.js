describe('main routes', function () {

  var $rootScope, $state, $injector, state = 'home';
  var view = 'scripts/app/main/main.html';

  beforeEach(function() {

      beforeEach(module('<%=angularAppName%>'));


    inject(function(_$rootScope_, _$state_, _$injector_, $templateCache) {
      $rootScope = _$rootScope_;
      $state = _$state_;
      $injector = _$injector_;

      // We need add the template entry into the templateCache if we ever
      // specify a templateUrl
      $templateCache.put(view, '');
    })
  });

  it('should respond to URL', function() {
    expect($state.href(state, {})).toEqual('#/');
  });

        it('should map state route to state View template', function () {
            expect($state.get(state).templateUrl).to.equal(view);
        });

        it('of state should work with $state.go', function () {
            $state.go('home');
            $rootScope.$apply();
            expect($state.is('home'));
        });


  // it('should resolve data', function() {
  //
  //   $state.go(state);
  //   $rootScope.$digest();
  //   expect($state.current.name).toBe(state);
  //
  //   // Call invoke to inject dependencies and run function
  //   expect($injector.invoke($state.current.resolve.data)).toBe('findAll');
  // });
});


//
// describe('Controllers Tests ', function () {
//
    // beforeEach(module('webappApp'));
//
//     describe('MainController', function () {
//         var $scope;
//
        // beforeEach(inject(function ($rootScope, $controller) {
        //     $scope = $rootScope.$new();
        //     $controller('MainController', {$scope: $scope});
        // }));
//
//         it('title should be egual', function () {
//             expect($scope.title).to.equal('test');
//         });
//     });
// });
