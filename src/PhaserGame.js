import React, { useRef, useEffect } from "react";
import Phaser from "phaser";
import bg from "./assets/bg_image.jpeg";
import cactus from "./assets/cactus.png";
import dude from "./assets/dude.png";
import dynamite from "./assets/dynamite (1).png";
import fire_arrow from "./assets/fire_arrow (1).png";
import new_ball from "./assets/new_ball.png";
import platform from "./assets/platform.png";
import star from "./assets/star.png";
import fire_ball from "./assets/fire_ball.png";
import bomb from "./assets/bomb.png";
import gameOverSound from "./assets/game_over_music.wav";

let background,
  platforms,
  obstacleTypes,
  obstacles,
  gameOverSoundInstance,
  score,
  lives,
  scoreText,
  livesText,
  buttonBackground,
  restartText,
  gameOverText,
  yourScoreText,
  scoreIncrease,
  moveUpButton,
  player,
  cursors,
  gameOver,
  levelText;
let backgroundSpeed = 1.5;
let obstacleSpeed = -100;
let levelIncrease;
let level = 0;

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1420,
      height: 650,
      parent: gameRef.current,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image("sky", bg);
      this.load.image("ground", platform);
      this.load.image("star", star);
      this.load.image("bomb", new_ball);
      this.load.spritesheet("dude", dude, {
        frameWidth: 30,
        frameHeight: 46,
      });
      this.load.image("obstacle1", fire_ball);
      this.load.image("obstacle2", dynamite);
      this.load.image("obstacle3", fire_arrow); 
      this.load.audio("gameOverSound", gameOverSound);
    }

    function create(data) {
      background = this.add.tileSprite(0, 0, 1420, 650, "sky");
      background.setOrigin(0, 0);
      
      platforms = this.physics.add.staticGroup();
      platforms.create(400, 600, "ground").setScale(5, 2).refreshBody();
      platforms.create(400, 10, "ground").setScale(5, 2).refreshBody();

      obstacleTypes = ["obstacle1", "obstacle2", "obstacle3"];
      obstacles = this.physics.add.group();

      score = 0;
      lives = data.lives !== undefined ? data.lives : 3;
 

      scoreText = this.add.text(20, 40, "Score: 0", {
        fontSize: "32px",
        fill: "#000",
      });

      levelText = this.add.text(1100, 40, "level: 0", {
        fontSize: "32px",
        fill: "#000",
      });

      livesText = this.add.text(20, 70, "Lives: " + lives, {
        fontSize: "32px",
        fill: "#000",
      });

      buttonBackground = this.add.rectangle(700, 550, 160, 50, 0x3399cc);
      buttonBackground.setStrokeStyle(2, 0x000000);

      restartText = this.add.text(700, 550, "Restart", {
        fontSize: "32px",
        fill: "#000",
        align: "center",
      });

      gameOverText = this.add
        .text(630, 300, "", {
          fontSize: "32px",
          fill: "#fff",
        })
        .setOrigin(0.5);

      yourScoreText = this.add
        .text(630, 200, "", {
          fontSize: "32px",
          fill: "#fff",
        })
        .setOrigin(0.5);

      restartText.setOrigin(0.5, 0.5);
      buttonBackground.setInteractive();

      buttonBackground.on("pointerdown", () => {
        if (lives > 0 && gameOver) {
          this.scene.restart({ lives: lives });
        }
      });

      scoreIncrease = this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (!gameOver) {
            score += 1;
            scoreText.setText("Score: " + score);
          }
        },
        callbackScope: this,
        loop: true,
      });

      levelIncrease = this.time.addEvent({
        delay: 10000,
        callback: () => {
          if (!gameOver) {
            level += 1;
            levelText.setText(`level:${level}`);
            increaseSpeedOfobstacle();
          }
        },
        callbackScope: this,
        loop: true,
      });

      moveUpButton = this.add.text(500, 550, "MOVE UP", {
        fontSize: "25px arial",
        fill: "#000",
        align: "center",
      });

      moveUpButton.setOrigin(0.5, 0.5);
      moveUpButton.setInteractive();
      moveUpButton.on("pointerdown", () => {
        player.setVelocityY(-200);
      });
 
      
      player = this.physics.add.sprite(700, 200, "bomb");
      player.setBounce(0.6);
      player.setCollideWorldBounds(true);

      this.physics.add.collider(player, platforms, gameOverHandler, null, this);
      this.physics.add.collider(player, obstacles, gameOverHandler, null, this);

      cursors = this.input.keyboard.createCursorKeys();
      gameOver = false;  

      gameOverSoundInstance = this.sound.add("gameOverSound");
    }

    function update() {
      if (gameOver) {
        return;
      }

      background.tilePositionX += backgroundSpeed;

      if (cursors.up.isDown) {
        player.setVelocityY(-200);
      } else if (cursors.right.isDown) {
        player.setVelocityX(180);
      } else if (cursors.left.isDown) {
        player.setVelocityX(-180);
      } else {
        player.setVelocityX(0);
      }

      obstacles.children.iterate((obstacle) => {
        obstacle.x -= backgroundSpeed;

        if (obstacle.x < -obstacle.width) {
          obstacle.x = 1420;
          obstacle.y = Phaser.Math.Between(100, 600);
        }
      });
    }

    function increaseSpeedOfobstacle() {
      spawnObstacle();
      backgroundSpeed += 0.5;
      obstacleSpeed -= 30;
    }

    function spawnObstacle() {
      let obstacleType = Phaser.Utils.Array.GetRandom(obstacleTypes);
      let obstacle = obstacles.create(
        1420,
        Phaser.Math.Between(100, 550),
        obstacleType
      );
      obstacle.setVelocityX(obstacleSpeed);
      obstacle.setCollideWorldBounds(false);
      obstacle.body.setAllowGravity(false);
    }

    function gameOverHandler() {
      lives -= 1;
      livesText.setText("Lives: " + lives);

      if (lives > 0) {
        gameOver = true;
        scoreIncrease.remove();
        levelIncrease.remove();
        gameOverText.setText(`Game Over!`);
        yourScoreText.setText(`Total Score: ${score}`);
        player.setTint(0xff0000);
        this.physics.pause(); 
        gameOverSoundInstance.play();
      } else {
        gameOver = true;
        scoreIncrease.remove();
        levelIncrease.remove();
        gameOverText.setText(`Game Over! No more lives`);
        yourScoreText.setText(`Total Score: ${score}`);
        player.setTint(0xff0000);
        this.physics.pause();
        gameOverSoundInstance.play();
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} style={{ width: "100%", height: "100%" }} />;
};

export default PhaserGame;
