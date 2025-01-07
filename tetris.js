class Tetris {
    constructor() {
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameBoard = document.querySelector('.game-board');
        this.init();

        // 定義方塊形狀
        this.shapes = {
            I: [[1, 1, 1, 1]],
            L: [[1, 0], [1, 0], [1, 1]],
            J: [[0, 1], [0, 1], [1, 1]],
            O: [[1, 1], [1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[1, 1, 1], [0, 1, 0]]
        };

        this.currentPiece = null;
        this.currentPosition = { x: 0, y: 0 };
        this.gameInterval = null;
        this.isPlaying = false;

        // 添加顏色
        this.colors = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000'
        };
        
        this.currentShape = null;  // 保存當前方塊的形狀名稱
    }

    init() {
        // 初始化遊戲板
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const block = document.createElement('div');
                block.classList.add('block');
                this.gameBoard.appendChild(block);
            }
        }
    }

    generateNewPiece() {
        const shapes = Object.keys(this.shapes);
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        this.currentPiece = this.shapes[randomShape];
        this.currentShape = randomShape;  // 保存形狀名稱
        this.currentPosition = {
            x: Math.floor((10 - this.currentPiece[0].length) / 2),
            y: 0
        };
    }

    moveDown() {
        if (this.canMove(this.currentPosition.x, this.currentPosition.y + 1)) {
            this.currentPosition.y++;
            this.updateBoard();
        } else {
            this.freezePiece();
            this.checkLines();
            this.generateNewPiece();
            if (!this.canMove(this.currentPosition.x, this.currentPosition.y)) {
                this.gameOver();
            }
        }
    }

    moveLeft() {
        if (this.canMove(this.currentPosition.x - 1, this.currentPosition.y)) {
            this.currentPosition.x--;
            this.updateBoard();
        }
    }

    moveRight() {
        if (this.canMove(this.currentPosition.x + 1, this.currentPosition.y)) {
            this.currentPosition.x++;
            this.updateBoard();
        }
    }

    rotate() {
        const rotated = this.currentPiece[0].map((_, i) =>
            this.currentPiece.map(row => row[i]).reverse()
        );
        
        if (this.canMove(this.currentPosition.x, this.currentPosition.y, rotated)) {
            this.currentPiece = rotated;
            this.updateBoard();
        }
    }

    canMove(newX, newY, piece = this.currentPiece) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x]) {
                    const nextX = newX + x;
                    const nextY = newY + y;
                    
                    if (nextX < 0 || nextX >= 10 || nextY >= 20) return false;
                    if (nextY >= 0 && this.board[nextY][nextX]) return false;
                }
            }
        }
        return true;
    }

    updateBoard() {
        // 清除舊的活動方塊
        const blocks = this.gameBoard.querySelectorAll('.block');
        blocks.forEach(block => block.classList.remove('active'));

        // 更新新的活動方塊位置
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const position = (this.currentPosition.y + y) * 10 + (this.currentPosition.x + x);
                    if (position >= 0) {
                        blocks[position].classList.add('active');
                    }
                }
            }
        }
    }

    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.generateNewPiece();
        this.gameInterval = setInterval(() => this.moveDown(), 1000);
        
        // 添加鍵盤控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(event) {
        if (!this.isPlaying && event.key !== 'p') return;

        switch (event.key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotate();
                break;
            case 'p':
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.resume();
                }
                break;
        }
    }

    freezePiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const boardY = this.currentPosition.y + y;
                    const boardX = this.currentPosition.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentShape;  // 保存方塊類型而不是簡單的1
                    }
                }
            }
        }
        this.updateBoardDisplay();
    }

    updateBoardDisplay() {
        const blocks = this.gameBoard.querySelectorAll('.block');
        blocks.forEach(block => {
            block.classList.remove('active');
            block.style.backgroundColor = '#fff';
        });

        // 顯示已凍結的方塊
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.board[y][x]) {
                    const position = y * 10 + x;
                    blocks[position].style.backgroundColor = this.colors[this.board[y][x]];
                }
            }
        }

        // 顯示當前活動方塊
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x]) {
                        const position = (this.currentPosition.y + y) * 10 + (this.currentPosition.x + x);
                        if (position >= 0) {
                            blocks[position].style.backgroundColor = this.colors[this.currentShape];
                        }
                    }
                }
            }
        }
    }

    checkLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // 消除該行
                this.board.splice(y, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // 重新檢查當前行，因為上面的行已經下移
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.updateBoardDisplay();
        }
    }

    updateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800];  // 0, 1, 2, 3, 4行的分數
        this.score += points[linesCleared];
        
        // 更新等級
        this.level = Math.floor(this.score / 1000) + 1;
        
        // 更新顯示
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        
        // 根據等級調整下落速度
        clearInterval(this.gameInterval);
        const speed = Math.max(100, 1000 - (this.level - 1) * 100);  // 最快100ms一次
        this.gameInterval = setInterval(() => this.moveDown(), speed);
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        document.removeEventListener('keydown', this.handleKeyPress);
        alert(`遊戲結束！\n最終分數：${this.score}\n等級：${this.level}`);
    }

    pause() {
        if (this.isPlaying) {
            clearInterval(this.gameInterval);
            this.isPlaying = false;
        }
    }

    resume() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            const speed = Math.max(100, 1000 - (this.level - 1) * 100);
            this.gameInterval = setInterval(() => this.moveDown(), speed);
        }
    }

    reset() {
        clearInterval(this.gameInterval);
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.isPlaying = false;
        this.currentPiece = null;
        this.updateBoardDisplay();
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
    }
}

// 更新事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    const game = new Tetris();
    
    document.getElementById('start-btn').addEventListener('click', () => {
        game.start();
    });
}); 