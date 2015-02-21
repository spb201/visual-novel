function isLocalStorageAvailable() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

angular.module("ngApp", [])
.controller("creatorController", function($scope, $http) {
	$scope.generate = function() {
		$scope.result = '{"title": "generated quest","nodes":[{"id": 0,"text":"' + $scope.user_text + '","ways_ids":\
[1, 2],"ways": ["' + $scope.user_first + '","' + $scope.user_second + '"]},\
{"id": 1,"text":"you win","final": true},{"id": 2,"text": "you lose","final": true}]}'
		;
		if (isLocalStorageAvailable()) {
			sessionStorage.setItem('quest', $scope.result);	
		}
	}
});


