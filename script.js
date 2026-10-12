const PIECES = { KING: 'k', QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n', PAWN: 'p' };
const COLORS = { WHITE: 'w', BLACK: 'b' };
const FILES = 'abcdefgh';

const PIECE_UNICODE = {
  'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
  'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
};

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [ 20, 30, 10,  0,  0, 10, 30, 20],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30]
  ]
};

let state = {};

function initState() {
  state = {
    board: createInitialBoard(),
    turn: COLORS.WHITE,
    castling: { wk: true, wq: true, bk: true, bq: true },
    enPassant: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    history: [],
    captured: { w: [], b: [] },
    gameOver: false,
    gameResult: null,
    drawReason: null,
    selected: null,
    legalMoves: [],
    lastMove: null,
    aiEnabled: false,
    aiThinking: false,
    aiColor: COLORS.BLACK,
    humanColor: COLORS.WHITE,
    aiDepth: 3,
    soundEnabled: true,
    promotionPending: null,
    undoStack: [],
    positionHistory: []
  };
}

function createInitialBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRank = [PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN, PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: COLORS.BLACK };
    board[1][c] = { type: PIECES.PAWN, color: COLORS.BLACK };
    board[6][c] = { type: PIECES.PAWN, color: COLORS.WHITE };
    board[7][c] = { type: backRank[c], color: COLORS.WHITE };
  }
  return board;
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function getPieceAt(row, col) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return state.board[row][col];
}

function setPieceAt(row, col, piece) {
  state.board[row][col] = piece;
}

function findKing(color, board) {
  board = board || state.board;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === PIECES.KING && p.color === color) return { row: r, col: c };
    }
  }
  return null;
}

function isInBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function toAlgebraic(row, col) {
  return FILES[col] + (8 - row);
}

function fromAlgebraic(sq) {
  return { row: 8 - parseInt(sq[1]), col: FILES.indexOf(sq[0]) };
}

function sameColor(a, b) {
  return a && b && a.color === b.color;
}

function enemyColor(color) {
  return color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
}

function isSquareAttacked(board, row, col, byColor) {
  return isSquareAttackedForBoard(board, row, col, byColor);
}

function isInCheck(color, board) {
  board = board || state.board;
  const king = findKing(color, board);
  if (!king) return false;
  return isSquareAttacked(board, king.row, king.col, enemyColor(color));
}

function getRawMoves(board, row, col, piece) {
  if (!piece) return [];
  const { type, color } = piece;
  const moves = [];
  const enemy = enemyColor(color);
  const addMove = (tr, tc) => {
    if (isInBounds(tr, tc)) {
      const target = board[tr][tc];
      if (!target || target.color === enemy) {
        moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc, capture: !!target });
      }
    }
  };
  const addSliding = (dirs) => {
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (isInBounds(r, c)) {
        const target = board[r][c];
        if (target) {
          if (target.color === enemy) moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, capture: true });
          break;
        }
        moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, capture: false });
        r += dr; c += dc;
      }
    }
  };
  switch (type) {
    case PIECES.PAWN: {
      const dir = color === COLORS.WHITE ? -1 : 1;
      const startRow = color === COLORS.WHITE ? 6 : 1;
      const promoRow = color === COLORS.WHITE ? 0 : 7;
      const nr = row + dir;
      if (isInBounds(nr, col) && !board[nr][col]) {
        if (nr === promoRow) {
          for (const pt of [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, capture: false, promotion: pt });
          }
        } else {
          moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, capture: false });
        }
        if (row === startRow) {
          const nr2 = row + 2 * dir;
          if (!board[nr2][col]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr2, toCol: col, capture: false, doublePawn: true });
          }
        }
      }
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color === enemy) {
            if (nr === promoRow) {
              for (const pt of [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT]) {
                moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true, promotion: pt });
              }
            } else {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true });
            }
          }
          if (state.enPassant && nr === state.enPassant.row && nc === state.enPassant.col) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true, enPassant: true });
          }
        }
      }
      break;
    }
    case PIECES.KNIGHT: {
      const knightDirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of knightDirs) addMove(row + dr, col + dc);
      break;
    }
    case PIECES.BISHOP: addSliding([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
    case PIECES.ROOK: addSliding([[-1,0],[1,0],[0,-1],[0,1]]); break;
    case PIECES.QUEEN: addSliding([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); break;
    case PIECES.KING: {
      const kingDirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of kingDirs) addMove(row + dr, col + dc);
      const kingRow = color === COLORS.WHITE ? 7 : 0;
      if (row === kingRow && col === 4) {
        if ((color === COLORS.WHITE ? state.castling.wk : state.castling.bk) &&
            !board[kingRow][5] && !board[kingRow][6] &&
            board[kingRow][7] && board[kingRow][7].type === PIECES.ROOK && board[kingRow][7].color === color &&
            !isSquareAttacked(board, kingRow, 4, enemy) &&
            !isSquareAttacked(board, kingRow, 5, enemy) &&
            !isSquareAttacked(board, kingRow, 6, enemy)) {
          moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 6, castling: 'k' });
        }
        if ((color === COLORS.WHITE ? state.castling.wq : state.castling.bq) &&
            !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1] &&
            board[kingRow][0] && board[kingRow][0].type === PIECES.ROOK && board[kingRow][0].color === color &&
            !isSquareAttacked(board, kingRow, 4, enemy) &&
            !isSquareAttacked(board, kingRow, 3, enemy) &&
            !isSquareAttacked(board, kingRow, 2, enemy)) {
          moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 2, castling: 'q' });
        }
      }
      break;
    }
  }
  return moves;
}

