var FIREBASE_URL = "https://spb201.firebaseio.com/";

//magic function that helps to download quest as file
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

//quest viewer support function
function startGame($scope) {
	$scope.chooseButtons();
	$scope.hideStart = true;
	$scope.showControlButtons = true;
	$scope.showText = true;
}

//returns true when quest have no final nodes
function check_final_nodes(quest) {
	count = 0;
	for (i = 0; i < quest.nodes.length; ++i) {
		if (quest.nodes[i].final) {
			count++;
		}
	}
	return (count == 0);
}

function is_all_nodes_empty(quest) {
	count = 0;
	for (i = 0; i < quest.nodes.length; ++i) {
		if (quest.nodes[i] && quest.nodes[i].ways_ids) {
			for (j = 0; j < quest.nodes[i].ways_ids.length; ++j) {
				count++;
			}
		}
	}
	return (count == 0);
}

//quest viewer support function
function downloadQuest($scope, $http, url) {
	$http.get(url).
		success(function(data, status, headers, config) {
			quest = data;
			$scope.node = quest.nodes[0];
			startGame($scope);
		}).
		error(function(data, status, headers, config) {
			$scope.startError = true;
		});
}

angular.module("ngApp", ["firebase", "infinite-scroll"])
//add underscorejs support
	.constant('_', window._)
	.run(function ($rootScope) {
		$rootScope._ = window._;
	})
	.controller("indexController", ["$scope", "$firebaseAuth", function($scope, $firebaseAuth) {
		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		$scope.welcomeMessage = 'Ultimate visual novel maker';
		if ($scope.authData) {
			$scope.isAuthorized = true;
			$scope.welcomeMessage = 'Hello, ' + $scope.authData.facebook.displayName + '!';
		}
		$scope.login = function() {
			auth.$authWithOAuthPopup("facebook")
				.then(function(authData) {
					console.log("Authenticated successfully with payload:", authData);
					document.location = "index.html";
				}, function(err) {
					console.log("Login Failed!", error);
				});
		};
		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		}
	}])
//quest maker controller
	.controller("makerController", ["$scope", "$firebaseArray", "$firebaseAuth", function($scope, $firebaseArray, $firebaseAuth) {
		var ref = new Firebase(FIREBASE_URL);
		var publicRef = ref.child('public');
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		$scope.selectNode = function(i) {
			$scope.selectedNode = $scope._q.nodes[i];
		}
		if ($scope.authData) {
			$scope.isAuthorized = true;
			var privateRef = ref.child($scope.authData.uid);
			$scope.myQuests = $firebaseArray(privateRef);
		}
		$scope.quests = $firebaseArray(publicRef);
		$scope.saveToServer = function() {
			if (!$scope.isAuthorized) {
				alertify.alert('You are not logged in');
			} else if ($scope._q === undefined || $scope._q === null) {
				alertify.alert('You can\'t save empty adventure');
			} else if ($scope._q.title == '' || $scope._q.title === null || $scope._q.title === undefined) {
				alertify.alert('Title can\'t be empty');
			} else if (check_final_nodes($scope._q)) {
				alertify.alert('Adventure must contain at least on final node');
			} else if (is_all_nodes_empty($scope._q)) {
				alertify.alert('All nodes can\'t be empty');
			} else if ($scope._q.title == 'empty') {
				alertify.alert('Ivan said it\'s bad to save quest with \'empty\' title');
			} else {
				$scope.myQuests.$add(angular.toJson($scope._q));
				alertify.alert('Successfully saved to server');
			}
		}
		$scope.publish = function() {
			if (!$scope.isAuthorized) {
				alertify.alert('You are not logged in');
			} else if ($scope._q === undefined || $scope._q === null) {
				alertify.alert('You can\'t save empty adventure');
			} else if ($scope._q.title == '' || $scope._q.title === null || $scope._q.title === undefined) {
				alertify.alert('Title can\'t be empty');
			} else if (check_final_nodes($scope._q)) {
				alertify.alert('Adventure must contain at least on final node');
			} else if (is_all_nodes_empty($scope._q)) {
				alertify.alert('All nodes can\'t be empty');
			} else if ($scope._q.title == 'empty') {
				alertify.alert('Ivan said it\'s bad to save quest with \'empty\' title');
			} else {
				$scope.quests.$add(angular.toJson($scope._q));
				alertify.alert('Successfully saved to server');
			}
		}
		$scope.add = function() {
			if ($scope._q && $scope._q.nodes) {
				$scope._q.nodes.push({"id":$scope._q.nodes.length});
			}
			else if ( $scope._q && ! $scope._q.nodes) {
				$scope._q.nodes = [];
				$scope._q.nodes.push({"id":$scope._q.nodes.length});	
			} else if ( ! $scope._q ){
				$scope._q = {"quest_id":Math.round(Math.random()*1000), "nodes":[]};
				$scope._q.nodes.push({"id":$scope._q.nodes.length});
			}
		}
		$scope.pop = function() {
			$scope._q.nodes.pop();
		}
		$scope.remove = function(i) {
			$scope._q.nodes.splice(i, 1);
			for (j = i; j < $scope._q.nodes.length; ++j) {
				$scope._q.nodes[j].id--;	
			};
		}
		$scope.saved = function(savedQuest) {
			$scope._q = JSON.parse(savedQuest);
		};
		$scope.getValue = function(value, key){
			var object = JSON.parse(value);
			return object[key];
		}
		$scope.addWay = function(i) {
			if (!$scope._q.nodes[i].ways) $scope._q.nodes[i].ways = [];
			if (!$scope._q.nodes[i].ways_ids) $scope._q.nodes[i].ways_ids = [];
			$scope._q.nodes[i].ways.push('');
			$scope._q.nodes[i].ways_ids.push('');
		}
		$scope.hideSidebar = function() {
			$scope.hideSB = true;
		}
		$scope.graphBtn = function() {
			$scope.showGraph = ! $scope.showGraph;
		}

		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		}

		$scope.renewGraph = function() {
			var qnodes = [];
			var qedges = [];
			if ($scope._q) {
				for (i = 0; i < $scope._q.nodes.length; ++i) {
					qnodes.push({data : { id : ''+i }});
					for (j = 0; j < $scope._q.nodes[i].ways_ids.length; ++j) {
						qedges.push({data: { id: '' + i + j, weight: 1, source: '' + i, target: '' + $scope._q.nodes[i].ways_ids[j]}});
					}
				}
			}
			var cy = cytoscape({
				container: document.getElementById('graph-container'),
				style: cytoscape.stylesheet()
					.selector('node')
						.css({
							'content': 'data(id)'
						})
					.selector('edge')
						.css({
							'target-arrow-shape': 'triangle',
							'width': 4,
							'line-color': '#ddd',
							'target-arrow-color': '#ddd'
						})
					.selector('.highlighted')
						.css({
							'background-color': '#61bffc',
							'line-color': '#61bffc',
							'target-arrow-color': '#61bffc',
							'transition-property': 'background-color, line-color, target-arrow-color',
							'transition-duration': '0.5s'
						}),
				elements: {
					nodes: qnodes,
					edges: qedges
				},

				layout: {
					name: 'breadthfirst',
					directed: true,
					roots: '#a',
					padding: 10
				}
			});
				
			var bfs = cy.elements().bfs('#a', function(){}, true);
		}
	}])
