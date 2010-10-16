danmahou.rect = function(top, left, width, height) {
  var that = {};
  that.top = Number(top) || 0;
  that.left = Number(left) || 0;
  that.width = Number(width) || 0;
  that.height = Number(height) || 0;

  that.setCenter = function(x, y) {
    var currentCenterX = this.left + this.width * 0.5;
    var currentCenterY = this.top + this.height * 0.5;
    this.left += (x - currentCenterX);
    this.top += (y - currentCenterY);
  };

  that.intersects = function(other) {
    return (
		  this.left <= (other.left + other.width) && 
		    other.left <= (this.left + this.width) &&
		    this.top <= (other.top + other.height) &&
		    other.top <= (this.top + this.height)
	  );
  };
  return that;
};
