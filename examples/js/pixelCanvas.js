define(function () {
  "use strict";
  
  var drawPixels = function (pixels, canvas) {
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
    //onScreenContext.drawImage(offScreenCanvas, viewportPosition.x, viewportPosition.y, viewportWidth, viewportHeight, 0, 0, onScreenCanvasWidth, onScreenCanvasHeight);
  };

  return {
    'drawPixels' : drawPixels 
  };

});