//quest viewer controller
	.controller("viewerController", ["$scope", "$http", "$firebaseArray",  "$firebaseAuth", function($scope, $http, $firebaseArray, $firebaseAuth) {
		var ref = new Firebase(FIREBASE_URL);
		var publicRef = ref.child('public');
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		itemsCount = 13;
		if ($scope.authData) {
			$scope.isAuthorized = true;
			var privateRef = ref.child($scope.authData.uid);
			$scope.myQuests = $firebaseArray(privateRef);
		}
		$scope.quests = $firebaseArray(publicRef);
		$scope.addMoreItems = function() {
			itemsCount += 3;
			$('.quests').css('display', 'inline-block');
			$('.quests:nth-of-type(n+' + itemsCount + ')').css('display', 'none');
		}
		if ($scope.quests === undefined || $scope.quests === null) {
			alertify.alert('Can\'t download any adventures');
		};
		$scope.hideButtons = [false, false, false, false];
		$scope.chooseButtons = function() {
			if (!$scope.node.final)
				for (i = 0; i < 4; ++i)
					$scope.hideButtons[i] = ($scope.node.ways_ids[i] === undefined || $scope.node.ways_ids[i] === null);
		};
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
		$scope.exit = function() {
			$scope.showRestartButton = false;
			$scope.hideStart = false;
			$scope.showText = false;
			$scope.node.image = false;
		};
		$scope.restart = function() {
			$scope.node = quest.nodes[0];
			$scope.showControlButtons = true;
			$scope.showRestartButton = false;
		}
		$scope.saved = function(savedQuest) {
			quest = JSON.parse(savedQuest);
			$scope.node = quest.nodes[0];
			$scope.hideStart = true;
			$scope.showControlButtons = true;
			$scope.showText = true;
			$scope.chooseButtons();
		};
		$scope.showContent = function($fileContent){
			$scope.str_quest = $fileContent;
		};
		$scope.getValue = function(value, key){
			var object = JSON.parse(value);
			return object[key];
		};
		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		};
		$scope.remove = function(quest) {
			$scope.myQuests.$remove(quest);
		};
	}])
//Magic directive that helps to download quests
	.directive('onReadFile', function ($parse) {
		return {
			restrict: 'A',
			scope: false,
			link: function(scope, element, attrs) {
				var fn = $parse(attrs.onReadFile);
				element.on('change', function(onChangeEvent) {
					var reader = new FileReader();
					reader.onload = function(onLoadEvent) {
						scope.$apply(function() {
							fn(scope, {$fileContent:onLoadEvent.target.result});
						});
					};
					reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
				});
			}
		};
	})
// This makes any element draggable
// Usage: <div draggable>Foobar</div>
	.directive('draggable', function() {
		return {
			// A = attribute, E = Element, C = Class and M = HTML Comment
			restrict:'A',
			//The link function is responsible for registering DOM listeners as well as updating the DOM.
			link: function(scope, element, attrs) {
				element.draggable({
					stack: ".drag-node",
					distance: 0,
					containment: "parent"
				});
			}
		};
	})
	.directive('panels', function(){
    return {
      restrict: 'C',
      controller: function(){
        this.tab = 1;

        this.selectTab = function(setTab) {
          this.tab = setTab;
        };

        this.isSelected = function(checkTab) {
          return this.tab === checkTab;
        };
      },
      controllerAs: 'panels'
    };
  })
  .directive('img', function () {
    return {
      restrict: 'E',        
      link: function (scope, element, attrs) {
        element.error(function () {
          var url = 'http://upload.wikimedia.org/wikipedia/commons/6/69/Wikipetan_Visual_Novel_Kor.png';
          element.prop('src', url);
        });
      }
    }
  });