function getLegalMovesForSquare(row, col) {
  const piece = state.board[row][col];
  if (!piece) return [];
  const raw = getRawMoves(state.board, row, col, piece);
  return raw.filter(m => {
    const testBoard = cloneBoard(state.board);
    const testState = {
      board: testBoard,
      enPassant: state.enPassant,
      castling: { ...state.castling }
    };
    applyMoveRaw(testBoard, m, testState);
    return !isInCheck(piece.color, testBoard);
  });
}

function getAllLegalMoves(color) {
  color = color || state.turn;
  const all = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p && p.color === color) {
        const moves = getLegalMovesForSquare(r, c);
        all.push(...moves);
      }
    }
  }
  return all;
}

function applyMoveRaw(board, move, auxState) {
  const { fromRow, fromCol, toRow, toCol, promotion, enPassant, castling, doublePawn } = move;
  const piece = board[fromRow][fromCol];
  if (!piece) return;
  board[toRow][toCol] = { ...piece };
  board[fromRow][fromCol] = null;
  if (promotion) {
    board[toRow][toCol] = { type: promotion, color: piece.color };
  }
  if (enPassant) {
    board[fromRow][toCol] = null;
  }
  if (castling) {
    const kingRow = piece.color === COLORS.WHITE ? 7 : 0;
    if (castling === 'k') {
      board[kingRow][5] = board[kingRow][7];
      board[kingRow][7] = null;
    } else {
      board[kingRow][3] = board[kingRow][0];
      board[kingRow][0] = null;
    }
  }
  if (doublePawn) {
    auxState.enPassant = { row: (fromRow + toRow) / 2, col: fromCol };
  } else {
    auxState.enPassant = null;
  }
  if (piece.type === PIECES.KING) {
    if (piece.color === COLORS.WHITE) { auxState.castling.wk = false; auxState.castling.wq = false; }
    else { auxState.castling.bk = false; auxState.castling.bq = false; }
  }
  if (piece.type === PIECES.ROOK) {
    if (fromRow === 7 && fromCol === 0) auxState.castling.wq = false;
    if (fromRow === 7 && fromCol === 7) auxState.castling.wk = false;
    if (fromRow === 0 && fromCol === 0) auxState.castling.bq = false;
    if (fromRow === 0 && fromCol === 7) auxState.castling.bk = false;
  }
  // Revoke castling rights if a rook is captured from its starting square
  if (toRow === 7 && toCol === 0) auxState.castling.wq = false;
  if (toRow === 7 && toCol === 7) auxState.castling.wk = false;
  if (toRow === 0 && toCol === 0) auxState.castling.bq = false;
  if (toRow === 0 && toCol === 7) auxState.castling.bk = false;
}

