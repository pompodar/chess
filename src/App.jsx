import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Piece } from "@chessire/pieces";
import { Chess } from 'chess.js';
import axios from 'axios';
import { AiFillFastForward } from "react-icons/ai";
import { AiFillFastBackward } from "react-icons/ai";
import { AiFillStepBackward } from "react-icons/ai";
import { AiFillStepForward } from "react-icons/ai";
import { AiOutlineLogin } from "react-icons/ai";
import { AiOutlineLogout } from "react-icons/ai";
import { signInWithGoogle } from "./config/firebase";
import { auth as firebaseAuth } from './config/firebase';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import debounce from 'lodash.debounce';

export const Logo = () => <Piece color="white" piece="N" width={64} />;

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
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pgnFiles, setPgnFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);

  const [colorToMove, setColorToMove] = useState("white");
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [promoteTo, setPromoteTo] = useState(null);
  const [pieceToPromote, setPieceToPromote] = useState(null);
  const [title, setTitle] = useState("");

  const [notation, setNotation] = useState([]);
  const [moves, setMoves] = useState([]);
  const [move, setMove] = useState(0);
  const [capturedPieces, setCapturedPieces] = useState([]);

  const [engine, setEngine] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const [testedMovesNumber, setTestedMovesNumber] = useState(0);
  const [testedMoveFrom, setTestedMoveFrom] = useState(null);
  const [testing, setTesting] = useState(false);

  const sidebarRef = useRef(null);

  const submitWithGoogle = async (e) => {
    e.preventDefault();
    try {
        signInWithGoogle();

        setNotice("Successfully signed in!");

        setTimeout(() => {
          setNotice("");
        }, 2000);
    } catch (error) {
        console.error("Google sign-in failed:", error);
    }
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
        console.log("User signed-out successfully.");
        setUser(null);
    }).catch((error) => {
        console.log("Error when signing-out");
    });
  };

  const fetchPgnFiles = async (page = currentPage, search = '', limit = 1) => {
    try {
      // const response = await axios.get('https://plum-goldenrod-clove.glitch.me/api/pgn-files', {
      const response = await axios.get('https://plum-goldenrod-clove.glitch.me/api/pgn-files', {

        params: { page, search }
      });
      setPgnFiles(response.data.files);
      setFilteredFiles(response.data.files); 
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch PGN files', error);
    }
  };

  const debouncedFetchPgnFiles = useCallback(debounce(fetchPgnFiles, 250), []);

  useEffect(() => {
    debouncedFetchPgnFiles(currentPage, searchTerm, 1);
    //fetchPgnFiles(currentPage, searchTerm, 1);
  }, [pgnFiles, currentPage, searchTerm]);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
            console.log("User set on auth state changed in Authenticated layout", currentUser);
        } else {
            console.log("User not on on auth state changed in Authenticated layout", currentUser);
        }
      });
  
      // Cleanup subscription on unmount
      return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight;
    }
  }, [notation]);

  useEffect(() => {
    const stockfish = new Worker('./stockfish.js');
    setEngine(stockfish);

    stockfish.onmessage = (event) => {
      const message = event.data;
      if (message.includes('score')) {
        const score = message.match(/score (cp|mate) (-?\d+)/);
        if (score) {
          const type = score[1];
          const value = parseInt(score[2], 10);
          setEvaluation({ type, value });
        }
      }

      if (message.startsWith('bestmove')) {
        console.log('Best move:', message.split(' ')[1]);
      }    
    };

    return () => {
      stockfish.terminate();
    };
  }, []);

  const getBestMove = (fen) => {
    const stockfish = new Worker('./stockfish.js');

    // Set up the position from FEN
    stockfish.postMessage(`position fen ${fen}`);
    
    // Ask for the best move
    stockfish.postMessage('go depth 15');
  };

  const evaluatePosition = (fen) => {
    if (engine) {
      engine.postMessage('position fen ' + fen);
      engine.postMessage('go depth 15'); // You can change the depth for a different evaluation time
    }
  };

  const [game, setGame] = useState(null);
  
  const initialState = [
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
  ];

  const [sides, setSides] = useState(initialState);


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
    if (!user) {
      setNotice("You better first log in");
      return;
    }

    if (!selectedPiece) {
      if (!cell.filled || colorToMove !== cell.color) return;
      setSelectedPiece(cell);
      const moves = getPossibleMoves(cell, sides);
      setHighlightedCells(moves);

      setTestedMoveFrom(cell.position);
    } else {
      if (testing) {
        if(moves[testedMovesNumber].from === testedMoveFrom && moves[testedMovesNumber].to === cell.position) {
          console.log("correct");
        } else {
          console.log("wrong");
          setSelectedPiece(null);
          setHighlightedCells([]);
          return;
        }
      }

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
        setTestedMovesNumber(() => testedMovesNumber + 1)
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
    <div className="flex">
      {["a", "b", "c", "d", "e", "f", "g", "h"].map((file, index) => (
        <div className="row" key={index}>
          {[1, 2, 3, 4, 5, 6, 7, 8].reverse().map((rank) => {
            const cell = fillCell(file + rank);
            return (
              <div
                className={`cell w-10 h-10 border-2 flex justify-center items-center cursor-pointer ${highlightedCells.includes(cell.position) ? "bg-gray-100" : ""}`}
                key={index + rank}
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

  const loadPgnFile = (fileName) => {
    axios.get(`https://plum-goldenrod-clove.glitch.me/api/pgn-files/${fileName}`)
      .then(response => {
        const pgn = response.data;
        const chess = new Chess();
        chess.loadPgn(pgn);

        setTitle(chess._header.White + " vs " + chess._header.Black);

        const moves = chess.history({ verbose: true }).map((move, index) => {
          const color = index % 2 === 0 ? 'w' : 'b'; // White moves on even indices, black on odd
          const moveNumber = index;
          return {
              from: move.from,
              to: move.to,
              piece: move.piece,
              fenBefore: move.before,
              fenAfter: move.after,
              san: move.san,
              flags: move.flags,
              color,
              moveNumber,
          };
        });

        setGame(moves);
        setMoves(moves);
        setNotation([]);
        setMove(0);
      })
      .catch(error => {
        console.error('Error loading PGN file:', error);
      });
  };

  const handleFileUpload = (event) => {
    if (!user) {
      setNotice("You better first log in");
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const pgnText = e.target.result;
        const gameConverted = convertPgnToGame(pgnText);
        setGame(gameConverted);
        setMoves(gameConverted);
        setNotation([]);
        setMove(0);

        try {
          const response = await axios.post('https://plum-goldenrod-clove.glitch.me/api/pgn-files-save', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          setNotice(response.data.message);

          setTimeout(() => {
            setNotice("");
          }, 2000);

          fetchPgnFiles();
        } catch (error) {
          setNotice('Failed to upload file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const convertPgnToGame = (pgn) => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    setTitle(chess._header.White + " vs " + chess._header.Black);
    const moves = chess.history({ verbose: true });

    return moves.map((move, index) => {
      const color = index % 2 === 0 ? 'w' : 'b'; // White moves on even indices, black on odd
      const moveNumber = index;
      return {
          from: move.from,
          to: move.to,
          piece: move.piece,
          fenBefore: move.before,
          fenAfter: move.after,
          san: move.san,
          flags: move.flags,
          color,
          moveNumber,
      };
    });
  };

  const nextMove = () => {
    if (!user) {
      setNotice("You better first log in");
      return;
    }

    if (game.length > move) {
      const currentMove = moves[move];

      setSides((prevSides) => {
        let newSides = prevSides.map((side) => {
          return {
            ...side,
            pieces: side.pieces.map((piece) => {
              if (piece.position === currentMove.from) {
                return { ...piece, position: currentMove.to };
              } else if (piece.position === currentMove.to) {
                const capturedPiece = {
                    ...piece,
                    capturedAtMove: move,
                };
                setCapturedPieces(prevArray => [...prevArray, capturedPiece]);
                return { ...piece, position: null }; // Captured
              }
              return piece;
            })
          };
        });

        // Handle castling
        if (currentMove.piece === 'k' && currentMove.san.includes("O-O")) {
          if (currentMove.to === 'c1' || currentMove.to === 'c8') {
            // Kingside castling
            const rookPosition = currentMove.color === 'w' ? 'a1' : 'a8';
            const rookNewPosition = currentMove.color === 'w' ? 'd1' : 'd8';
            newSides = updateRookPosition(newSides, rookPosition, rookNewPosition);
          } else if (currentMove.to === 'g1' || currentMove.to === 'g8') {
            // Queenside castling
            const rookPosition = currentMove.color === 'w' ? 'h1' : 'h8';
            const rookNewPosition = currentMove.color === 'w' ? 'f1' : 'f8';
            newSides = updateRookPosition(newSides, rookPosition, rookNewPosition);
          }
        }

        return newSides;
      });
      setColorToMove(colorToMove === 'white' ? 'black' : 'white');
      setMove(move + 1);
  
      const newMove = { from: moves[move].from, to: moves[move].to, image: getPieceImage(moves[move].piece), color: moves[move].from.color };
      setNotation((prevNotation) => {
        if (move % 2 === 0) {
          return [...prevNotation, { white: newMove }];
        } else {
          const lastMove = prevNotation[prevNotation.length - 1];
          lastMove.black = newMove;
          return [...prevNotation.slice(0, -1), lastMove];
        }
      });

      console.log(currentMove.fenAfter);
      evaluatePosition(currentMove.fenAfter);
      
      getBestMove(currentMove.fenAfter);
    }
  };

  const prevMove = () => {
    if (!user) {
      setNotice("You better first log in");
      return;
    }

    if (move > 0) {
      const prevMove = moves[move - 1];
  
      setSides(prevSides => {
        let newSides = prevSides.map(side => {
          return {
            ...side,
            pieces: side.pieces.map(piece => {
              if (piece.position === prevMove.to) {
                return { ...piece, position: prevMove.from };
              }
              return piece;
            })
          };
        });
  
        const filteredCapturedPieces = capturedPieces.filter(p => { return p.position === prevMove.to && p.capturedAtMove === (move - 1) } );
        const capturedPiece = filteredCapturedPieces.length > 0 ? filteredCapturedPieces[filteredCapturedPieces.length - 1] : null;
    
        if (capturedPiece) {
          const opponentColor = prevMove.color === 'w' ? 'black' : 'white';
          const originalPosition = capturedPiece.position;
          newSides = newSides.map(side => {
            if (side.color === opponentColor) {
              return {
                ...side,
                pieces: [...side.pieces, {
                  ...capturedPiece,
                  position: originalPosition,
                }]
              };
            }
            return side;
          });
          setCapturedPieces(prev => prev.filter(p => p !== capturedPiece));
        }
  
        if (prevMove.piece === 'k' && prevMove.san.includes("O-O")) {
          const rookPosition = prevMove.color === 'w' ? (prevMove.to === 'g1' ? 'f1' : 'd1') : (prevMove.to === 'g8' ? 'f8' : 'd8');
          const rookOriginalPosition = prevMove.color === 'w' ? (prevMove.to === 'g1' ? 'h1' : 'a1') : (prevMove.to === 'g8' ? 'h8' : 'a8');
          newSides = updateRookPosition(newSides, rookPosition, rookOriginalPosition);
        }
  
        return newSides;
      });
      setColorToMove(colorToMove === 'white' ? 'black' : 'white');
      setMove(move - 1);
      setNotation(prevNotation => {
        if (move % 2 === 1) {
          return prevNotation.slice(0, -1);
        } else {
          const lastMove = prevNotation[prevNotation.length - 1];
          delete lastMove.black;
          return [...prevNotation.slice(0, -1), lastMove];
        }
      });

      console.log(prevMove.fenAfter);
      evaluatePosition(prevMove.fenAfter);
    }
  };

  const updateRookPosition = (sides, rookPosition, rookNewPosition) => {
    return sides.map((side) => {
      return {
        ...side,
        pieces: side.pieces.map((piece) => {
          if (piece.position === rookPosition) {
            return { ...piece, position: rookNewPosition };
          }
          return piece;
        })
      };
    });
  };

  function getPieceImage(piece) {
    switch (piece.name) {
      case 'pawn': return piece.color === 'white' ? <WhitePawn /> : <BlackPawn />;
      case 'rook': return piece.color === 'white' ? <WhiteRook /> : <BlackRook />;
      case 'knight': return piece.color === 'white' ? <WhiteKnight /> : <BlackKnight />;
      case 'bishop': return piece.color === 'white' ? <WhiteBishop /> : <BlackBishop />;
      case 'queen': return piece.color === 'white' ? <WhiteQueen /> : <BlackQueen />;
      case 'king': return piece.color === 'white' ? <WhiteKing /> : <BlackKing />;
      default: return null;
    }
  }  

  const resetGame = () => {
    if (!user) {
      setNotice("You better first log in");
      return;
    }

    setSides(initialState);
    setCapturedPieces([]);
    setColorToMove('white');
    setMove(0);
    setTestedMoveFrom(null);
    setTestedMovesNumber(0);
    setNotation([]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {!user && (
        <div className="flex gap-2 justify-center items-center  mb-2">
          <div className="relative after:w-2 after:h-2 after:bg-[aqua] after:absolute after:top-[17px] after:right-[11px] after:rounded-full after:z-[-1]">
            <Logo />
          </div>
          <form className="inline" onSubmit={submitWithGoogle}>
              <div>
                  <button className="lg:ms-4" 
                    // disabled={processing}
                  >
                      <AiOutlineLogin />
                  </button>
              </div>
          </form>
        </div>
      )}
      {user && (
        <div className="flex gap-2 justify-center items-center">
          <div className="relative after:w-2 after:h-2 after:bg-[aqua] after:absolute after:top-[17px] after:right-[11px] after:rounded-full after:z-[-1]">
            <Logo />
          </div>
          <p className="inline">
            {user.displayName}
          </p>
          <button className="mb-2" onClick={() => handleLogout()}>
            <AiOutlineLogout />
          </button>
        </div> 
      )}
      {(promoteTo && user) && (
        <div className="promotion-modal">
          <button onClick={() => promotePiece('queen')}>Queen</button>
          <button onClick={() => promotePiece('rook')}>Rook</button>
          <button onClick={() => promotePiece('bishop')}>Bishop</button>
          <button onClick={() => promotePiece('knight')}>Knight</button>
          <button onClick={() => setPromoteTo(null)}>Cancel</button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2 items-center lg:items-start">
        <div>
          <h2 className="text-lg mt-4">PGN Files</h2>
          <input
            type="text"
            className="border-2 p-1"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <ul className="max-h-12 lg:max-h-48 overflow-auto w-64">
            {filteredFiles.map((file) => (
              <li className="cursor-pointer" key={file.fileName} onClick={() => loadPgnFile(file.fileName)}>
                {file.friendlyName}
              </li>
            ))}
          </ul>
          <div>
            {totalPages > 1 && Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                disabled={currentPage === index + 1}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          {(game && user) && (
              <h1 className="text-2xl mb-2">{title}</h1>
          )}
          <Board />
          <div className="m-2">
            {(game && user) && (
              <>
                <button onClick={resetGame}>
                  <AiFillStepBackward />
                </button>
                <button onClick={prevMove}>
                  <AiFillFastBackward />
                </button>
                <button onClick={nextMove}>
                  <AiFillStepForward />
                </button>
                <button onClick={nextMove}>
                  <AiFillFastForward />
                </button>
              </>
            )}
            <br />
            <input type="file" className="w-full mt-2" accept=".pgn" onChange={handleFileUpload} />
            { (moves.length > 0 && user) && 
              <button onClick={() => setTesting(true)}>Test</button>
            }
            { notice && 
              <p>
                {notice}
              </p>
            }
          </div>
        </div>    
        <div className="mt-4  w-64">
          {notation.length > 0 && (
            <div>
              <h2 className="text-lg">Notation</h2>
              <ul className="max-h-12 lg:max-h-48 overflow-auto mb-2" ref={sidebarRef}>
                {notation.map((move, index) => (
                  <li key={index}>
                    <span>{index + 1}. </span>
                    <span>{move.white.from} {move.white.to} {move.white.image}</span>
                    {move.black && <span> / {move.black.from} {move.black.to} {move.black.image}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(evaluation && user) && (
            <div>
              Evaluation: {evaluation.type === 'cp' ? evaluation.value / 100 : 'Mate in ' + evaluation.value}
            </div>
          )}
        </div>
      </div>
    </>
  );
 
}

export default App;
