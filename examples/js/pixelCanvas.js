define(function () {
  "use strict";

  var offScreenCanvas;
  var offScreenContext;
  var offScreenCanvasWidth;
  var offScreenCanvasHeight;

  var onScreenCanvas;
  var onScreenContext;
  var onScreenCanvasWidth;
  var onScreenCanvasHeight;

  var viewportPosition = { x : 0, y : 0 };
  var viewportWidth;
  var viewportHeight;

  var lastScrollPosition = {};
  var mouseDown = false;
  var zoomFactor = 1;

  var renderPixels = function (pixels, width, height, canvas) {
    var byteBuffer = new ArrayBuffer(pixels.length);
    var byteUIntBuffer = new Uint8Array(byteBuffer); 
    var pixelIndex = 0;
    var texture;
    while (pixelIndex < pixels.length) {
      byteUIntBuffer[pixelIndex] = pixels[pixelIndex];
      byteUIntBuffer[pixelIndex + 1] = pixels[pixelIndex + 1];
      byteUIntBuffer[pixelIndex + 2] = pixels[pixelIndex + 2];
      byteUIntBuffer[pixelIndex + 3] = pixels[pixelIndex + 3];
      pixelIndex += 4;
    } 
    texture = offScreenCanvas.texture(byteBuffer, width, height);
    canvas.draw(texture).update();
    //var context = canvas.getContext("2d");
    //var image = context.createImageData(canvas.getAttribute('width'), canvas.getAttribute('height'));
    //var pixelIndex = 0;
    //while (pixelIndex < pixels.length) {
    //  image.data[pixelIndex] = pixels[pixelIndex];
    //  image.data[pixelIndex + 1] = pixels[pixelIndex + 1];
    //  image.data[pixelIndex + 2] = pixels[pixelIndex + 2];
    //  image.data[pixelIndex + 3] = pixels[pixelIndex + 3];
    //  pixelIndex += 4;
    //}
    //context.clearRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
    //context.putImageData(image, 0, 0);
  };

  var draw = function() {
    onScreenContext.clearRect(0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
    onScreenContext.drawImage(offScreenCanvas, viewportPosition.x, viewportPosition.y, viewportWidth, viewportHeight, 0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
  };
  
  var drawPixels = function (pixels, width, height, canvas) {   
    //canvas.onmousedown = buttonPressed;
    //canvas.onmouseup = buttonReleased;
    //canvas.addEventListener('mousemove', mouseMoved, false);
    //canvas.addEventListener('mouseout', mouseOut, false);
    //canvas.addEventListener('mousewheel', wheelMoved, false);
    //canvas.ondblclick = doubleClick;

    offScreenCanvas = fx.canvas(); // document.createElement('canvas');
    offScreenContext = offScreenCanvas.getContext('2d');
   
    offScreenCanvas.setAttribute('width', width);
    offScreenCanvas.setAttribute('height', height);
    offScreenCanvasWidth = width;
    offScreenCanvasHeight = height;

    onScreenCanvas = canvas;
    onScreenContext = onScreenCanvas.getContext('2d');
    viewportWidth = parseInt(onScreenCanvas.getAttribute('width'), 10);
    viewportHeight = parseInt(onScreenCanvas.getAttribute('height'), 10);
    viewportWidth = offScreenCanvasWidth >= viewportWidth? viewportWidth : offScreenCanvasWidth;
    viewportHeight = offScreenCanvasHeight >= viewportHeight? viewportHeight : offScreenCanvasHeight;
    onScreenCanvasWidth = viewportWidth;
    onScreenCanvasHeight = viewportHeight;

    onScreenCanvas.onselectstart = function () { return false; }; // ie 

    zoomFactor = 1;

    renderPixels(pixels, width, height, offScreenCanvas);
    draw();

  };

  return {  
    'drawPixels' : drawPixels 
  };

});