function getPositionKey(board, turn, castling, enPassant) {
  let key = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      key += p ? p.color + p.type : '.';
    }
  }
  key += turn;
  key += (castling.wk ? 'K' : '') + (castling.wq ? 'Q' : '') + (castling.bk ? 'k' : '') + (castling.bq ? 'q' : '');
  key += enPassant ? toAlgebraic(enPassant.row, enPassant.col) : '-';
  return key;
}

function saveSnapshot() {
  return {
    board: cloneBoard(state.board),
    turn: state.turn,
    castling: { ...state.castling },
    enPassant: state.enPassant ? { ...state.enPassant } : null,
    halfMoveClock: state.halfMoveClock,
    fullMoveNumber: state.fullMoveNumber,
    history: [...state.history],
    captured: { w: [...state.captured.w], b: [...state.captured.b] },
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    gameOver: state.gameOver,
    gameResult: state.gameResult,
    drawReason: state.drawReason,
    positionHistory: [...state.positionHistory]
  };
}

function restoreSnapshot(snap) {
  state.board = cloneBoard(snap.board);
  state.turn = snap.turn;
  state.castling = { ...snap.castling };
  state.enPassant = snap.enPassant ? { ...snap.enPassant } : null;
  state.halfMoveClock = snap.halfMoveClock;
  state.fullMoveNumber = snap.fullMoveNumber;
  state.history = [...snap.history];
  state.captured = { w: [...snap.captured.w], b: [...snap.captured.b] };
  state.lastMove = snap.lastMove ? { ...snap.lastMove } : null;
  state.gameOver = snap.gameOver;
  state.gameResult = snap.gameResult;
  state.drawReason = snap.drawReason;
  state.positionHistory = [...snap.positionHistory];
  state.selected = null;
  state.legalMoves = [];
}

function makeMove(move, promotionChoice) {
  const { fromRow, fromCol, toRow, toCol, promotion, enPassant, castling, capture } = move;
  const piece = state.board[fromRow][fromCol];
  const captured = state.board[toRow][toCol];

  state.undoStack.push(saveSnapshot());

  if (enPassant) {
    const epCaptured = state.board[fromRow][toCol];
    if (epCaptured) state.captured[state.turn].push(epCaptured);
  }
  if (capture) {
    if (captured) state.captured[state.turn].push(captured);
  }

  const finalPromotion = promotionChoice || promotion || null;
  const moveToApply = { ...move, promotion: finalPromotion };

  applyMoveRaw(state.board, moveToApply, state);

  if (piece.type === PIECES.KING) {
    if (piece.color === COLORS.WHITE) { state.castling.wk = false; state.castling.wq = false; }
    else { state.castling.bk = false; state.castling.bq = false; }
  }
  if (piece.type === PIECES.ROOK) {
    if (fromRow === 7 && fromCol === 0) state.castling.wq = false;
    if (fromRow === 7 && fromCol === 7) state.castling.wk = false;
    if (fromRow === 0 && fromCol === 0) state.castling.bq = false;
    if (fromRow === 0 && fromCol === 7) state.castling.bk = false;
  }
  const rookCols = { 'k': 7, 'q': 0 };
  if (castling && rookCols[castling] !== undefined) {
    const row = piece.color === COLORS.WHITE ? 7 : 0;
    if (row === 7 && rookCols[castling] === 7) state.castling.wk = false;
    if (row === 7 && rookCols[castling] === 0) state.castling.wq = false;
    if (row === 0 && rookCols[castling] === 7) state.castling.bk = false;
    if (row === 0 && rookCols[castling] === 0) state.castling.bq = false;
  }

  state.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };

  const notation = buildNotation(move, piece, captured, finalPromotion);
  state.history.push(notation);

  state.turn = enemyColor(state.turn);
  if (state.turn === COLORS.WHITE) state.fullMoveNumber++;
  if (piece.type === PIECES.PAWN || capture) state.halfMoveClock = 0;
  else state.halfMoveClock++;

  state.selected = null;
  state.legalMoves = [];

  const posKey = getPositionKey(state.board, state.turn, state.castling, state.enPassant);
  state.positionHistory.push(posKey);

  const opponent = state.turn;
  const allMoves = getAllLegalMoves(opponent);
  const inCheck = isInCheck(opponent);

  if (inCheck && allMoves.length === 0) {
    state.gameOver = true;
    state.gameResult = enemyColor(opponent) === COLORS.WHITE ? '1-0' : '0-1';
    state.drawReason = null;
    playSound('mate');
  } else if (!inCheck && allMoves.length === 0) {
    state.gameOver = true;
    state.gameResult = '½-½';
    state.drawReason = 'stalemate';
    playSound('draw');
  } else if (state.positionHistory.filter(k => k === posKey).length >= 3) {
    state.gameOver = true;
    state.gameResult = '½-½';
    state.drawReason = 'repetition';
    playSound('draw');
  } else if (state.halfMoveClock >= 100) {
    state.gameOver = true;
    state.gameResult = '½-½';
    state.drawReason = 'fifty';
    playSound('draw');
  } else if (isDrawByMaterial()) {
    state.gameOver = true;
    state.gameResult = '½-½';
    state.drawReason = 'material';
    playSound('draw');
  } else if (inCheck) {
    playSound('check');
  } else if (capture || enPassant) {
    playSound('capture');
  } else {
    playSound('move');
  }

  render();
  afterMove();
}

