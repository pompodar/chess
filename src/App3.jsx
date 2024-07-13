import React, { useState, useEffect } from 'react';
import './App.css';
import { Piece } from "@chessire/pieces";
import { Chess } from 'chess.js';

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
  const [game, setGame] = useState(new Chess());
  const [pgn, setPgn] = useState('');
  const [moveIndex, setMoveIndex] = useState(0);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const pgnText = e.target.result;
        setPgn(pgnText);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (pgn) {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      console.log(newGame);
      setGame(newGame);
      setMoveIndex(0);
      // updateBoardFromGame(newGame);
    }
  }, [pgn]);

  const updateBoardFromGame = (chessGame) => {
    const newSides = [
      { color: 'white', pieces: [] },
      { color: 'black', pieces: [] },
    ];

    const position = chessGame.board();

    position.forEach((rank, rankIndex) => {
      rank.forEach((piece, fileIndex) => {
        if (piece) {
          const color = piece.color === 'w' ? 'white' : 'black';
          const pieceObj = {
            name: piece.type,
            color,
            position: `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`,
            image:
              piece.type === 'p'
                ? color === 'white'
                  ? WhitePawn
                  : BlackPawn
                : piece.type === 'r'
                ? color === 'white'
                  ? WhiteRook
                  : BlackRook
                : piece.type === 'n'
                ? color === 'white'
                  ? WhiteKnight
                  : BlackKnight
                : piece.type === 'b'
                ? color === 'white'
                  ? WhiteBishop
                  : BlackBishop
                : piece.type === 'q'
                ? color === 'white'
                  ? WhiteQueen
                  : BlackQueen
                : color === 'white'
                ? WhiteKing
                : BlackKing,
          };
          newSides.find((side) => side.color === color).pieces.push(pieceObj);
        }
      });
    });

    setSides(newSides);
  };

  const nextMove = () => {
    alert((game._history[0].move))
    if (moveIndex < game.history().length) {
      game.move(game.history()[moveIndex]);
      console.log(game.move(game.history()[moveIndex]), "move");
      setMoveIndex(moveIndex + 1);
      // updateBoardFromGame(game);
      setColorToMove(colorToMove === 'white' ? 'black' : 'white');
    }
  };

  const prevMove = () => {
    if (moveIndex > 0) {
      game.undo();
      setMoveIndex(moveIndex - 1);
      updateBoardFromGame(game);
      setColorToMove(colorToMove === 'white' ? 'black' : 'white');
    }
  };

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
        }
      }
    }

    return pieceToInsert;
  }

  function handlePieceClick(piece) {
    setSelectedPiece(piece);
    setHighlightedCells([]);
  }

  return (
    <div className="App">
      <div className="board">
        {Array.from({ length: 8 }, (_, row) => (
          <div className="row" key={row}>
            {Array.from({ length: 8 }, (_, col) => {
              const cellKey = String.fromCharCode(97 + col) + (8 - row);
              const pieceInCell = fillCell(cellKey);
              const highlighted = highlightedCells.includes(cellKey);
              const cellColor = (row + col) % 2 === 0 ? "light" : "dark";
              return (
                <div
                  key={cellKey}
                  className={`cell ${cellColor} ${highlighted ? "highlighted" : ""}`}
                  onClick={() => handlePieceClick(pieceInCell)}
                >
                  {pieceInCell.filled && pieceInCell.image}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="controls">
        <input type="file" accept=".pgn" onChange={handleFileUpload} />
        <button onClick={prevMove} disabled={moveIndex === 0}>
          Previous Move
        </button>
        <button onClick={nextMove} disabled={moveIndex === game.history().length}>
          Next Move
        </button>
      </div>
    </div>
  );
}

export default App;
