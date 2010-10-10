Array.prototype.contains = function(elem) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == elem) {
      return true;
    }
  }
  return false;
};

danmahou = {};

// Utility methods
danmahou.create = function (elementName) {
  return document.createElement(elementName);
};

danmahou.now = function() {
  return Date.now();
};

danmahou.stopEvent = function(e) {
  e.cancelBubble = true;
  e.stopPropagation();
  e.preventDefault();
};

// Context corrected functions
danmahou.on = function(eventName, fn, target, context) {
  target.addEventListener(eventName, function(e) {
    fn.call(context, e);
  }, false);
};

danmahou.setInterval = function(fn, when, context) {
  return window.setInterval(function() {
    fn.call(context);
  }, when);
};

danmahou.drawText = function(spec) {
  var ctx = spec.ctx;
  ctx.save();

  var align = spec.align || 'center';
  var color = spec.color || 'white';
  var x = spec.x || 0;
  var y = spec.y || 0;
  var size = spec.size || 12;
  ctx.font = "bold " + size + "px Arial";
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(spec.text, x, y);

  ctx.restore();
};

// Size
danmahou.size = function(width, height) {
  return { width: width, height: height };
};