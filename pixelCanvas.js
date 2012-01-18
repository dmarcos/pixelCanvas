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

  var filters = {};
  var texture;

  var cursorToPixel = function(cursorX, cursorY){
    var viewportPixelX = cursorX / zoomFactor;
    var viewportPixelY = cursorY / zoomFactor;
    var xCoordinate = Math.floor(viewportPosition.x + viewportPixelX);
    var yCoordinate = Math.floor(viewportPosition.y + viewportPixelY);
    var raDec;
    var cursorInfo = {
      "x" : xCoordinate,
      "y" : yCoordinate,
      "value" : pixelValues[xCoordinate + yCoordinate*offScreenCanvasHeight]
    };
    if (FITS.wcsMapper) {
      raDec = FITS.wcsMapper.pixelToCoordinate(xCoordinate, yCoordinate);
      cursorInfo.ra = raDec.ra;
      cursorInfo.dec = raDec.dec;
    }
    return cursorInfo;
  };

  var coordinateToCanvasPixel = function(x,y){
    var imageCoordinates = cursorToPixel(x, y);
    var viewportCoordinates = cursorToPixel(x, y);
  };

  var centerViewport = function(scaleFactor, zoomIn, cursorX, cursorY){
    var newPositionX;
    var newPositionY;
    var translationX = cursorX / scaleFactor;
    var translationY = cursorY / scaleFactor;
    var xOffset = zoomIn? translationX : - translationX / 2; 
    var yOffset = zoomIn? translationY : - translationY / 2; 
    newPositionX = viewportPosition.x + xOffset; 
    newPositionY = viewportPosition.y + yOffset; 
    if (newPositionX < 0 || newPositionY < 0) {
      return;
    }
    viewportPosition.x = newPositionX;
    viewportPosition.y = newPositionY;
  };

  var scaleViewport = function(zoomFactor){
    viewportWidth = onScreenCanvasWidth / zoomFactor;
    viewportHeight = onScreenCanvasHeight / zoomFactor;
  };

  var renderPixels = function (pixels, width, height, canvas) {
    var byteBuffer = new ArrayBuffer(pixels.length);
    var byteUIntBuffer = new Uint8Array(byteBuffer); 
    var pixelIndex = 0;
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
    scaleViewport(zoomFactor); 
    onScreenContext.clearRect(0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
    onScreenContext.drawImage(offScreenCanvas, viewportPosition.x, viewportPosition.y, viewportWidth, viewportHeight, 0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
  };

  var mouseMoved = function(event){
    var scrollVector;
    var mousePosition;
    if (mouseDown) {
      scrollVector = {};
      mousePosition = {};
      mousePosition.x = event.layerX || event.offsetX; 
      mousePosition.y = event.layerY || event.offsetY;
      scrollVector.x = lastScrollPosition.x - mousePosition.x; 
      scrollVector.y = lastScrollPosition.y - mousePosition.y;
      if (viewportPosition.x + scrollVector.x >= 0 && 
          viewportPosition.x + scrollVector.x + viewportWidth <= offScreenCanvasWidth ) {
            viewportPosition.x = viewportPosition.x + scrollVector.x / zoomFactor;
            lastScrollPosition.x = mousePosition.x;
      }
          
      if(viewportPosition.y + scrollVector.y >= 0 && 
         viewportPosition.y + scrollVector.y + viewportHeight <= offScreenCanvasHeight ) {
           viewportPosition.y = viewportPosition.y + scrollVector.y / zoomFactor;
           lastScrollPosition.y = mousePosition.y;
      }
      draw();
    }
    onHoverPixelChanged(cursorToPixel(event.offsetX, event.offsetY));
    //highlightPixel(event.offsetX, event.offsetY);
  };
  
  var buttonPressed = function(event){
    mouseDown = true;
    lastScrollPosition.x = event.layerX || event.offsetX;
    lastScrollPosition.y = event.layerY || event.offsetY;
  };
  
  var buttonReleased = function(){
    mouseDown = false;
  };
  
  var mouseOut = function(){
    mouseDown = false;
  };

  var zoom = function(newZoomFactor, mouseX, mouseY){
    if (newZoomFactor >= 1 && newZoomFactor < zoomFactor || // Zoom out
        newZoomFactor > zoomFactor && viewportHeight >= 2 && viewportWidth >= 2) { // Zoom In
      centerViewport(newZoomFactor, newZoomFactor > zoomFactor, mouseX, mouseY);    
      zoomFactor = newZoomFactor; 
      //highlightPixel(event.offsetX, event.offsetY);
      draw();
    }
  };

  var doubleClick = function (event) {
    zoomIn(event.offsetX, event.offsetY);
  };

  var zoomIn = function(mouseX, mouseY) {
    zoom(zoomFactor*2, mouseX, mouseY);
  };
  
  var wheelMoved = function (event){
    var wheel = event.wheelDelta/120;//n or -n
    zoom(wheel > 0? zoomFactor*2 : zoomFactor/2, event.offsetX, event.offsetY);
  };
  
  var drawPixels = function (pixels, width, height, canvas) {   
    canvas.onmousedown = buttonPressed;
    canvas.onmouseup = buttonReleased;
    canvas.addEventListener('mousemove', mouseMoved, false);
    canvas.addEventListener('mouseout', mouseOut, false);
    canvas.addEventListener('mousewheel', wheelMoved, false);
    canvas.ondblclick = doubleClick;

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

  filters.brightnessContrast = function(brightness, contrast){
    if(!offScreenCanvas) {
      return;
    }
    offScreenCanvas.draw(texture).brightnessContrast(brightness,contrast).update();
    draw();
  };

  return {  
    'drawPixels' : drawPixels,
    'filters' : filters 
  };

});


