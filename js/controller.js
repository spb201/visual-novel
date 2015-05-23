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


var ngApp = angular.module("ngApp", ['ngRoute', "firebase", "infinite-scroll"])
	.config(function($routeProvider) {		
		$routeProvider
			.when('/about', { 
				templateUrl : 'landing.html',
			})
			.when('/mynovels', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			})
			.when('/edit/:id', {
				templateUrl : 'maker.html',
				controller  : 'makerController'
			})
			.when('/', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			});
	})
	.constant('_', window._)
	.run(function ($rootScope) {
		$rootScope._ = window._;
	})
	.controller("mainController", ["$scope", "$firebaseAuth", "$location", function($scope, $firebaseAuth, $location) {
		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		if ($scope.authData) {
			$scope.isAuthorized = true;
		}
		$scope.login = function() {
			auth.$authWithOAuthPopup("facebook")
				.then(function(authData) {
					console.log("Authenticated successfully with payload:", authData);
					$scope.isAuthorized = true;
				}, function(err) {
					console.log("Login Failed!", error);
				});
		};
		$scope.logout = function() {
			auth.$unauth();
			document.location = 'index.html';
		};
		 $scope.isActive = function(route) {
		 	return route === $location.path();
		};
	}])
//quest maker controller
	.controller("makerController", ["$scope", "$firebaseObject", "$firebaseAuth", "$routeParams", function($scope, $firebaseObject, $firebaseAuth, $routeParams) {
		var ref = new Firebase(FIREBASE_URL);
		var questsRef = ref.child('quests');
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		$scope.selectNode = function(i) {
			$scope.selectedNode = $scope._q.nodes[i];
		}

		if ($scope.authData) {
			$scope.isAuthorized = true;
			if ($routeParams.id) {
				$scope.thisQuest = questsRef.child($routeParams.id);
				$scope._q = $firebaseObject($scope.thisQuest);
				$scope._q.$loaded()
					.then(function() {
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					})
			} else {
				alertify.alert('Quest not found');
			}
		} else {
			alertify.alert('You\'re not logged in');
		}

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
				$scope._q.$save();
				alertify.alert('Successfully saved to server');
			}
		}
    $scope.add = function() {
		  if (!$scope._q) {
		    $scope._q = {nodes :[]};
		  };
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
		$scope.notRemoved = function(item) {
		    return !item.hide;
		};
		$scope.remove = function(i) {
			$scope._q.nodes[i].hide = true;
			$scope.selectedNode = null;
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
			$scope.renewGraph();
		}

		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		}

		$scope.renewGraph = function() {
			var qnodes = [];
			var qedges = [];
			if ($scope._q && $scope._q.nodes) {
				for (i = 0; i < $scope._q.nodes.length; ++i) {
					qnodes.push({data : { id : ''+i }});
					if ($scope._q.nodes[i].ways_ids) {
						for (j = 0; j < $scope._q.nodes[i].ways_ids.length; ++j) {
							qedges.push({data: { id: '' + i + j, weight: 1, source: '' + i, target: '' + $scope._q.nodes[i].ways_ids[j]}});
						}
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
		};
		
		$scope.$watch(
			function($scope){return $scope._q;},
			function(){if(typeof(cytoscape) !== 'undefined') $scope.renewGraph();},
			true
		);
		$scope.removeWay = function(nodeid, wayid) {
		  $scope._q.nodes[nodeid].ways.splice(wayid, 1);
		  $scope._q.nodes[nodeid].ways_ids.splice(wayid, 1);
		};
	}])
//quest viewer controller
	.controller("viewerController", ["$scope", "$http", "$firebaseArray", "$firebaseObject",  "$firebaseAuth", "$location", function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location) {
		if ($location.$$path === '/mynovels' && !$scope.isAuthorized) document.location = 'index.html';
		var ref = new Firebase(FIREBASE_URL);

		var questsRef = ref.child('quests');
		var viewsRef = ref.child('views');
		var ratingsRef = ref.child('ratings');
		$scope.allQuests = $firebaseArray(questsRef);
		$scope.viewsObject = $firebaseObject(viewsRef);
		$scope.ratingsObject = $firebaseObject(ratingsRef);

		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		itemsCount = 13;
		$scope.editQuest = function(id) {
		  $location.path('edit/' + id);
		};
		if ($scope.authData) {
			$scope.isAuthorized = true;
		}
		$scope.newQuest = function() {
			$scope.allQuests.$add({
				descr: '',
				is_public: false,
				nodes: [],
				title: 'Untitled',
				uid: $scope.authData.uid,
				views: 0
			}).then(function(ref) {
				var id = ref.key();
				$location.path('edit/' + id);
			});
		}
		$scope.addMoreItems = function() {
			itemsCount += 3;
			$('.quests').css('display', 'inline-block');
			$('.quests:nth-of-type(n+' + itemsCount + ')').css('display', 'none');
		}
		$scope.hideButtons = [false, false, false, false];
		$scope.chooseButtons = function() {
			if (!$scope.node.final)
				for (i = 0; i < 4; ++i)
					$scope.hideButtons[i] = ($scope.node.ways_ids[i] === undefined || $scope.node.ways_ids[i] === null);
		};
		$scope.buttonClick = function(i) {
			if (i != null) {
				$scope.node = $scope.quest.nodes[$scope.node.ways_ids[i]];
				$scope.chooseButtons();
				if ($scope.node.final) {
					$scope.incrementViews($scope.quest);
					$scope.showControlButtons = false;
					$scope.grats = true;
				}
			}
		};
		$scope.exit = function() {
			$scope.showRestartButton = false;
			$scope.grats = false;
			$scope.hideStart = false;
			$scope.showText = false;
			$scope.node.image = false;
		};
		$scope.restart = function() {
			$scope.node = $scope.quest.nodes[0];
			$scope.grats = false;
			$scope.showControlButtons = true;
			$scope.showRestartButton = false;
		}
		$scope.saved = function(savedQuest) {
			$scope.quest = savedQuest;
			$scope.node = savedQuest.nodes[0];
			$scope.hideStart = true;
			$scope.showControlButtons = true;
			$scope.showText = true;
			$scope.chooseButtons();
		};
		$scope.showContent = function($fileContent){
			$scope.str_quest = $fileContent;
		};
		$scope.getValue = function(value, key){
			return value[key];
		};
		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		};
		$scope.remove = function(quest) {
			$('.container.text-center').css({'-webkit-filter': 'blur(5px)', 'filter': 'blur(5px)'});
			$('#modal-remove').fadeIn();
			$scope.deletePretender = quest;
		};
		$scope.commit = function() {
		  $('.container.text-center').css({'-webkit-filter': 'none', 'filter': 'none'});
			$('#modal-remove').fadeOut();
			$scope.allQuests.$remove($scope.deletePretender);
		};
		$scope.cancel = function() {
      $('.container.text-center').css({'-webkit-filter': 'none', 'filter': 'none'});
			$('#modal-remove').fadeOut();
			$scope.deletePretender = null;
		}
		$scope.publish = function(quest) {
			quest.is_public = true;
			$scope.allQuests.$save(quest);
		};
		$scope.unpublish = function(quest) {
			quest.is_public = false;
			$scope.allQuests.$save(quest);
		};
		$scope.isActive = function(route) {
		 	return route === $location.path();
		};
		$scope.toRestart = function() {
			$scope.grats = false;
			$scope.hideStart = true;
			$scope.showRestartButton = true;
		};

		$scope.getViews = function(quest) {
			return $scope.viewsObject[quest.$id] || 0;
		};

		$scope.incrementViews = function(quest) {
			$scope.viewsObject[quest.$id] += 1;
			$scope.viewsObject.$save();
		};

		$scope.mainOrder = function(quest) {
			return -$scope.getViews(quest);
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
          var url = 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Tvnews_visual_wikipetan.png';
          element.prop('src', url);
        });
      }
    }
  });
