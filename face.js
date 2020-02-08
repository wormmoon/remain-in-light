// Get video element
const video = document.getElementById('video');

// Load models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo);

// Start video
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
};

// When video is 'playing'
video.addEventListener('playing', () => {
  /* SET UP CANVAS
    -------------- */
  const canvas = faceapi.createCanvasFromMedia(video);
  // Add to DOM
  document.querySelector('.video-container').append(canvas);
  // Match canvas dimensions to webcam dimensions
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  /* DETECTIONS 
    ----------- */
  // Make detections every 0.1s
  setInterval(async () => {

    /* DETECT FACE(S) AND LANDMARKS
    ------------------------------- */
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    // Resize to display size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // Canvas settings
    canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
    const ctx = canvas.getContext('2d');

    /* SET UP FACE VARS
    ------------------- */
    const jawOutline = resizedDetections[0].landmarks.getJawOutline();
    const faceHeight = jawOutline[8].y - jawOutline[0].y;
    // Points for extending face upwards a little bit
    const outsideYCoords = jawOutline[0].y - ((faceHeight / 100) * 30);
    const insideYCoords = jawOutline[0].y - ((faceHeight / 100) * 50);

    /* CREATE LANDMARK PATHS
    ------------------------ */
    const facePath = getFacePath(ctx, jawOutline, outsideYCoords, insideYCoords);
    const leftEyePath = getLeftEyePath(ctx, resizedDetections);
    const rightEyePath = getRightEyePath(ctx, resizedDetections);
    const nosePath = getNosePath(ctx, resizedDetections);
    const mouthPath = getMouthPath(ctx, resizedDetections);

    /* GENERATE RED ELEMENTS
    ------------------------ */
    // Create base element dimensions (this allows blocks/crosshairs to be sized
    // relative to the size of the face)
    // 5% of the width of the face
    const baseElementDimension = (jawOutline[15].x - jawOutline[0].x) / 100 * 5;

    for (var i = 0; i < 420; i++) {
      // Get a random coordinate
      let randomCoordVal = getRandomCoord(jawOutline, insideYCoords);

      // Check it is within the face but not within a landmark
      if (!ctx.isPointInPath(facePath, randomCoordVal.x, randomCoordVal.y) 
      || ctx.isPointInPath(leftEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(rightEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(nosePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(mouthPath, randomCoordVal.x, randomCoordVal.y)) {
        // If it is, then pick a new coordinate
        randomCoordVal = getRandomCoord(jawOutline, insideYCoords);
      } else {
        // Create a new crosshair element with that coordinate
        const crosshair = new RedCrosshair(randomCoordVal, ctx, baseElementDimension);
        // Draw the element on the canvas
        crosshair.draw();
      }
    }

    // NB: The numbers in these loops are relatively arbitrary numbers
    // based on how many looked the best
    for (var j = 0; j < 880; j++) {
      // Get a random coordinate
      let randomCoordVal = getRandomCoord(jawOutline, insideYCoords);

      // Check it is within the face but not within a landmark
      if (!ctx.isPointInPath(facePath, randomCoordVal.x, randomCoordVal.y) 
      || ctx.isPointInPath(leftEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(rightEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(nosePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(mouthPath, randomCoordVal.x, randomCoordVal.y)) {
        // If it is then choose a new coordinate
        randomCoordVal = getRandomCoord(jawOutline, insideYCoords);
      } else {
        // Create a new red block element
        const block = new RedBlock(randomCoordVal, ctx, baseElementDimension);
        // Draw the block on the canvas at that coordinate
        block.draw();
      }
    }
  }, 100)
});

startVideo();


/* -----------------
   UTILITY FUNCTIONS
  ------------------ */

// Create face path
function getFacePath(ctx, jawOutline, outsideYCoords, insideYCoords) {
  //ctx.globalCompositeOperation = 'source-over';
  // ctx.fillStyle = '#FF372A';
  // Create new 2D path instance
  let facePath = new Path2D;
  ctx.beginPath();
  facePath.moveTo(jawOutline[0].x, jawOutline[0].y);

  // Make path through each point on jawline
  jawOutline.forEach(element => {
    facePath.lineTo(element.x, element.y);
  })

  // Draw lines to join top half of face
  facePath.lineTo(jawOutline[12].x, outsideYCoords);
  facePath.lineTo(jawOutline[10].x, insideYCoords);
  facePath.lineTo(jawOutline[7].x, insideYCoords);
  facePath.lineTo(jawOutline[5].x, outsideYCoords);

  return facePath;
}

// Get left eye path
function getLeftEyePath(ctx, resizedDetections) {
  let leftEyePath = new Path2D;
  const leftEye = resizedDetections[0].landmarks.getLeftEye();
  // ctx.globalCompositeOperation = 'destination-out';
  // ctx.fillStyle = 'rgba(225,225,225,1)';

  const eyeEnlargementNum = 20;
  
  // Make eye a little bigger
  leftEye[0].x = leftEye[0].x - eyeEnlargementNum;
  leftEye[3].x = leftEye[3].x + eyeEnlargementNum;
  
  // Go through each point on the eye and create path
  ctx.beginPath();
  leftEyePath.moveTo(leftEye[0].x, leftEye[0].y);
  leftEye.forEach((element, index) => {
    if (index === 1 || index === 2) {
      leftEyePath.lineTo(element.x, element.y + eyeEnlargementNum/1.5);
    } else if (index === 4 || index === 5) {
      leftEyePath.lineTo(element.x, element.y - eyeEnlargementNum/1.5);
    } else {
      leftEyePath.lineTo(element.x, element.y);
    }
  });

  return leftEyePath;
}

// Get right eye path
function getRightEyePath(ctx, resizedDetections) {
  let rightEyePath = new Path2D;
  const rightEye = resizedDetections[0].landmarks.getRightEye();
  // ctx.globalCompositeOperation = 'destination-out';
  // ctx.fillStyle = 'rgba(225,225,225,1)';

  const eyeEnlargementNum = 20;

  // Make eye a little bigger
  rightEye[0].x = rightEye[0].x - eyeEnlargementNum;
  rightEye[3].x = rightEye[3].x + eyeEnlargementNum;

  // Go through each point on the eye and create path
  ctx.beginPath();
  rightEyePath.moveTo(rightEye[0].x, rightEye[0].y);
  rightEye.forEach((element, index) => {
    if (index === 1 || index === 2) {
      rightEyePath.lineTo(element.x, element.y + eyeEnlargementNum/1.5);
    } else if (index === 4 || index === 5) {
      rightEyePath.lineTo(element.x, element.y - eyeEnlargementNum/1.5);
    } else {
      rightEyePath.lineTo(element.x, element.y);
    }
  });

  return rightEyePath;
}

// Get nose path
function getNosePath(ctx, resizedDetections) {
  let nosePath = new Path2D;
  const nose = resizedDetections[0].landmarks.getNose();
  // ctx.globalCompositeOperation = 'destination-out';
  // ctx.fillStyle = 'rgba(225,225,225,1)';

  // Go through each point on the nose and create path
  ctx.beginPath();
  nosePath.moveTo(nose[0].x, nose[0].y);
  nose.forEach(element => {
    nosePath.lineTo(element.x, element.y);
  });

  return nosePath;
}

// Get mouth path
function getMouthPath(ctx, resizedDetections) {
  let mouthPath = new Path2D;
  const mouth = resizedDetections[0].landmarks.getMouth();
  // ctx.globalCompositeOperation = 'destination-out';
  // ctx.fillStyle = 'rgba(225,225,225,1)';

  // Go through each point on the nose and create path
  ctx.beginPath();
  mouthPath.moveTo(mouth[0].x, mouth[0].y);
  mouth.forEach(element => {
    mouthPath.lineTo(element.x, element.y);
  });

  return mouthPath;
}


// Create red block
function RedBlock(middleCoord, ctx, baseElementDimension) {
  this.blockDimensions = (Math.random() + 1) * (baseElementDimension/1.3);
  this.blockHalfDimensions = this.blockDimensions/2;
  this.middleCoord = middleCoord;

  this.draw = function() {
    ctx.fillStyle = '#FF372A';
    ctx.beginPath();
    ctx.moveTo(this.middleCoord.x - this.blockHalfDimensions, this.middleCoord.y + this.blockHalfDimensions);
    ctx.lineTo(this.middleCoord.x + this.blockHalfDimensions, this.middleCoord.y + this.blockHalfDimensions);
    ctx.lineTo(this.middleCoord.x + this.blockHalfDimensions, this.middleCoord.y - this.blockHalfDimensions);
    ctx.lineTo(this.middleCoord.x - this.blockHalfDimensions, this.middleCoord.y - this.blockHalfDimensions);
    ctx.fill();
  }
};

// Create red crosshair
function RedCrosshair(middleCoord, ctx, baseElementDimension) {
  this.middleCoord = middleCoord;

  const crosshairDimensions = baseElementDimension;
  const crosshairHalfDimensions = crosshairDimensions/2;

  this.draw = function() {
    ctx.strokeStyle = '#FF372A';
    ctx.beginPath();
    ctx.moveTo(this.middleCoord.x, this.middleCoord.y + crosshairHalfDimensions);
    ctx.lineTo(this.middleCoord.x, this.middleCoord.y - crosshairHalfDimensions);
    ctx.stroke();
    ctx.moveTo(this.middleCoord.x - crosshairHalfDimensions, this.middleCoord.y);
    ctx.lineTo(this.middleCoord.x + crosshairHalfDimensions, this.middleCoord.y);
    ctx.stroke();
  }
};

// Create a random middle coordinate for a red element
function getRandomCoord(jawOutline, insideYCoords) {
  const randomCoord = {};
  // Create an imaginary rectangle around the face using the widest 2 points and the
  // 'tallest' 2 points and generate one xy coordinate within those bounds
  randomCoord.x = Math.random() * (jawOutline[15].x - jawOutline[0].x) + jawOutline[0].x;
  randomCoord.y = Math.random() * (insideYCoords - jawOutline[8].y) + jawOutline[8].y;
  return randomCoord;
}