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

  var renderPixels = function (pixels, canvas) {
    var context = canvas.getContext("2d");
    var image = context.createImageData(canvas.getAttribute('width'), canvas.getAttribute('height'));
    var pixelIndex = 0;
    while (pixelIndex < pixels.length) {
      image.data[pixelIndex] = pixels[pixelIndex];
      image.data[pixelIndex + 1] = pixels[pixelIndex + 1];
      image.data[pixelIndex + 2] = pixels[pixelIndex + 2];
      image.data[pixelIndex + 3] = pixels[pixelIndex + 3];
      pixelIndex += 4;
    }
    context.clearRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
    context.putImageData(image, 0, 0);
  };

  var draw = function() {
    onScreenContext.clearRect(0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
    onScreenContext.drawImage(offScreenCanvas, viewportPosition.x, viewportPosition.y, viewportWidth, viewportHeight, 0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
  };
  
  var drawPixels = function (pixels, height, width, canvas) {   
    //canvas.onmousedown = buttonPressed;
    //canvas.onmouseup = buttonReleased;
    //canvas.addEventListener('mousemove', mouseMoved, false);
    //canvas.addEventListener('mouseout', mouseOut, false);
    //canvas.addEventListener('mousewheel', wheelMoved, false);
    //canvas.ondblclick = doubleClick;

    offScreenCanvas = document.createElement('canvas');
    offScreenContext = offScreenCanvas.getContext('2d');
    offScreenCanvas.setAttribute('width', height);
    offScreenCanvas.setAttribute('height', width);
    offScreenCanvasWidth = height;
    offScreenCanvasHeight = width;

    onScreenCanvas = canvas;
    onScreenContext = onScreenCanvas.getContext('2d');
    viewportWidth = parseInt(onScreenCanvas.getAttribute('width'), 10);
    viewportHeight = parseInt(onScreenCanvas.getAttribute('height'), 10);
    viewportWidth = offScreenCanvasWidth >= viewportWidth? viewportWidth : offScreenCanvasWidth;
    viewportHeight = offScreenCanvasHeight >= viewportHeight? viewportHeight : offScreenCanvasHeight;
    onScreenCanvasWidth = viewportWidth;
    onScreenCanvasHeight = viewportHeight;
    //onScreenCanvas.style.width = viewportWidth + 'px';
    //onScreenCanvas.style.height = viewportHeight + 'px';

    onScreenCanvas.onselectstart = function () { return false; }; // ie 

    zoomFactor = 1;

    renderPixels(pixels, offScreenCanvas);
    draw();

  };

  return {  
    'drawPixels' : drawPixels 
  };

});