function afterMove() {
  if (state.gameOver) {
    showGameOver();
    return;
  }
  if (state.aiEnabled && state.turn === state.aiColor && !state.aiThinking) {
    state.aiThinking = true;
    document.getElementById('aiThinking').classList.remove('hidden');
    setTimeout(() => {
      let move = findBestMove(state.aiDepth);
      if (move && move.promotion) {
        move = { ...move, promotion: PIECES.QUEEN };
      }
      state.aiThinking = false;
      document.getElementById('aiThinking').classList.add('hidden');
      if (move) makeMove(move);
    }, 100);
  }
}

function buildNotation(move, piece, captured, promotion) {
  const { fromRow, fromCol, toRow, toCol, castling } = move;
  if (castling) return castling === 'k' ? 'O-O' : 'O-O-O';
  let n = '';
  if (piece.type === PIECES.PAWN) {
    if (captured || move.enPassant) n = FILES[fromCol] + 'x';
    n += toAlgebraic(toRow, toCol);
    if (move.enPassant) n += ' e.p.';
  } else {
    const sym = piece.type.toUpperCase();
    n += sym;
    if (captured) n += 'x';
    n += toAlgebraic(toRow, toCol);
  }
  if (promotion) n += '=' + promotion.toUpperCase();
  return n;
}

const DRAW_MESSAGES = {
  stalemate: 'Ahogado — el rey no está en jaque y no tiene movimientos legales.',
  fifty: 'Tablas por la regla de los 50 movimientos.',
  material: 'Tablas por material insuficiente.',
  repetition: 'Tablas por triple repetición de posición.'
};

function showGameOver() {
  const dialog = document.getElementById('gameOverDialog');
  const title = document.getElementById('gameOverTitle');
  const msg = document.getElementById('gameOverMessage');
  if (state.gameResult === '1-0') {
    title.textContent = '¡Ganan las blancas!';
    msg.textContent = 'Jaque mate';
  } else if (state.gameResult === '0-1') {
    title.textContent = '¡Ganan las negras!';
    msg.textContent = 'Jaque mate';
  } else {
    title.textContent = 'Tablas';
    msg.textContent = DRAW_MESSAGES[state.drawReason] || 'La partida terminó en tablas.';
  }
  dialog.classList.remove('hidden');
}

function isDrawByMaterial() {
  let pieces = { w: [], b: [] };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p) pieces[p.color].push(p.type);
    }
  }

  const whitePieces = pieces[COLORS.WHITE].filter(p => p !== PIECES.KING);
  const blackPieces = pieces[COLORS.BLACK].filter(p => p !== PIECES.KING);

  // King vs King
  if (whitePieces.length === 0 && blackPieces.length === 0) return true;

  // King and Bishop vs King, or King and Knight vs King
  if (whitePieces.length === 1 && blackPieces.length === 0) {
    const pieceType = whitePieces[0];
    return pieceType === PIECES.BISHOP || pieceType === PIECES.KNIGHT;
  }
  if (blackPieces.length === 1 && whitePieces.length === 0) {
    const pieceType = blackPieces[0];
    return pieceType === PIECES.BISHOP || pieceType === PIECES.KNIGHT;
  }

  // King and Bishop vs King and Bishop (same color squares)
  if (whitePieces.length === 1 && blackPieces.length === 1) {
    const wP = whitePieces[0];
    const bP = blackPieces[0];
    if (wP === PIECES.BISHOP && bP === PIECES.BISHOP) {
      const wB = findPiece(COLORS.WHITE, PIECES.BISHOP, state.board);
      const bB = findPiece(COLORS.BLACK, PIECES.BISHOP, state.board);
      if (wB && bB) {
        return ((wB.row + wB.col) % 2) === ((bB.row + bB.col) % 2);
      }
    }
  }

  return false;
}

