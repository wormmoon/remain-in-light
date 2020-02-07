function drawFacePath(jawOutline, ctx) {
  let _facePath = new Path2D;
  ctx.beginPath();
  _facePath.moveTo(jawOutline[0].x, jawOutline[0].y);
  jawOutline.forEach(element => {
    _facePath.lineTo(element.x, element.y);
  })
  
  // Continue the line making more of an oval shape
  const faceHeight = jawOutline[8].y - jawOutline[0].y;
  const outsideYCoords = jawOutline[0].y - ((faceHeight / 100) * 30);
  const insideYCoords = jawOutline[0].y - ((faceHeight / 100) * 36);

  // Draw lines for top half of face
  _facePath.lineTo(jawOutline[12].x, outsideYCoords);
  _facePath.lineTo(jawOutline[10].x, insideYCoords);
  _facePath.lineTo(jawOutline[7].x, insideYCoords);
  _facePath.lineTo(jawOutline[5].x, outsideYCoords);

  return _facePath;
}

export {drawFacePath};
