function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function isLocalStorageAvailable() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


angular.module("ngApp", [])
.controller("creatorController", function($scope, $http, $window) {
	$scope.quest = {"title":"generated quest","nodes":[]};
	$scope.newNodeId = 0;
	$scope.selectedNodeId = 0;
	$scope.add = function() {
		node = {"id":$scope.newNodeId, "text": $scope.user_text};
		var ways_ids = [];
		var ways = [];

		for (i = 0; i < 4; ++i) {
			if ($scope.buttons[i] !== null && $scope.buttons_dest[i] !== null) {
				ways_ids.push(parseInt($scope.buttons_dest[i]));
				ways.push($scope.buttons[i]);
			}
		}

		if ($scope.isNodeFinal)
			node.final = true;
		node.ways_ids = ways_ids;
		node.ways = ways;
		
		$scope.quest.nodes.push(node);
		++$scope.newNodeId;
		$scope.selectedNodeId = $scope.newNodeId;
	}
	$scope.generate = function() {
		$scope.result = angular.toJson($scope.quest);		
		if (isLocalStorageAvailable()) {
			sessionStorage.setItem('quest', $scope.result);	
		}
	}
	$scope.save = function() {
		if ($scope.result !== undefined) {
			if ($scope.fileName !== undefined)
				download($scope.fileName + '.json', $scope.result);
			else
				download('quest.json', $scope.result);
		} else $window.alert('You should generate your quest before downloading');
	}
});