function findPiece(color, type, board) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === type) return { row: r, col: c };
    }
  }
  return null;
}

let audioCtx = null;

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const freqs = { move: 440, capture: 330, check: 550, mate: 220, draw: 392 };
    osc.frequency.value = freqs[type] || 440;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (_) { /* audio no disponible */ }
}

function evaluateBoard(board, color) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUES[p.type] || 0;
      const pst = PST[p.type];
      let posVal = 0;
      if (pst) {
        const pr = p.color === COLORS.WHITE ? r : 7 - r;
        const pc = p.color === COLORS.WHITE ? c : 7 - c;
        posVal = pst[pr][pc];
      }
      if (p.color === color) score += val + posVal;
      else score -= val + posVal;
    }
  }
  return score;
}

function orderMoves(moves, board) {
  return moves.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    if (a.capture) {
      const target = board[a.toRow][a.toCol];
      if (target) scoreA += PIECE_VALUES[target.type] - PIECE_VALUES[board[a.fromRow][a.fromCol].type] / 100;
    }
    if (b.capture) {
      const target = board[b.toRow][b.toCol];
      if (target) scoreB += PIECE_VALUES[target.type] - PIECE_VALUES[board[b.fromRow][b.fromCol].type] / 100;
    }
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });
}

function getAllLegalMovesForBoard(board, color, castlingRights, enPassantTarget) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      const raw = getRawMovesForBoard(board, r, c, p, castlingRights, enPassantTarget);
      for (const m of raw) {
        const testBoard = cloneBoard(board);
        const testState = { board: testBoard, enPassant: enPassantTarget, castling: { ...castlingRights } };
        applyMoveRaw(testBoard, m, testState);
        if (!isInCheckForBoard(testBoard, color)) {
          moves.push(m);
        }
      }
    }
  }
  return moves;
}

function getRawMovesForBoard(board, row, col, piece, castlingRights, enPassantTarget) {
  if (!piece) return [];
  const { type, color } = piece;
  const moves = [];
  const enemy = enemyColor(color);
  const addMove = (tr, tc) => {
    if (isInBounds(tr, tc)) {
      const target = board[tr][tc];
      if (!target || target.color === enemy) {
        moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc, capture: !!target });
      }
    }
  };
  const addSliding = (dirs) => {
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (isInBounds(r, c)) {
        const target = board[r][c];
        if (target) {
          if (target.color === enemy) moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, capture: true });
          break;
        }
        moves.push({ fromRow: row, fromCol: col, toRow: r, toCol: c, capture: false });
        r += dr; c += dc;
      }
    }
  };
  switch (type) {
    case PIECES.PAWN: {
      const dir = color === COLORS.WHITE ? -1 : 1;
      const startRow = color === COLORS.WHITE ? 6 : 1;
      const promoRow = color === COLORS.WHITE ? 0 : 7;
      const nr = row + dir;
      if (isInBounds(nr, col) && !board[nr][col]) {
        if (nr === promoRow) {
          for (const pt of [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, capture: false, promotion: pt });
          }
        } else {
          moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: col, capture: false });
        }
        if (row === startRow) {
          const nr2 = row + 2 * dir;
          if (!board[nr2][col]) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr2, toCol: col, capture: false, doublePawn: true });
          }
        }
      }
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color === enemy) {
            if (nr === promoRow) {
              for (const pt of [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT]) {
                moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true, promotion: pt });
              }
            } else {
              moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true });
            }
          }
          if (enPassantTarget && nr === enPassantTarget.row && nc === enPassantTarget.col) {
            moves.push({ fromRow: row, fromCol: col, toRow: nr, toCol: nc, capture: true, enPassant: true });
          }
        }
      }
      break;
    }
    case PIECES.KNIGHT: {
      const knightDirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of knightDirs) addMove(row + dr, col + dc);
      break;
    }
    case PIECES.BISHOP: addSliding([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
    case PIECES.ROOK: addSliding([[-1,0],[1,0],[0,-1],[0,1]]); break;
    case PIECES.QUEEN: addSliding([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]); break;
    case PIECES.KING: {
      const kingDirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of kingDirs) addMove(row + dr, col + dc);
      const kingRow = color === COLORS.WHITE ? 7 : 0;
      if (row === kingRow && col === 4) {
        if ((color === COLORS.WHITE ? castlingRights.wk : castlingRights.bk) &&
            !board[kingRow][5] && !board[kingRow][6] &&
            board[kingRow][7] && board[kingRow][7].type === PIECES.ROOK && board[kingRow][7].color === color &&
            !isSquareAttackedForBoard(board, kingRow, 4, enemy) &&
            !isSquareAttackedForBoard(board, kingRow, 5, enemy) &&
            !isSquareAttackedForBoard(board, kingRow, 6, enemy)) {
          moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 6, castling: 'k' });
        }
        if ((color === COLORS.WHITE ? castlingRights.wq : castlingRights.bq) &&
            !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1] &&
            board[kingRow][0] && board[kingRow][0].type === PIECES.ROOK && board[kingRow][0].color === color &&
            !isSquareAttackedForBoard(board, kingRow, 4, enemy) &&
            !isSquareAttackedForBoard(board, kingRow, 3, enemy) &&
            !isSquareAttackedForBoard(board, kingRow, 2, enemy)) {
          moves.push({ fromRow: row, fromCol: col, toRow: kingRow, toCol: 2, castling: 'q' });
        }
      }
      break;
    }
  }
  return moves;
}

