const config = (function () {
  return {
    player1Char: "x",
    player2Char: "o",
    neutralChar: "-",
  };
})();

const gameboard = (function () {
  let board = [
    [config.neutralChar, config.neutralChar, config.neutralChar],
    [config.neutralChar, config.neutralChar, config.neutralChar],
    [config.neutralChar, config.neutralChar, config.neutralChar],
  ];

  function getBoard() {
    return board;
  }

  function isCellEmpty(x, y) {
    if (board[x][y] === config.neutralChar) {
      return true;
    }
    return false;
  }

  function updateBoard(x, y, char) {
    board[x][y] = char;
  }

  function clearBoard() {
    board = [
      [config.neutralChar, config.neutralChar, config.neutralChar],
      [config.neutralChar, config.neutralChar, config.neutralChar],
      [config.neutralChar, config.neutralChar, config.neutralChar],
    ];
  }

  return {
    getBoard: getBoard,
    updateBoard: updateBoard,
    isCellEmpty: isCellEmpty,
    clearBoard: clearBoard,
  };
})();

const Player = function (name, char) {
  return { name, char };
};

const game = (function () {
  let winner, gameOver, filledCells, turn, player1, player2, winPattern;

  function init(p1, p2) {
    winner = config.neutralChar;
    gameOver = false;
    winPattern = null;
    filledCells = 0;
    gameboard.clearBoard();
    player1 = p1;
    player2 = p2;
    turn = p1.char;   //implement rng on game start?
  }

  function getFilledCells() {
    return filledCells;
  }

  function incrementFilledCells() {
    filledCells += 1;
  }

  function isGameOver() {
    return gameOver;
  }

  function getWinner() {
    return winner;
  }

  function getTurn(){
    return turn;
  }
  function getWinPattern(){
    return winPattern;
  }

  function getPlayerByChar(char) {
    if (player1.char === char) {
      return player1;
    }
    return player2;
  }

  function handleGameOver() {
    if (winner !== config.neutralChar) {
      console.log(`${winner.name} is the winner!`);
    } else {
      console.log("tis a tie");
    }
  }

  function checkForTie() {
    if (getFilledCells() === 9) {
      gameOver = true;
      handleGameOver();
    }
  }

  function checkForWin() {
    const board = gameboard.getBoard();
    const winPatterns = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ]

    winPatterns.forEach(pattern => {
      if(!gameOver && board[Math.floor((pattern[0])/3)][pattern[0]%3] !== config.neutralChar && board[Math.floor((pattern[0])/3)][pattern[0]%3] === board[Math.floor((pattern[1])/3)][pattern[1]%3] && board[Math.floor((pattern[0])/3)][pattern[0]%3] === board[Math.floor((pattern[2])/3)][pattern[2]%3]){
        winner = getPlayerByChar(turn);
        gameOver = true;
        winPattern = pattern;
      }
    });

    if (gameOver) {
      handleGameOver();
    }
  }

  function switchTurns() {
    if (turn === player1.char) {
      turn = player2.char;
    } else {
      turn = player1.char;
    }
  }

  function showBoard() {
    const b = gameboard.getBoard();
    let bString = "";
    for (let i = 0; i < 3; i++) {
      bString += `[ ${b[i][0]}, ${b[i][1]}, ${b[i][2]} ]\n`;
    }
    console.log(bString);
  }

  function handleCellClick(x, y) {
    if (gameOver) {
      return;
    }
    if (gameboard.isCellEmpty(x, y)) {
      gameboard.updateBoard(x, y, turn);
    } else {
      return;
    }
    incrementFilledCells();
    if (getFilledCells() >= 5) {
      checkForWin();
    }
    if (!gameOver) {
      checkForTie();
    }
    switchTurns();
    // showBoard();
  }

  return {
    handleCellClick: handleCellClick,
    // showBoard: showBoard,
    isGameOver: isGameOver,
    getWinner: getWinner,
    getWinPattern: getWinPattern,
    getTurn: getTurn,
    getPlayerByChar: getPlayerByChar,
    init: init,
  };
})();

const domObj = (function () {
  const cellArr = document.querySelectorAll(".cell");
  const gameOverDiv = document.querySelector(".game-over-text");
  const restartBtn = document.querySelector(".restart-btn");
  const turnElem = document.querySelector(".turn-value");
  const startScreen = document.querySelector(".modal-background");
  const startBtn = document.querySelector(".start-btn");
  const form = document.querySelector("#player-names-form");
  const pXNameInput = document.querySelector("#playerX");
  const pONameInput = document.querySelector("#playerO");
  let p1 = null, p2 = null;

  function init() {
    addListeners();
  }

  function addListeners() {
    cellArr.forEach((cell) => {
      const xCoord = parseInt(cell.dataset.x);
      const yCoord = parseInt(cell.dataset.y);
      cell.addEventListener("click", (e) => {
        if(gameboard.isCellEmpty(xCoord, yCoord) === false || game.isGameOver()){
          return;
        }
        game.handleCellClick(xCoord, yCoord);
        cell.classList.remove("empty");
        render();
        updateTurn();
      });
    });

    restartBtn.addEventListener("click", (e) => {
      game.init(p1, p2);
      cellArr.forEach(cell => {
        cell.classList.remove("win");
        cell.classList.add("empty");
      });
      gameOverDiv.textContent = ``;
      gameOverDiv.classList.add("hidden");
      const player = game.getPlayerByChar(game.getTurn());
      turnElem.textContent = player.name;
      render();
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      p1 = Player((pXNameInput.value || "Player X"), 'x');
      p2 = Player((pONameInput.value || "Player O"), 'o');
      game.init(p1, p2);
      startScreen.classList.add("hidden");
      const player = game.getPlayerByChar(game.getTurn());
      turnElem.textContent = player.name;
    });
  }
  function updateTurn(){
    if(turnElem.textContent === p1.name){
      turnElem.textContent = p2.name;
    } else {
      turnElem.textContent = p1.name;
    }
  }

  function render() {
    const board = gameboard.getBoard();

    cellArr.forEach((cell) => {
      const xCoord = parseInt(cell.dataset.x);
      const yCoord = parseInt(cell.dataset.y);
      if (board[xCoord][yCoord] !== config.neutralChar) {
        cell.textContent = board[xCoord][yCoord];
      } else {
        cell.textContent = ``;
      }
    });

    if (game.isGameOver()) {
      gameOverDiv.classList.remove("hidden");
      if (game.getWinner() === config.neutralChar) {
        gameOverDiv.textContent = `It is a tie!`;
      } else {
        gameOverDiv.textContent = `${game.getWinner().name} is the winner!`;
        const winPattern = game.getWinPattern();
        winPattern.forEach(cellIdx => {
          cellArr[cellIdx].classList.add("win");
        });
      }
    }

  }

  return {
    init: init,
  };
})();

domObj.init();