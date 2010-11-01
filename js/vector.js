// Math utils
danmahou.math = {};
danmahou.math.util = {};

danmahou.math.util.reduceAngle = function (angle) {
  if ((angle < -360) || (angle > 360)) {
      angle = angle % 360;
    }
    if (angle < 0) {
      angle = 360 + angle;
    }
    return angle;
};

danmahou.math.util.toRadians = function (angle) {
  return angle / 180.0 * Math.PI;
};

danmahou.math.util.toDegrees = function (angle) {
  return angle * 180.0 / Math.PI;
};

// Vector2
danmahou.vector2 = function(x, y) {
  var that = {};

  that.x = Number(x) || 0;
  that.y = Number(y) || 0;

  that.clone = function() {
    return danmahou.vector2(this.x, this.y);
  };

  that.length = function() {
    return Math.sqrt(this.lengthSquared());
  };

  that.lengthSquared = function() {
    return x * x + y * y;
  };

  that.normalize = function() {
    var l = this.length();
    if (l != 0) {
      that.x /= l;
      that.y /= l;
    }
    return that;
  };

  that.getAngle = function() {
    var angle = danmahou.math.util.toDegrees(Math.atan2(that.y, that.x));
    angle = danmahou.math.util.reduceAngle(angle);
    return angle;
  };

  that.subtract = function(v2) {
    return danmahou.vector2(that.x - v2.x, that.y - v2.y);
  };

  return that;
};

danmahou.vector2FromAngle = function(angle) {
  angle = danmahou.math.util.reduceAngle(angle);
  var radians = danmahou.math.util.toRadians(angle);
  var x = Math.cos(radians);
  var y = Math.sin(radians);
  return danmahou.vector2(x, y);
};

// Random
danmahou.random = {};
danmahou.random.nexFloat = function(min, max) {
  return (max - min) * Math.random() + min;
};