function isSquareAttackedForBoard(board, row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== byColor) continue;
      const attacks = getRawMovesForBoard(board, r, c, p, { wk: false, wq: false, bk: false, bq: false }, null);
      if (attacks.some(m => m.toRow === row && m.toCol === col)) return true;
    }
  }
  return false;
}

function isInCheckForBoard(board, color) {
  const king = findKing(color, board);
  if (!king) return true;
  return isSquareAttackedForBoard(board, king.row, king.col, enemyColor(color));
}

function minimax(board, depth, alpha, beta, isMaximizing, color, castlingRights, enPassantTarget) {
  if (depth === 0) {
    return { score: evaluateBoard(board, color) };
  }
  const currentColor = isMaximizing ? color : enemyColor(color);
  const moves = getAllLegalMovesForBoard(board, currentColor, castlingRights, enPassantTarget);
  if (moves.length === 0) {
    if (isInCheckForBoard(board, currentColor)) {
      return { score: isMaximizing ? -99999 + depth : 99999 - depth };
    }
    return { score: 0 };
  }
  const ordered = orderMoves(moves, board);
  let bestMove = ordered[0];
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of ordered) {
      const newBoard = cloneBoard(board);
      const newCastling = { ...castlingRights };
      const newAux = { board: newBoard, enPassant: enPassantTarget, castling: newCastling };
      applyMoveRaw(newBoard, move, newAux);
      const promoColor = currentColor;
      const result = minimax(newBoard, depth - 1, alpha, beta, false, color, newCastling, newAux.enPassant);
      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, maxEval);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of ordered) {
      const newBoard = cloneBoard(board);
      const newCastling = { ...castlingRights };
      const newAux = { board: newBoard, enPassant: enPassantTarget, castling: newCastling };
      applyMoveRaw(newBoard, move, newAux);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, color, newCastling, newAux.enPassant);
      if (result.score < minEval) {
        minEval = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, minEval);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function findBestMove(depth) {
  const board = cloneBoard(state.board);
  const aiColor = state.aiColor;
  const isMax = state.turn === aiColor;
  const result = minimax(board, depth, -Infinity, Infinity, isMax, aiColor, { ...state.castling }, state.enPassant);
  return result.move || null;
}

