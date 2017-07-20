/**
 * Created by kienpham on 7/20/17.
 */

$(document).ready(function () {
    var board,
        game = new Chess();

    /**
     * init board
     */
    var removeGreySquares = function () {
        $('#board .square-55d63').css('background', '');
    };

    var greySquare = function (square) {
        var squareEl = $('#board .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onDragStart = function (source, piece) {
        // do not pick up pieces if the game is over
        // or if it's not that side's turn
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };

    var onDrop = function (source, target) {
        removeGreySquares();

        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null) return 'snapback';

        // call AI
        makeBestMove();
    };

    var onMouseoverSquare = function (square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var onMouseoutSquare = function (square, piece) {
        removeGreySquares();
    };

    var onSnapEnd = function () {
        board.position(game.fen());
    };

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };

    /**
     * AI process
     */

    var makeBestMove = function () {
        // exit if the game is over
        if (game.game_over() === true ||
            game.in_draw() === true ||
            game.moves().length === 0) {
            alert('game over');
            return;
        }
        var nextMove = getBestMove();
        console.log(nextMove);
        game.move(nextMove);
        board.position(game.fen());
        // next turn
        // window.setTimeout(makeBestMove, 500);

    };

    var getBestMove = function () {
        var bestValue = -99999;
        var bestMove = null;
        var nextMoves = game.moves();
        for (var i = 0; i < nextMoves.length; i++) {
            game.move(nextMoves[i]);
            var boardValue = minimax(2, game, true);
            game.undo();
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = nextMoves[i];
            }
        }
        return bestMove;
    };

    var minimax = function (depth, game, alpha, beta, isMaximizingPlayer) {
        if (depth == 0 || game.game_over()) {
            return evaluateBoard(game.board());
        }
        var nextMoves = game.moves();

        if ( isMaximizingPlayer ) {
            var bestValue = -99999;
            for (var i = 0; i < nextMoves.length; i++) {
                game.move(nextMoves[i]);
                bestValue = Math.max(bestValue, minimax(depth-1, game, alpha, beta, !isMaximizingPlayer));
                game.undo();
                alpha = Math.max(alpha, bestValue);
                if (beta <= alpha){
                    return bestValue
                }
            }
            return bestValue;
        } else {
            var bestValue = 99999;
            for (var i = 0; i < nextMoves.length; i++) {
                game.move(nextMoves[i]);
                bestValue = Math.min(bestValue, minimax(depth-1, game, alpha, beta, !isMaximizingPlayer));
                game.undo();
                beta = Math.min(beta, bestValue);
                if (beta <= alpha) {
                    return bestValue;
                }
            }
            return bestValue;
        }
    };
    /**
     * get random move
     * @return {*}
     */
    var makeRandom = function () {
        var possibleMoves = game.moves();
        var randomIndex = Math.floor(Math.random() * possibleMoves.length);
        return possibleMoves[randomIndex];
    };

    /**
     * Tính tổng trọng số trên bàn cờ
     * @param  board
     * @return {number}
     */
    var evaluateBoard = function (board) {
        var evaluate = 0;
        for (var i = 0; i < 8; i++)
            for (var j = 0; j < 8; j++) {
                evaluate += getChessmanValue(board[i][j])
            }

        return evaluate;
    };

    /**
     * lấy giá trị của ô cờ
     * @param cell
     * @return {number}
     */
    var getChessmanValue = function (cell) {
        if (cell === null) return 0;
        var abs = cell.color === 'w' ? -1 : 1;
        switch (cell.type) {
            case 'p' :
                return 10 * abs;
            case 'n' :
            case 'b' :
                return 30 * abs;
            case 'r' :
                return 50 * abs;
            case 'q' :
                return 90 * abs;
            case 'k' :
                return 900 * abs;
        }
    };

    board = ChessBoard('board', cfg);
    // window.setTimeout(makeBestMove, 500);

});