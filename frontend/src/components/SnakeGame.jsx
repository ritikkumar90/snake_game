import React, { useEffect, useRef, useState } from 'react';
import { submitScore } from '../api';
import './SnakeGame.css';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame = ({ token }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state refs (to avoid stale closures in requestAnimationFrame/setTimeout)
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef({ x: 0, y: 0 }); // Initial stopped
  const foodRef = useRef({ x: 15, y: 15 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastRenderTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (directionRef.current.y === 0) { directionRef.current = { x: 0, y: -1 }; setGameStarted(true); }
          break;
        case 'ArrowDown':
        case 's':
          if (directionRef.current.y === 0) { directionRef.current = { x: 0, y: 1 }; setGameStarted(true); }
          break;
        case 'ArrowLeft':
        case 'a':
          if (directionRef.current.x === 0) { directionRef.current = { x: -1, y: 0 }; setGameStarted(true); }
          break;
        case 'ArrowRight':
        case 'd':
          if (directionRef.current.x === 0) { directionRef.current = { x: 1, y: 0 }; setGameStarted(true); }
          break;
        case ' ':
        case 'Escape':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver && token && score > 0 && !scoreSubmitted) {
      submitScore(token, score).catch(err => console.error("Failed to submit score", err));
      setScoreSubmitted(true);
    }
  }, [gameOver, token, score, scoreSubmitted]);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: 0 };
    setScore(0);
    setGameOver(false);
    setScoreSubmitted(false);
    setGameStarted(false);
    speedRef.current = INITIAL_SPEED;
    spawnFood();
  };

  const spawnFood = () => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * 25), // Assuming 500x500 canvas / 20 grid = 25
        y: Math.floor(Math.random() * 25)
      };
      // Make sure food is not on snake
      const onSnake = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    foodRef.current = newFood;
  };

  const draw = (ctx) => {
    // Clear canvas
    ctx.fillStyle = '#0b0f19'; // Match bg
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw Grid (Optional for aesthetic)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ctx.canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ctx.canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ctx.canvas.width, i);
      ctx.stroke();
    }

    // Draw Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3366';
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * GRID_SIZE + GRID_SIZE / 2, 
      foodRef.current.y * GRID_SIZE + GRID_SIZE / 2, 
      GRID_SIZE / 2.5, 
      0, 
      2 * Math.PI
    );
    ctx.fill();

    // Draw Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff66';
    ctx.fillStyle = '#00ff66';
    
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#00ffaa'; // Head color
      } else {
        ctx.fillStyle = '#00ff66';
      }
      
      // Slight rounding of snake segments
      ctx.fillRect(
        segment.x * GRID_SIZE + 1, 
        segment.y * GRID_SIZE + 1, 
        GRID_SIZE - 2, 
        GRID_SIZE - 2
      );
    });

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
  };

  const update = () => {
    if (gameOver || isPaused || (directionRef.current.x === 0 && directionRef.current.y === 0)) return;

    const newSnake = [...snakeRef.current];
    const head = { ...newSnake[0] };

    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    // Wall collision (wrap around or die, let's do die for classic snake)
    if (head.x < 0 || head.x >= 25 || head.y < 0 || head.y >= 25) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 10);
      spawnFood();
      // Increase speed slightly
      if (speedRef.current > 50) {
        speedRef.current -= 2;
      }
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  };

  useEffect(() => {
    let animationFrameId;

    const loop = (timestamp) => {
      if (timestamp - lastRenderTimeRef.current >= speedRef.current) {
        update();
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          draw(ctx);
        }
        lastRenderTimeRef.current = timestamp;
      }
      animationFrameId = window.requestAnimationFrame(loop);
    };

    animationFrameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [gameOver, isPaused]);

  // Initial draw
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      draw(ctx);
    }
  }, []);

  return (
    <div className="game-container glass-panel">
      <div className="game-header">
        <h2>Neon Slither</h2>
        <div className="score-display">Score: {score}</div>
      </div>
      
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={500} 
          className="game-canvas"
        />
        
        {gameOver && (
          <div className="overlay glass-panel">
            <h3>GAME OVER</h3>
            <p>Final Score: {score}</p>
            <button className="btn btn-primary" onClick={resetGame}>Play Again</button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="overlay glass-panel">
            <h3>PAUSED</h3>
            <p>Press Space to Resume</p>
          </div>
        )}

        {!gameStarted && !gameOver && !isPaused && (
          <div className="overlay start-overlay">
            <p>Press any arrow key to start</p>
          </div>
        )}
      </div>

      <div className="controls-hint">
        Use WASD or Arrow Keys to move. Space to pause.
      </div>
    </div>
  );
};

export default SnakeGame;
