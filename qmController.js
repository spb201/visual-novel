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
		$scope.result = 
				'{"text":"' + $scope.user_text + '",'
			+	'"first":"' + $scope.user_first + '",'
			+	'"second":"' + $scope.user_second + '",'
			+	'"ways":[{"text":"you lose","final":"true"},{"text":"you win","final":true}],'
			+	'"final":false'
			+	"}"
		;
		if (isLocalStorageAvailable()) {
			sessionStorage.setItem('quest', $scope.result);	
		}
	}
});
