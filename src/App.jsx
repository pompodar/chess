import { useState } from 'react';
import './App.css';
import { Piece } from "@chessire/pieces";

export const BlackPawn = () => <Piece color="black" piece="P" width={32} />;
export const BlackRook = () => <Piece color="black" piece="R" width={32} />;
export const BlackKnight = () => <Piece color="black" piece="N" width={32} />;
export const BlackBishop = () => <Piece color="black" piece="B" width={32} />;
export const BlackQueen = () => <Piece color="black" piece="Q" width={32} />;
export const BlackKing = () => <Piece color="black" piece="K" width={32} />;

export const WhitePawn = () => <Piece color="white" piece="P" width={32} />;
export const WhiteRook = () => <Piece color="white" piece="R" width={32} />;
export const WhiteKnight = () => <Piece color="white" piece="N" width={32} />;
export const WhiteBishop = () => <Piece color="white" piece="B" width={32} />;
export const WhiteQueen = () => <Piece color="white" piece="Q" width={32} />;
export const WhiteKing = () => <Piece color="white" piece="K" width={32} />;

function App() {
  const [colorToMove, setColorToMove] = useState("white");
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [promoteTo, setPromoteTo] = useState(null);
  const [pieceToPromote, setPieceToPromote] = useState(null);


  const [sides, setSides] = useState([
    {
      color: "white",
      pieces: [
        { name: "rook", color: "white", position: "a1", image: WhiteRook },
        { name: "knight", color: "white", position: "b1", image: WhiteKnight },
        { name: "bishop", color: "white", position: "c1", image: WhiteBishop },
        { name: "queen", color: "white", position: "d1", image: WhiteQueen },
        { name: "king", color: "white", position: "e1", image: WhiteKing },
        { name: "bishop", color: "white", position: "f1", image: WhiteBishop },
        { name: "knight", color: "white", position: "g1", image: WhiteKnight },
        { name: "rook", color: "white", position: "h1", image: WhiteRook },
        { name: "pawn", color: "white", position: "a2", image: WhitePawn },
        { name: "pawn", color: "white", position: "b2", image: WhitePawn },
        { name: "pawn", color: "white", position: "c2", image: WhitePawn },
        { name: "pawn", color: "white", position: "d2", image: WhitePawn },
        { name: "pawn", color: "white", position: "e2", image: WhitePawn },
        { name: "pawn", color: "white", position: "f2", image: WhitePawn },
        { name: "pawn", color: "white", position: "g2", image: WhitePawn },
        { name: "pawn", color: "white", position: "h2", image: WhitePawn },
      ],
    },
    {
      color: "black",
      pieces: [
        { name: "rook", color: "black", position: "a8", image: BlackRook },
        { name: "knight", color: "black", position: "b8", image: BlackKnight },
        { name: "bishop", color: "black", position: "c8", image: BlackBishop },
        { name: "queen", color: "black", position: "d8", image: BlackQueen },
        { name: "king", color: "black", position: "e8", image: BlackKing },
        { name: "bishop", color: "black", position: "f8", image: BlackBishop },
        { name: "knight", color: "black", position: "g8", image: BlackKnight },
        { name: "rook", color: "black", position: "h8", image: BlackRook },
        { name: "pawn", color: "black", position: "a7", image: BlackPawn },
        { name: "pawn", color: "black", position: "b7", image: BlackPawn },
        { name: "pawn", color: "black", position: "c7", image: BlackPawn },
        { name: "pawn", color: "black", position: "d7", image: BlackPawn },
        { name: "pawn", color: "black", position: "e7", image: BlackPawn },
        { name: "pawn", color: "black", position: "f7", image: BlackPawn },
        { name: "pawn", color: "black", position: "g7", image: BlackPawn },
        { name: "pawn", color: "black", position: "h7", image: BlackPawn },
      ],
    },
  ]);

  function fillCell(key) {
    let pieceToInsert = { filled: false, position: key.toLowerCase() };

    for (const side of sides) {
      for (const piece of side.pieces) {
        if (piece.position === key.toLowerCase()) {
          pieceToInsert = {
            filled: true,
            name: piece.name,
            color: side.color,
            position: key.toLowerCase(),
            image: piece.image(),
          };
          break;
        }
      }
      if (pieceToInsert.filled) break;
    }

    return pieceToInsert;
  }

  function getPossibleMoves(piece, sides) {
    const directions = {
      pawn: (piece) => {
        const moves = [];
        const direction = piece.color === 'white' ? 1 : -1;
        const startRank = piece.color === 'white' ? 2 : 7;
        
        // Move forward one square
        let file = piece.position.charAt(0);
        let rank = parseInt(piece.position.charAt(1)) + direction;
        if (!isOccupied(file + rank, sides)) {
          moves.push(file + rank);
        }
        
        // Move forward two squares from starting position
        if (parseInt(piece.position.charAt(1)) === startRank) {
          rank = parseInt(piece.position.charAt(1)) + (2 * direction);
          if (!isOccupied(file + rank, sides)) {
            moves.push(file + rank);
          }
        }
        
        // Capturing
        ['-1', '1'].forEach((fileChange) => {
          const newFile = String.fromCharCode(file.charCodeAt(0) + parseInt(fileChange));
          rank = parseInt(piece.position.charAt(1)) + direction;
          if (isOccupiedByOpponent(newFile + rank, piece.color, sides)) {
            moves.push(newFile + rank);
          }
        });
        
        return moves;
      },
      rook: (piece) => linearMoves(piece, sides, [[1, 0], [-1, 0], [0, 1], [0, -1]]),
      knight: (piece) => knightMoves(piece, sides),
      bishop: (piece) => linearMoves(piece, sides, [[1, 1], [1, -1], [-1, 1], [-1, -1]]),
      queen: (piece) => linearMoves(piece, sides, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]),
      king: (piece) => kingMoves(piece, sides),
    };

    return directions[piece.name](piece);
  }

  function linearMoves(piece, sides, directions) {
    const moves = [];
    const [file, rank] = piece.position.split('');
    const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = parseInt(rank, 10) - 1;

    directions.forEach(([dx, dy]) => {
      let x = fileIndex;
      let y = rankIndex;
      while (true) {
        x += dx;
        y += dy;
        if (x < 0 || x >= 8 || y < 0 || y >= 8) break;
        const newFile = String.fromCharCode('a'.charCodeAt(0) + x);
        const newRank = (y + 1).toString();
        const newPosition = newFile + newRank;
        if (isOccupiedBySameColor(newPosition, piece.color, sides)) break;
        moves.push(newPosition);
        if (isOccupied(newPosition, sides)) break;
      }
    });

    return moves;
  }

  function knightMoves(piece, sides) {
    const moves = [];
    const [file, rank] = piece.position.split('');
    const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = parseInt(rank, 10) - 1;
    const knightMoves = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];

    knightMoves.forEach(([dx, dy]) => {
      const newFileIndex = fileIndex + dx;
      const newRankIndex = rankIndex + dy;
      if (newFileIndex >= 0 && newFileIndex < 8 && newRankIndex >= 0 && newRankIndex < 8) {
        const newFile = String.fromCharCode('a'.charCodeAt(0) + newFileIndex);
        const newRank = (newRankIndex + 1).toString();
        const newPosition = newFile + newRank;
        if (!isOccupiedBySameColor(newPosition, piece.color, sides)) {
          moves.push(newPosition);
        }
      }
    });

    return moves;
  }

  function kingMoves(piece, sides) {
    const moves = [];
    const [file, rank] = piece.position.split('');
    const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = parseInt(rank, 10) - 1;
    const kingMoves = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    kingMoves.forEach(([dx, dy]) => {
      const newFileIndex = fileIndex + dx;
      const newRankIndex = rankIndex + dy;
      if (newFileIndex >= 0 && newFileIndex < 8 && newRankIndex >= 0 && newRankIndex < 8) {
        const newFile = String.fromCharCode('a'.charCodeAt(0) + newFileIndex);
        const newRank = (newRankIndex + 1).toString();
        const newPosition = newFile + newRank;
        if (!isOccupiedBySameColor(newPosition, piece.color, sides)) {
          moves.push(newPosition);
        }
      }
    });

    return moves;
  }

  function isOccupied(position, sides) {
    return sides.some(side => side.pieces.some(piece => piece.position === position));
  }

  function isOccupiedBySameColor(position, color, sides) {
    return sides.some(side =>
      side.color === color &&
      side.pieces.some(piece => piece.position === position)
    );
  }

  function isOccupiedByOpponent(position, color, sides) {
    return sides.some(side =>
      side.color !== color &&
      side.pieces.some(piece => piece.position === position)
    );
  }

  function handleClickCell(cell) {
    console.log(cell);
    if (!selectedPiece) {
      if (!cell.filled || colorToMove !== cell.color) return;
      setSelectedPiece(cell);
      const moves = getPossibleMoves(cell, sides);
      setHighlightedCells(moves);
    } else {
      if (highlightedCells.includes(cell.position)) {
        setSides((prevSides) => {
          let newSides = prevSides.map((side) => {
            // Remove captured piece
            if (side.color !== selectedPiece.color) {
              return {
                ...side,
                pieces: side.pieces.filter(piece => piece.position !== cell.position)
              };
            }
            // Update moved piece position
            return {
              ...side,
              pieces: side.pieces.map((piece) =>
                piece.position === selectedPiece.position
                  ? { ...piece, position: cell.position }
                  : piece
              )
            };
          });
  
          const [file, rank] = cell.position.split('');
          if (selectedPiece.name === "pawn" && (rank === "1" || rank === "8")) {
            setPieceToPromote(selectedPiece);
            setPromoteTo(true);
          }
  
          return newSides;
        });
        setSelectedPiece(null);
        setHighlightedCells([]);
        setColorToMove(colorToMove === "white" ? "black" : "white");
      } else {
        setSelectedPiece(null);
        setHighlightedCells([]);
      }
    }
  }

  function promotePiece(pieceType) {
    setSides(prevSides => prevSides.map(side => ({
        ...side,
        pieces: side.pieces.map(p => {
            console.log('Checking piece at position:', p.position);
            return p.position === pieceToPromote.position.replace("2", "1").replace("7", "8")
                ? {
                    ...p,
                    name: pieceType,
                    image: () => pieceType === 'queen' ? (side.color === 'white' ? <WhiteQueen /> : <BlackQueen />)
                        : pieceType === 'rook' ? (side.color === 'white' ? <WhiteRook /> : <BlackRook />)
                        : pieceType === 'bishop' ? (side.color === 'white' ? <WhiteBishop /> : <BlackBishop />)
                        : (side.color === 'white' ? <WhiteKnight /> : <BlackKnight />)
                }
                : p;
        })
    })));
    setPromoteTo(null);
    setPieceToPromote(null);
    setSelectedPiece(null);
    setHighlightedCells([]);
  }



  
  const Board = () => (
    <div className="board">
      {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
        <div className="row" key={file}>
          {[1, 2, 3, 4, 5, 6, 7, 8].reverse().map((rank) => {
            const cell = fillCell(file + rank);
            return (
              <div
                className={`cell ${highlightedCells.includes(cell.position) ? "highlight" : ""}`}
                key={rank}
                onClick={() => handleClickCell(cell)}
              >
                {cell.filled && cell.image}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {promoteTo && (
          <div className="promotion-modal">
            <button onClick={() => promotePiece('queen')}>Queen</button>
            <button onClick={() => promotePiece('rook')}>Rook</button>
            <button onClick={() => promotePiece('bishop')}>Bishop</button>
            <button onClick={() => promotePiece('night')}>Knight</button>
            <button onClick={() => setPromoteTo(null)}>Cancel</button>
          </div>
        )}
        <Board />;
      </>
  )
 
}

export default App;
