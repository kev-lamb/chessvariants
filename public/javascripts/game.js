var board = null
var game = new Chess(rules)
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var move_table = document.getElementById("moves")

var title = document.getElementById("title")
var variations = new Map([["standard", "Standard Game"],
                         ["bwpawn", "Backwards Pawn Moves"]]);

function settitle() {
  if(rules.includes('standard') ) {
    title.innerHTML = variations.get("standard")
  } else {
    let titlestring = "The following rule modifications are in effect: <ul>"
    for(rule of rules) {
      titlestring = titlestring.concat('<li>'+variations.get(rule)+'</li>')
    }
    titlestring = titlestring.concat("</ul>")
    title.innerHTML = titlestring
  }
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
  updatetable()
}

function updatetable() {
  mbody = document.getElementById("movebody");
  while(mbody.hasChildNodes()) {
    mbody.removeChild(mbody.firstChild);
  }
  let pgn = game.pgn().split(" ");
  console.log(pgn);
  //every trio of items in the pgn array denotes a move. We want to add it to the table
  let i = 0;
  while(i <= pgn.length - 2) {
    let move = mbody.insertRow(-1);
    let move_number = move.insertCell(0);
    let white_move = move.insertCell(1);
    let black_move = move.insertCell(2);

    move_number.innerHTML = pgn[i];
    white_move.innerHTML = pgn[i+1];
    black_move.innerHTML = pgn[i+2] ? pgn[i+2] : "";

    i = i+3;
  }

};

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('board', config)

updateStatus()

$('#startBtn').on('click', function(){
    board.start();
    game = new Chess();
    updateStatus();
});
