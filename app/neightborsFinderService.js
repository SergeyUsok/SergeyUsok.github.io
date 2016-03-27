function NeighborsFinder()
{
	this.getNeighbors = function(board, x, y) 
	{
		var neighbors = new Array();	
		
		for (xAccretion = -1; xAccretion < 2; xAccretion++)
		{
			for (yAccretion = -1; yAccretion < 2; yAccretion++)
			{
				// skip current cell
				if (xAccretion == 0 && yAccretion == 0)
					continue;

				var xNeighbor = x + xAccretion;
				var yNeighbor = y + yAccretion;

				if (neighborExists(xNeighbor, yNeighbor, board))
				{
					neighbors.push(board[yNeighbor][xNeighbor]);
				}
			}
		}
		
		return neighbors;
	}
								
	var neighborExists = function(xNeighbor, yNeighbor, board)
	{
		return yNeighbor < board.length
				&& yNeighbor >= 0 
				&& xNeighbor >= 0 
				&& xNeighbor < board[yNeighbor].length;
	}
}

angular.module('minesweeperGame')
	   .service('neighborsFinder', NeighborsFinder);