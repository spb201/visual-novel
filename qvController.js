var quest = {
	"title": "short quest",
	"nodes": [
		{
			"text": "this quest is really short",
			"ways_ids": [1, 2],
			"ways": ["left", "right"]
		},
		{
			"text": "you win",
			"final": true
		},
		{
			"text": "you lose",
			"final": true
		}
	]
}

function isLocalStorageAvailable() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function startGame($scope) {
	$scope.chooseButtons();
	$scope.hideStart = true;
	$scope.showControlButtons = true;
	$scope.showText = true;
}

function downloadQuest($scope, $http, currentQuest, url) {
	$http.get(url).
				success(function(data, status, headers, config) {
					quest = data;
					$scope.node = quest.nodes[0];
					//currentQuest = $scope.json;
					startGame($scope);
				}).
				error(function(data, status, headers, config) {
					$scope.startError = true;
				});
}

var currentQuest;

angular.module("ngApp", [])
.controller("contentController", function($scope, $http) {
	$scope.chooseButtons = function() {
		if (!$scope.node.final) {
			$scope.hideSecondButton = false;
			$scope.hideThirdButton = true;
			$scope.hideFourthButton = true;
			if ($scope.node.ways.length == 1) {
				$scope.hideSecondButton = true;
				$scope.hideThirdButton = true;
				$scope.hideFourthButton = true;
			}
			if ($scope.node.ways.length == 3) {
				$scope.hideThirdButton = false;
			}
			if ($scope.node.ways.length == 4) {
				$scope.hideThirdButton = false;
				$scope.hideFourthButton = false;
			}
		}
	};
	$scope.loadLastGenerated = function() {
			if (isLocalStorageAvailable()) {
				if (sessionStorage.getItem('quest') != undefined) {
					quest = angular.fromJson(sessionStorage.getItem('quest'));
					$scope.node = quest.nodes[0];
					startGame($scope);
				}
				else
					$scope.lastGenError = true;
			}
	}
	//$scope.str_quest = '{"text":"this is example quest","first":"first","second":"second","third":"third","final":false,"ways":[{"text":"you win","final":true},{"text":"you lose","final":true},{"text":"you lose","final":true}]}';
	$scope.buttonClick = function(i) {
		if (i != null) {
			$scope.node = quest.nodes[$scope.node.ways_ids[i]];
			$scope.chooseButtons();
			if ($scope.node.final) {
				$scope.showControlButtons = false;
				$scope.showRestartButton = true;
			}
		}
	};
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.hideStart = false;
		$scope.showText = false;
	};
	$scope.start = function(i) {
		downloadQuest($scope, $http, currentQuest, "/quest" + i.toString() + ".json");
	};
	$scope.custom = function() {
		quest = angular.fromJson($scope.str_quest);
		$scope.node = quest.nodes[0];
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		$scope.chooseButtons();
	}
});
