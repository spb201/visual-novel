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
			"text": " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tincidunt pharetra laoreet. Etiam elementum rutrum ultricies. Aliquam non interdum justo, YOU LOSE vitae hendrerit quam. Sed fermentum lacus vel volutpat lacinia. Curabitur ornare, justo ut placerat mattis, enim nibh varius est, nec mollis ante urna quis lectus. Nunc sit amet ullamcorper nunc. Proin molestie YOU LOSE pulvinar eros sit amet egestas. Donec aliquet, magna non rhoncus pharetra, enim risus egestas massa, sit amet tincidunt dolor massa ut ex. Quisque pretium turpis non risus condimentum, YOU LOSE sed ornare quam vestibulum. Nulla faucibus aliquet augue eu facilisis. Morbi posuere aliquet nunc, at blandit sapien tincidunt ac. Cras ac sem ut lorem consequat facilisis. Mauris eget ultricies mauris. YOU LOSE Praesent semper elit turpis, vitae rutrum orci iaculis at. Lorem ipsum dolor sit amet, consectetur adipiscing elit. YOU LOSE Phasellus tincidunt pharetra laoreet. YOU LOSE",
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
