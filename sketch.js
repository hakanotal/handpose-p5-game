let video, handpose;
let ball, spawn, goal;
let poses = [];
let counter = 0;
let is_goal_scored = false;

const GOAL_COLOR = "#eeb211";
const SPAWN_COLOR = "#46166b";
const BALL_COLOR = "#00ff9f";
const HAND_COLOR = "#ff2a6d";
const FINGER_COLOR = "#00b8ff";


function setup() {
  cnv = createCanvas(int(windowWidth * 0.9), int(windowHeight * 0.9));
  cnv.center('horizontal');
  noStroke();
  textSize(40);
  frameRate(20);

  video = createCapture(VIDEO);
  //video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);

  spawn = new Group();
  spawn.collider = "static";
  spawn.color = SPAWN_COLOR;

  goal = new Group();
  goal.collider = "static";
  goal.color = GOAL_COLOR;
  setupBorders();
  
  balls = new Group();
  ball = new balls.Sprite(xSpot, ySpot, width * 0.04);
  balls.color = BALL_COLOR;
  world.gravity.y = 9;
}

function modelReady() {
  console.log("Model loaded");
  handpose.on("predict", (results) => poses = results);
}

function draw() {
  stroke(200);
  strokeWeight(1);

  clear();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  drawHand();

  //replace ball if it falls
  if (ball.y > height) {
    ball.position.x = xSpot;
    ball.position.y = ySpot;
  }

  // increase counter if ball hits goal
  if (!is_goal_scored && goal[0].collides(ball)) {
    is_goal_scored = true;
    setTimeout(() => {
      counter++;
      ball.position.x = xSpot;
      ball.position.y = ySpot;
      ball.velocity.y = 0;
      is_goal_scored = false;
    }, 750);
  }

  // display counter
  push(); // Save current state of the canvas
  scale(-1, 1); 
  translate(-width, 0);
  fill(HAND_COLOR);
  text(counter, width * 0.5, height * 0.1);
  pop()
}

function drawHand() {

  let scaleX = width / video.width;
  let scaleY = height / video.height;

  for (let i = 0; i < poses.length; i++) {
    // Get the hand prediction
    const prediction = poses[i];
 
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const keypoint = prediction.landmarks[j];
      fill(HAND_COLOR);
      circle(keypoint[0] * scaleX, keypoint[1] * scaleY, width * 0.01);
    }

    const indexFinger = prediction.annotations.indexFinger[3]
    const iX = indexFinger[0] * scaleX;
    const iY = indexFinger[1] * scaleY;
    const thumb = prediction.annotations.thumb[3]
    const tX = thumb[0] * scaleX;
    const tY = thumb[1] * scaleY;

    fill(FINGER_COLOR);
    circle(iX, iY, width * 0.015);
    circle(tX, tY, width * 0.015);

    // grab if thumb and pointer fingers are close
    const centerX = (iX + tX) / 2;
    const centerY = (iY + tY) / 2;

    const d1 = dist(iX, iY, tX, tY);
    const d2 = dist(centerX, centerY, ball.x, ball.y);

    if (d1 < 120 && d2 < 100) {
      console.log("grabbed");
      ball.position.x = centerX;
      ball.position.y = centerY;
      ball.velocity.y = 0;
    }
  }
}

function setupBorders() {
  xSpot = width * 0.8;
  ySpot = height * 0.5;

  border = new goal.Sprite(
    xSpot,
    ySpot + height * 0.04,
    width * 0.1,
    width * 0.01
  );
  border = new goal.Sprite(
    xSpot - width * 0.05,
    ySpot,
    width * 0.01,
    height * 0.1
  );
  border = new goal.Sprite(
    xSpot + width * 0.05,
    ySpot,
    width * 0.01,
    height * 0.1
  );

  xSpot = width * 0.2;
  border = new spawn.Sprite(
    xSpot,
    ySpot + height * 0.04,
    width * 0.1,
    width * 0.01
  );
  border = new spawn.Sprite(
    xSpot - width * 0.05,
    ySpot,
    width * 0.01,
    height * 0.1
  );
  border = new spawn.Sprite(
    xSpot + width * 0.05,
    ySpot,
    width * 0.01,
    height * 0.1
  );
}
