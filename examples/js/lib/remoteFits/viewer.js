(function() {

  var calibrate_layers, canvas, context, file, files, index, init_layer, layers, normalize, _len;
  var _this = this;
  canvas = document.getElementById('mw-viewer');
  context = canvas.get(0).getContext("2d");
  file = "assets/ngc2967-i_16bit_wHAT_crush.png";
  files = ["assets/ngc2967-g_16bit_wHAT_crush.png", "assets/ngc2967-r_16bit_wHAT_crush.png", "assets/ngc2967-i_16bit_wHAT_crush.png"];
  layers = [];
  for (index = 0, _len = files.length; index < _len; index++) {
    file = files[index];
    BinaryAjax(file, function(oHTTP) {
      var data, image;
      layers.push(init_layer(oHTTP.responseText));
      if (layers.length === 3) {
        canvas.attr("width", layers[0].width);
        canvas.attr("height", layers[0].height);
        image = context.getImageData(0, 0, layers[0].width, layers[0].height);
        data = calibrate_layers(image.data);
        image.data = data;
        return context.putImageData(image, 0, 0);
      }
    });
  }

  normalize = function(value, min, alpha, Q) {
    value = alpha * Q * (value - min);
    return Math.log(value + Math.sqrt(1 + value * value)) / Q;
  };

  calibrate_layers = function(data) {
    var B, G, R, b, data_b, data_g, data_r, g, i, length, max_RGB, normalized_pixel, number_of_pixels, pixel, r, range, vmax, vmin, _ref;
    number_of_pixels = layers[0].data.length;
    length = 4 * number_of_pixels;
    vmin = Math.sqrt((layers[0].min + layers[1].min + layers[2].min) / 3);
    vmax = Math.sqrt((layers[0].max + layers[1].max + layers[2].max) / 3);
    range = vmax - vmin;
    data_r = layers[0].data;
    data_g = layers[1].data;
    data_b = layers[2].data;
    for (i = 0, _ref = length - 1; i <= _ref; i += 4) {
      index = i / 4;
      r = data_r[index];
      g = data_g[index];
      b = data_b[index];
      pixel = Math.sqrt((r * r + g * g + b * b) / 3);
      if (pixel === 0) {
        data[i + 0] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        normalized_pixel = Math.pow(pixel, 2);
        R = r * normalized_pixel;
        G = g * normalized_pixel;
        B = b * normalized_pixel;
        max_RGB = Math.max(R, G, B);
        if (max_RGB > 1) {
          R = R / max_RGB;
          G = G / max_RGB;
          B = B / max_RGB;
        }
        data[i + 0] = 255 * R;
        data[i + 1] = 255 * G;
        data[i + 2] = 255 * B;
        data[i + 3] = 255;
      }
    }
    return data;
  };

  return init_layer = function(binary_string) {
    var fits, j, line, png, _ref;
    png = new MWViewer.PNG(binary_string);
    fits = new MWViewer.FITSImage(png.width, png.height, png.min_pixel, png.max_pixel);
    for (j = 0, _ref = png.height - 1; 0 <= _ref ? j <= _ref : j >= _ref; 0 <= _ref ? j++ : j--) {
      line = png.read_line();
      fits.push_line(line);
    }
    return fits;
  };

}).call(this);
