import { drawFacePath } from './helpers/drawFacePath.js';

var video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
};

video.addEventListener('playing', () => {
  // Set up canvas
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  // Make detections
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
    // faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    // Get position of each eye
    // console.log(detections[0].landmarks.getLeftEye());

    // Get position of mouth

    // Get position of nose

    // Draw red over whole face
    // console.log(detections[0].landmarks.getJawOutline());
    const jawOutline = resizedDetections[0].landmarks.getJawOutline();
    // console.log(jawOutline[0]);
    const ctx = canvas.getContext('2d');
    //ctx.globalCompositeOperation = 'source-over';
    // ctx.fillStyle = '#FF372A';
    let facePath = drawFacePath(jawOutline, ctx);
    // ctx.beginPath();
    // facePath.moveTo(jawOutline[0].x, jawOutline[0].y);
    // jawOutline.forEach(element => {
    //   facePath.lineTo(element.x, element.y);
    // })
    
    // // Continue the line making more of an oval shape
    // const faceHeight = jawOutline[8].y - jawOutline[0].y;
    // const outsideYCoords = jawOutline[0].y - ((faceHeight / 100) * 30);
    // const insideYCoords = jawOutline[0].y - ((faceHeight / 100) * 36);
    // // Draw lines for top half of face
    // facePath.lineTo(jawOutline[12].x, outsideYCoords);
    // facePath.lineTo(jawOutline[10].x, insideYCoords);
    // facePath.lineTo(jawOutline[7].x, insideYCoords);
    // facePath.lineTo(jawOutline[5].x, outsideYCoords);


    let leftEyePath = new Path2D;
    // Remove red pixels from eyes, nose and mouth
    const leftEye = resizedDetections[0].landmarks.getLeftEye();
    // ctx.globalCompositeOperation = 'destination-out';
    // ctx.fillStyle = 'rgba(225,225,225,1)';
    // Make eye bigger
    leftEye[0].x = leftEye[0].x - 15;
    leftEye[3].x = leftEye[0].x + 15;
    ctx.beginPath();
    leftEyePath.moveTo(leftEye[0].x, leftEye[0].y);
    leftEye.forEach((element, index) => {
      if (index === 1 || index === 2) {
        leftEyePath.lineTo(element.x, element.y + 15);
      } else if (index === 4 || index === 5) {
        leftEyePath.lineTo(element.x, element.y - 15);
      } else {
        leftEyePath.lineTo(element.x, element.y);
      }
    });

    let rightEyePath = new Path2D;
    const rightEye = resizedDetections[0].landmarks.getRightEye();
    // ctx.globalCompositeOperation = 'destination-out';
    // ctx.fillStyle = 'rgba(225,225,225,1)';
    // Make eye bigger
    rightEye[0].x = rightEye[0].x - 15;
    rightEye[3].x = rightEye[0].x + 15;
    ctx.beginPath();
    rightEyePath.moveTo(rightEye[0].x, rightEye[0].y);
    rightEye.forEach((element, index) => {
      if (index === 1 || index === 2) {
        rightEyePath.lineTo(element.x, element.y + 15);
      } else if (index === 4 || index === 5) {
        rightEyePath.lineTo(element.x, element.y - 15);
      } else {
        rightEyePath.lineTo(element.x, element.y);
      }
    });

    let nosePath = new Path2D;
    const nose = resizedDetections[0].landmarks.getNose();
    // ctx.globalCompositeOperation = 'destination-out';
    // ctx.fillStyle = 'rgba(225,225,225,1)';
    ctx.beginPath();
    nosePath.moveTo(nose[0].x, nose[0].y);
    nose.forEach(element => {
      nosePath.lineTo(element.x, element.y);
    });
    // ctx.fill();

    let mouthPath = new Path2D;
    const mouth = resizedDetections[0].landmarks.getMouth();
    // ctx.globalCompositeOperation = 'destination-out';
    // ctx.fillStyle = 'rgba(225,225,225,1)';
    ctx.beginPath();
    mouthPath.moveTo(mouth[0].x, mouth[0].y);
    mouth.forEach(element => {
      mouthPath.lineTo(element.x, element.y);
    });
    // ctx.fill();

    // Create red block
    function RedBlock(middleCoord) {
      this.blockDimensions = (Math.random() + 1) * 4.5;
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
    }

    const crosshairDimensions = 8;
    const crosshairHalfDimensions = crosshairDimensions/2;

    // Create red crosshair
    function RedCrosshair(middleCoord) {
      this.middleCoord = middleCoord;

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
    }

    function getRandomCoord() {
      const randomCoord = {};
      randomCoord.x = Math.random() * (jawOutline[15].x - jawOutline[0].x) + jawOutline[0].x;
      randomCoord.y = Math.random() * (insideYCoords - jawOutline[8].y) + jawOutline[8].y;
      return randomCoord;
    }

    // Generate a random coordinate between this rectangle
    for (var i = 0; i < 420; i++) {
      let randomCoordVal = getRandomCoord();

      if (!ctx.isPointInPath(facePath, randomCoordVal.x, randomCoordVal.y) 
      || ctx.isPointInPath(leftEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(rightEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(nosePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(mouthPath, randomCoordVal.x, randomCoordVal.y)) {
        // console.log('true');
        randomCoordVal = getRandomCoord();
      } else {
        const crosshair = new RedCrosshair(randomCoordVal);
        // console.log(crosshair.middleCoord);
        crosshair.draw();
      }
    }

    for (var j = 0; j < 880; j++) {
      let randomCoordVal = getRandomCoord();
      // console.log(randomCoordVal);

      if (!ctx.isPointInPath(facePath, randomCoordVal.x, randomCoordVal.y) 
      || ctx.isPointInPath(leftEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(rightEyePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(nosePath, randomCoordVal.x, randomCoordVal.y)
      || ctx.isPointInPath(mouthPath, randomCoordVal.x, randomCoordVal.y)) {
        // console.log('true');
        randomCoordVal = getRandomCoord();
      } else {
        const block = new RedBlock(randomCoordVal);
        // console.log(block.middleCoord);
        block.draw();
      }
    }

    // Check if it is within the face and outside of eye nose or mouth

    // Generate x amount of them, (make a class and have one parameter be the middle coordinate)

    // Maybe weight more towards blocks but play with it

    // Plot them randomly around the face checking:
    // Within face, outside eye nose and mouth
  }, 100)
})

startVideo();