function render() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  const inCheck = isInCheck(state.turn);
  const kingPos = findKing(state.turn);
  const flip = state.humanColor === COLORS.BLACK && state.aiEnabled;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const displayRow = flip ? 7 - r : r;
      const displayCol = flip ? 7 - c : c;
      const sq = document.createElement('div');
      sq.className = 'square ' + ((displayRow + displayCol) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.row = r;
      sq.dataset.col = c;

      if (state.lastMove) {
        const lm = state.lastMove;
        if ((lm.from.row === r && lm.from.col === c) || (lm.to.row === r && lm.to.col === c)) {
          sq.classList.add('last-move');
        }
      }

      if (state.selected && state.selected.row === r && state.selected.col === c) {
        sq.classList.add('selected');
      }

      if (inCheck && kingPos && kingPos.row === r && kingPos.col === c) {
        sq.classList.add('check');
      }

      if (state.legalMoves.some(m => m.toRow === r && m.toCol === c)) {
        const isCapture = state.legalMoves.some(m => m.toRow === r && m.toCol === c && m.capture);
        sq.classList.add(isCapture ? 'valid-capture' : 'valid-move');
      }

      const piece = state.board[r][c];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'piece ' + (piece.color === COLORS.WHITE ? 'white-piece' : 'black-piece');
        span.draggable = (piece.color === state.turn && !state.gameOver);
        span.addEventListener('dragstart', (e) => {
          selectPiece(r, c);
          e.dataTransfer.setData('text/plain', `${r},${c}`);
        });
        if (state.lastMove && state.lastMove.to.row === r && state.lastMove.to.col === c) {
          span.classList.add('just-moved');
        }
        span.textContent = PIECE_UNICODE[piece.color + piece.type];
        sq.appendChild(span);
      }

      sq.addEventListener('dragover', (e) => e.preventDefault());
      sq.addEventListener('drop', (e) => {
        e.preventDefault();
        handleSquareClick(r, c);
      });
      sq.addEventListener('click', () => handleSquareClick(r, c));
      boardEl.appendChild(sq);
    }
  }
  renderCoords(flip);
  updateStatus();
  updateHistory();
  updateCaptured();
  document.getElementById('undoBtn').disabled = state.undoStack.length === 0;
}

function renderCoords(flip) {
  const files = flip ? 'hgfedcba' : 'abcdefgh';
  const ranks = flip ? '12345678' : '87654321';
  const top = document.getElementById('fileCoordsTop');
  const bottom = document.getElementById('fileCoordsBottom');
  const left = document.getElementById('rankCoordsLeft');
  const right = document.getElementById('rankCoordsRight');
  top.textContent = [...files].join(' ');
  bottom.textContent = [...files].join(' ');
  left.innerHTML = [...ranks].map(n => `<span>${n}</span>`).join('');
  right.innerHTML = [...ranks].map(n => `<span>${n}</span>`).join('');
}

function handleSquareClick(row, col) {
  if (state.gameOver) return;
  if (state.aiEnabled && state.turn === state.aiColor) return;
  if (state.aiThinking) return;

  const piece = state.board[row][col];

  if (state.selected) {
    const matches = state.legalMoves.filter(m => m.toRow === row && m.toCol === col);
    if (matches.length > 0) {
      const hasPromotion = matches.some(m => m.promotion);
      if (hasPromotion) {
        showPromotionDialog(matches);
        return;
      }
      makeMove(matches[0]);
      return;
    }
    if (piece && piece.color === state.turn) {
      selectPiece(row, col);
      return;
    }
    state.selected = null;
    state.legalMoves = [];
    render();
    return;
  }

  if (piece && piece.color === state.turn) {
    selectPiece(row, col);
  }
}

function selectPiece(row, col) {
  state.selected = { row, col };
  state.legalMoves = getLegalMovesForSquare(row, col);
  render();
}

function showPromotionDialog(moves) {
  const dialog = document.getElementById('promotionDialog');
  const choices = document.getElementById('promotionChoices');
  choices.innerHTML = '';
  dialog.classList.remove('hidden');

  const color = state.board[moves[0].fromRow][moves[0].fromCol].color;
  for (const pt of [PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT]) {
    const btn = document.createElement('button');
    btn.className = 'promotion-choice';
    btn.textContent = PIECE_UNICODE[color + pt];
    btn.addEventListener('click', () => {
      dialog.classList.add('hidden');
      const move = moves.find(m => m.promotion === pt);
      if (move) {
        makeMove(move);
      }
    });
    choices.appendChild(btn);
  }
}

