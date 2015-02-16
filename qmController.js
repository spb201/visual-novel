var quest = {
	"text": "there's long way on the left side and a short one on the right",
	"left": "left",
	"right": "right",
	"final": false,
	"ways": [
		{
			"text": "there's worst way on the left and best one on the right",
			"left": "worst",
			"right": "best",
			"final": false,
			"ways": [
				{
					"text": "you lose",
					"final": true
				},
				{
					"text": "you're on the right way",
					"left": "right",
					"right": "left",
					"final": false,
					"ways": [
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
			]
		},
		{
			"text": "you lose",
			"final": true
		}
	]
}


function contentController($scope) {
    $scope.json = quest,
    $scope.leftButton = function() {
		$scope.json = $scope.json.ways[0];
		if ($scope.json.final) {
			$scope.hideControlButtons = true;
			$scope.showRestartButton = true;
		}
	},
	$scope.rightButton = function() {
		$scope.json = $scope.json.ways[1];
		if ($scope.json.final) {
			$scope.hideControlButtons = true;
			$scope.showRestartButton = true;
		}
	},
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.json = quest;
		$scope.hideControlButtons = false;
	}
}
