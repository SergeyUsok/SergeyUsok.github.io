function GameBoardProvider(neighborsFinder)
{
	this.getGameBoard = function(width, height, minesCount)
	{
		var emptyBoard = createEmptyBoard(width, height);
		
		var boardWithMines = populateboardWithMines(emptyBoard, minesCount);
		
		return getCompletedBoard(boardWithMines);
	}
	
	var createEmptyBoard = function(width, height)
	{
		var board = new Array();
	
		for(i = 0; i < height; i++)
		{
			var row = new Array();
		
			for(j = 0; j < width; j++)
			{
				row.push({x:j, y:i, content:'', uncovered:false, hasMine:false, flagged:false});
			}
			
			board.push(row);
		}
		
		return board;
	}
	
	var populateboardWithMines = function(board, minesCount)
	{
		for(i = 0; i < minesCount; i++)
		{
			var y = Math.floor((Math.random() * board.length));
			var x = Math.floor((Math.random() * board[0].length));
			
			// if the randomly choosen cell already contains mine 
			// continue walk through cells until empty cell will be found.  
			while(board[y][x].hasMine)
			{
				y = Math.floor((Math.random() * board.length));
				x = Math.floor((Math.random() * board[0].length));
			}
			
			board[y][x].hasMine = true;
		}
		
		return board;
	}
	
	var getCompletedBoard = function(board)
	{
		for(i = 0; i < board.length; i++)
		{
			for(j = 0; j < board[i].length; j++)
			{
				if(board[i][j].hasMine)
					continue;
					
				board[i][j].content = countBombsAroundCell(j, i, board);
			}
		}
		
		return board;
	}
	
	var countBombsAroundCell = function(x, y, board)
	{
		minesCount = 0;

		// walking through cell neighbors and uncover emtpy cells
		var neighbors = neighborsFinder.getNeighbors(board, x, y);
		for (var i = 0; i < neighbors.length; i++)
		{
			if(neighbors[i].hasMine)
				minesCount++;
		}
		
		return minesCount == 0 ? "" : minesCount;
	}
}

angular.module('minesweeperGame')
	   .service('gameBoardProvider', GameBoardProvider);