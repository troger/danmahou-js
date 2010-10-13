// Vector2
danmahou.vector2 = function(x, y) {
  var that = {};

  var reduceAngle = function(angle) {
    if ((angle < -360) || (angle > 360)) {
      angle = angle % 360;
    }
    if (angle < 0) {
      angle = 360 + angle;
    }
    return angle;
  }

  that.x = Number(x) || 0;
  that.y = Number(y) || 0;

  that.length = function() {
    return Math.sqrt(this.lengthSquared());
  }

  that.lengthSquared = function() {
    return x * x + y * y;
  }

  that.normalize = function() {
    var l = this.length();
    if (l != 0) {
      that.x /= l;
      that.y /= l;
    }
  }

  return that;
};

danmahou.vector2FromAngle = function(angle) {
  var reduceAngle = function(angle) {
    if ((angle < -360) || (angle > 360)) {
      angle = angle % 360;
    }
    if (angle < 0) {
      angle = 360 + angle;
    }
    return angle;
  };

  var toRadians = function(angle) {
    return angle / 180.0 * Math.PI;
  };

  angle = reduceAngle(angle);
  var radians = toRadians(angle);
  var x = Math.cos(radians);
  var y = Math.sin(radians);
  return danmahou.vector2(x, y);
};
