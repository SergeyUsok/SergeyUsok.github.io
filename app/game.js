function Game(board, neighborsFinder, minesCount, $interval)
{
	var neighborsFinder = neighborsFinder;
	var uncoveredCellsCount = 0;
	var timerStarted = false;
	
	this.board = board;
	this.hasWon = false;
	this.hasLose = false;
	this.possibleRemainingMines = minesCount;
	this.elapsedTime = 0;
		
	this.uncover = function(cell)
	{		
		if(!timerStarted)
		{
			this.elapsedTime = 1; // initialize timer
			timerStarted = startTimer(this);
		}
	
		cell.uncovered = true;
		uncoveredCellsCount++;
		
		if(cell.hasMine)
		{
			this.hasLose = true;
			uncoverAllFail(board);
			return;
		}
		
		if(cell.content == '')
			autoUncover(cell);
		
		checkIfWon(this);
	}
	
	this.flag = function(cell)
	{
		if(!cell.uncovered && !this.hasWon)
		{
			cell.flagged = !cell.flagged;
		
			if(cell.flagged)
				this.possibleRemainingMines--;
			else
				this.possibleRemainingMines++;
		}
	}
  
	var autoUncover = function(cell)
	{
		// walking through cell neighbors and uncover emtpy cells
		for (var neighbor of neighborsFinder.getNeighbors(board, cell.x, cell.y))
		{
			// do not process uncovered cells in order to avoid stack overflow exception
			if(neighbor.uncovered || neighbor.flagged)
				continue;
			
			neighbor.uncovered = true;
			uncoveredCellsCount++;
			
			if(neighbor.content == '' && !neighbor.hasMine)
				autoUncover(neighbor);
		}
	}
	
	var uncoverAllFail = function(board)
	{
		for(i = 0; i < board.length; i++)
		{
			for(j = 0; j < board[i].length; j++)
			{
				board[i][j].uncovered = true;
			}
		}
	}
	
	var uncoverAllWin = function(board)
	{
		for(i = 0; i < board.length; i++)
		{
			for(j = 0; j < board[i].length; j++)
			{
				if(board[i][j].hasMine)
				{
					board[i][j].flagged = true;
					continue;
				}
					
				board[i][j].uncovered = true;
			}
		}
	}
	
	var checkIfWon = function(that)
	{
		var remainingCells = board.length * board[0].length - uncoveredCellsCount;
	
		if(remainingCells == minesCount)
		{
			uncoverAllWin(board);
			that.hasWon = true;
			that.possibleRemainingMines = 0;
		}
	}
	
	var startTimer = function(that)
	{
		var stop = $interval(function() {
			
					if(that.hasWon || that.hasLose)
					{
						$interval.cancel(stop);
						return false;							
					}
					
					that.elapsedTime++;
		}, 1000);
		
		return true;					
	};
}

angular.module('minesweeperGame')
	   .factory('gameFactory', function($interval, neighborsFinder, gameBoardProvider) {
		   return {
			   createGame: function(mode) {
					var board = gameBoardProvider.getGameBoard(mode.width, mode.height, mode.minesCount);
					return new Game(board, neighborsFinder, mode.minesCount, $interval);
			   }
		   }
	   });



