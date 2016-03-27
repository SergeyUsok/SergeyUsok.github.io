function GameController ($scope, gameFactory) 
{
	$scope.modes = [{
				  minesCount: 10,
				  name: 'Beginer',
				  width: 9,
				  height: 9
				}, {
				  minesCount: 40,
				  name: 'Middle',
				  width: 16,
				  height: 16
				},
				{
				  minesCount: 99,
				  name: 'Expert',
				  width: 30,
				  height: 16
				}];
	
	$scope.selectedMode = $scope.modes[0];
	
	// indicates whether mouse left button was down or up. 
	// needed for smile switching on the view
	$scope.isRisky = false; 
	
	$scope.newGame = function()
	{
		$scope.game = gameFactory.createGame($scope.selectedMode);
	}
	
	$scope.onDown = function($event)
	{
		// prevent right click
		if($event.button != 0)
			return;
		
		$scope.isRisky = true;
	}
	
	$scope.uncover = function($event, cell)
	{	
		// prevent right click
		if($event.button != 0)
			return;
		
		$scope.game.uncover(cell);
		cell.clicked = true;
		$scope.isRisky = false;
	}
	
	$scope.getContent = function(cell)
	{
		if($scope.game.hasLose && cell.flagged && !cell.hasMine)
			return ""; // show user crossed mine (wrong flagged cell) even if cell contains digit
		
		return cell.content;
	}
	
	$scope.newGame();
}

angular.module('minesweeperGame')
	   .controller('gameController', GameController);