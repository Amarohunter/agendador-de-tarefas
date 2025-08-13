import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  direction: number;
  alive: boolean;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const DUCK_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const ENEMY_SIZE = 30;
const COIN_SIZE = 20;

const DuckGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  const [duck, setDuck] = useState<Position & { velocityY: number; onGround: boolean }>({
    x: 100,
    y: 400,
    velocityY: 0,
    onGround: false
  });

  const [keys, setKeys] = useState({
    left: false,
    right: false,
    up: false
  });

  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, x: 300, y: 450, direction: 1, alive: true },
    { id: 2, x: 500, y: 350, direction: -1, alive: true },
    { id: 3, x: 650, y: 450, direction: 1, alive: true }
  ]);

  const [coins, setCoins] = useState<Coin[]>([
    { id: 1, x: 200, y: 400, collected: false },
    { id: 2, x: 400, y: 300, collected: false },
    { id: 3, x: 600, y: 350, collected: false },
    { id: 4, x: 750, y: 400, collected: false }
  ]);

  const platforms: Platform[] = [
    { x: 0, y: 500, width: 800, height: 100 }, // Ground
    { x: 250, y: 400, width: 150, height: 20 },
    { x: 450, y: 300, width: 150, height: 20 },
    { x: 150, y: 350, width: 100, height: 20 },
    { x: 650, y: 350, width: 120, height: 20 }
  ];

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;
    
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeys(prev => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeys(prev => ({ ...prev, right: true }));
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        e.preventDefault();
        setKeys(prev => ({ ...prev, up: true }));
        break;
    }
  }, [gameStarted, gameOver]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeys(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeys(prev => ({ ...prev, right: false }));
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        setKeys(prev => ({ ...prev, up: false }));
        break;
    }
  }, []);

  // Check collision with platforms
  const checkPlatformCollision = (x: number, y: number, width: number, height: number) => {
    return platforms.find(platform => 
      x < platform.x + platform.width &&
      x + width > platform.x &&
      y < platform.y + platform.height &&
      y + height > platform.y
    );
  };

  // Check if duck is on ground
  const isOnGround = (x: number, y: number) => {
    const platform = checkPlatformCollision(x, y + DUCK_SIZE + 1, DUCK_SIZE, 1);
    return !!platform;
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setDuck(prevDuck => {
        let newX = prevDuck.x;
        let newY = prevDuck.y;
        let newVelocityY = prevDuck.velocityY;
        
        // Horizontal movement
        if (keys.left && newX > 0) {
          newX -= MOVE_SPEED;
        }
        if (keys.right && newX < GAME_WIDTH - DUCK_SIZE) {
          newX += MOVE_SPEED;
        }
        
        // Jumping
        if (keys.up && prevDuck.onGround) {
          newVelocityY = JUMP_FORCE;
        }
        
        // Apply gravity
        newVelocityY += GRAVITY;
        newY += newVelocityY;
        
        // Check platform collision
        const onGround = isOnGround(newX, newY);
        if (onGround && newVelocityY > 0) {
          const platform = checkPlatformCollision(newX, newY + DUCK_SIZE, DUCK_SIZE, 1);
          if (platform) {
            newY = platform.y - DUCK_SIZE;
            newVelocityY = 0;
          }
        }
        
        // Prevent falling through bottom
        if (newY > GAME_HEIGHT - DUCK_SIZE) {
          newY = GAME_HEIGHT - DUCK_SIZE;
          newVelocityY = 0;
        }
        
        return {
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          onGround: onGround || newY >= GAME_HEIGHT - DUCK_SIZE
        };
      });

      // Move enemies
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          if (!enemy.alive) return enemy;
          
          let newX = enemy.x + enemy.direction * 2;
          
          // Reverse direction at edges or platform ends
          if (newX <= 0 || newX >= GAME_WIDTH - ENEMY_SIZE) {
            return { ...enemy, direction: -enemy.direction };
          }
          
          return { ...enemy, x: newX };
        })
      );

      // Check collisions
      setEnemies(prevEnemies => {
        const newEnemies = prevEnemies.map(enemy => {
          if (!enemy.alive) return enemy;
          
          // Check collision with duck
          if (
            duck.x < enemy.x + ENEMY_SIZE &&
            duck.x + DUCK_SIZE > enemy.x &&
            duck.y < enemy.y + ENEMY_SIZE &&
            duck.y + DUCK_SIZE > enemy.y
          ) {
            // If duck is falling on enemy, kill enemy
            if (duck.velocityY > 0 && duck.y < enemy.y) {
              setScore(prev => prev + 100);
              return { ...enemy, alive: false };
            } else {
              // Duck gets hurt
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
              // Reset duck position
              setDuck(prev => ({ ...prev, x: 100, y: 400, velocityY: 0 }));
            }
          }
          
          return enemy;
        });
        
        return newEnemies;
      });

      // Check coin collection
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          if (coin.collected) return coin;
          
          if (
            duck.x < coin.x + COIN_SIZE &&
            duck.x + DUCK_SIZE > coin.x &&
            duck.y < coin.y + COIN_SIZE &&
            duck.y + DUCK_SIZE > coin.y
          ) {
            setScore(prev => prev + 50);
            return { ...coin, collected: true };
          }
          
          return coin;
        })
      );

    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, keys, duck.velocityY, duck.y, duck.x]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setDuck({ x: 100, y: 400, velocityY: 0, onGround: true });
    setEnemies([
      { id: 1, x: 300, y: 450, direction: 1, alive: true },
      { id: 2, x: 500, y: 350, direction: -1, alive: true },
      { id: 3, x: 650, y: 450, direction: 1, alive: true }
    ]);
    setCoins([
      { id: 1, x: 200, y: 400, collected: false },
      { id: 2, x: 400, y: 300, collected: false },
      { id: 3, x: 600, y: 350, collected: false },
      { id: 4, x: 750, y: 400, collected: false }
    ]);
  };

  const restartGame = () => {
    startGame();
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-8">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">🦆 Duck Mario</h1>
          <p className="text-xl text-white/90 mb-8">
            Ajude o pato a coletar moedas e derrotar inimigos!
          </p>
          <div className="text-white/80 mb-8 space-y-2">
            <p>🎮 Use as setas ou WASD para mover</p>
            <p>⬆️ Espaço ou seta para cima para pular</p>
            <p>🪙 Colete moedas para pontos</p>
            <p>👾 Pule nos inimigos para derrotá-los</p>
          </div>
          <Button 
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 py-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Começar Jogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-4">
      {/* Game UI */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-4">
        <div className="flex gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Score: {score}
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Lives: {'❤️'.repeat(lives)}
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Level: {level}
          </Badge>
        </div>
        {gameOver && (
          <Button onClick={restartGame} variant="destructive">
            Jogar Novamente
          </Button>
        )}
      </div>

      {/* Game Canvas */}
      <div 
        ref={gameRef}
        className="relative bg-gradient-to-b from-sky-300 to-green-300 border-4 border-brown-600 rounded-lg overflow-hidden shadow-2xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Platforms */}
        {platforms.map((platform, index) => (
          <div
            key={index}
            className={`absolute ${index === 0 ? 'bg-green-600' : 'bg-amber-700'} border-2 border-amber-800`}
            style={{
              left: platform.x,
              top: platform.y,
              width: platform.width,
              height: platform.height
            }}
          />
        ))}

        {/* Duck */}
        <div
          className="absolute text-4xl transition-all duration-75 flex items-center justify-center"
          style={{
            left: duck.x,
            top: duck.y,
            width: DUCK_SIZE,
            height: DUCK_SIZE,
            transform: keys.left ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        >
          🦆
        </div>

        {/* Enemies */}
        {enemies.map(enemy => (
          enemy.alive && (
            <div
              key={enemy.id}
              className="absolute text-2xl flex items-center justify-center"
              style={{
                left: enemy.x,
                top: enemy.y,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                transform: enemy.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)'
              }}
            >
              🐢
            </div>
          )
        ))}

        {/* Coins */}
        {coins.map(coin => (
          !coin.collected && (
            <div
              key={coin.id}
              className="absolute text-xl flex items-center justify-center animate-bounce"
              style={{
                left: coin.x,
                top: coin.y,
                width: COIN_SIZE,
                height: COIN_SIZE
              }}
            >
              🪙
            </div>
          )
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
              <p className="text-xl mb-4">Score Final: {score}</p>
              <Button onClick={restartGame} size="lg">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="mt-4 text-white/80 text-center text-sm">
        <p>Use as setas ou WASD para mover • Espaço para pular</p>
      </div>
    </div>
  );
};

export default DuckGame;