function updateStatus() {
  const el = document.getElementById('status');
  if (state.gameOver) {
    if (state.gameResult === '1-0') el.textContent = 'Ganan las blancas';
    else if (state.gameResult === '0-1') el.textContent = 'Ganan las negras';
    else el.textContent = 'Tablas';
    el.style.color = '#ffd700';
    return;
  }
  const turnName = state.turn === COLORS.WHITE ? 'Blancas' : 'Negras';
  if (isInCheck(state.turn)) {
    el.textContent = 'Jaque - Turno de ' + turnName;
    el.style.color = '#ff6666';
  } else {
    el.textContent = 'Turno de ' + turnName;
    el.style.color = '#eee';
  }
}

function updateHistory() {
  const el = document.getElementById('moveHistory');
  if (state.history.length === 0) {
    el.innerHTML = '<div class="empty-history">Aún no hay movimientos</div>';
    return;
  }
  let html = '';
  for (let i = 0; i < state.history.length; i += 2) {
    const num = Math.floor(i / 2) + 1;
    html += `<div class="move-entry">`;
    html += `<span class="move-number">${num}.</span>`;
    html += `<span class="move-white">${state.history[i]}</span>`;
    if (state.history[i + 1]) {
      html += `<span class="move-black">${state.history[i + 1]}</span>`;
    }
    html += `</div>`;
  }
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

function updateCaptured() {
  const wEl = document.getElementById('captured-white');
  const bEl = document.getElementById('captured-black');
  wEl.textContent = state.captured.w.map(p => PIECE_UNICODE[p.color + p.type]).join(' ');
  bEl.textContent = state.captured.b.map(p => PIECE_UNICODE[p.color + p.type]).join(' ');
}

function undoMove() {
  if (state.undoStack.length === 0 || state.aiThinking) return;
  document.getElementById('gameOverDialog').classList.add('hidden');
  restoreSnapshot(state.undoStack.pop());
  render();
}

function newGame() {
  document.getElementById('gameOverDialog').classList.add('hidden');
  document.getElementById('promotionDialog').classList.add('hidden');
  document.getElementById('aiThinking').classList.add('hidden');

  const aiEnabled = document.getElementById('aiToggle').checked;
  const aiDepth = parseInt(document.getElementById('aiDepth').value, 10);
  const humanColor = document.getElementById('humanColor').value;
  const soundEnabled = document.getElementById('soundToggle').checked;

  state.aiThinking = false;
  initState();
  state.aiEnabled = aiEnabled;
  state.aiDepth = aiDepth;
  state.humanColor = humanColor;
  state.aiColor = humanColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  state.soundEnabled = soundEnabled;
  state.positionHistory.push(getPositionKey(state.board, state.turn, state.castling, state.enPassant));
  render();
  if (state.aiEnabled && state.turn === state.aiColor) afterMove();
}

function toggleAI() {
  state.aiEnabled = document.getElementById('aiToggle').checked;
  document.getElementById('aiOptions').classList.toggle('hidden', !state.aiEnabled);
  state.humanColor = document.getElementById('humanColor').value;
  state.aiColor = state.humanColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  state.aiDepth = parseInt(document.getElementById('aiDepth').value, 10);
  if (state.aiEnabled && state.turn === state.aiColor && !state.gameOver) {
    afterMove();
  }
  render();
}

function updateAiSettings() {
  state.humanColor = document.getElementById('humanColor').value;
  state.aiColor = state.humanColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  state.aiDepth = parseInt(document.getElementById('aiDepth').value, 10);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newGameBtn').addEventListener('click', newGame);
  document.getElementById('undoBtn').addEventListener('click', undoMove);
  document.getElementById('aiToggle').addEventListener('change', toggleAI);
  document.getElementById('humanColor').addEventListener('change', updateAiSettings);
  document.getElementById('aiDepth').addEventListener('change', updateAiSettings);
  document.getElementById('soundToggle').addEventListener('change', () => {
    state.soundEnabled = document.getElementById('soundToggle').checked;
  });
  document.getElementById('gameOverNewGame').addEventListener('click', newGame);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undoMove();
    }
  });
  newGame();
});
