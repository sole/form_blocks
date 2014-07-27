/*
 * paddle physics http://www.gamedev.net/community/forums/topic.asp?topic_id=372965
 */
var FORM_BLOCKS = FORM_BLOCKS || {
	init : function(stageId) {
		this._stage = document.getElementById(stageId);
		if(this._stage === null) {
			alert("Can't find element with id " + stageId);
			return;
		}

		// Stage ~~~~~
		this._stageWidth = this._stage.clientWidth;
		this._stageHeight = this._stage.clientHeight;
		this._stage.style.background = '#fafafa';

		// Debug ~~~~~
		this._debug = document.createElement('div');
		var ds = this._debug.style;
		ds.width = '200px';
		ds.height = '100px';
		ds.background = '#000';
		ds.opacity = 0.5;
		ds.color = '#fff';
		ds.fontFamily = 'Arial, Helvetica, sans';
		ds.fontSize = '10px';
		document.body.appendChild(this._debug);

		// Ball ~~~~~~
		var ball = new FORM_BLOCKS.Ball();
		ball.setZ(10);
		this._balls.push(ball);

		this._stage.appendChild(ball.domElement);

		ball.updateDimensions();
		ball.moveTo(140,this._stageHeight - 10); // XXX
		ball.speedX = 13; // XXX
		ball.speedY = 15; // XXX

		// Bricks ~~~~~
		var brick;
		var numBricksW = 20;
		var numBricksH = 8;
		var numBricks = numBricksW * numBricksH;
		var bw = this._stageWidth / numBricksW;
		var bh = 40;
		var bx = 0, by = 0;
		this._bricks = [];

		for(var i = 0; i < numBricks; i++) {
			brick = new FORM_BLOCKS.Brick();
			this._bricks.push(brick);
			this._stage.appendChild(brick.domElement);

			brick.setDimensions(bw, bh);
			brick.moveTo(bx, by);
			brick.setZ(3);

			if((i+1) % numBricksW == 0) {
				bx = 0;
				by += bh;
			} else {
				bx += bw;
			}

		}

		// ~~~~~~
		setInterval(function() {
			FORM_BLOCKS.loop()
		}, 1000/60);
	},

	loop : function() {
		var i, j;
		var t = this._lastLoopTime;
		if(t < 0) {
			t = new Date().getTime();
		}
		var now = new Date().getTime();
		var elapsed = now - t;
		var elapsedSeconds = elapsed * 0.01;
		this._lastLoopTime = now;

		var stageWidth = this._stageWidth;
		var stageHeight = this._stageHeight;

		var debugText = 'DEBUG<br/>' + elapsed + '<br/>';

		var balls = this._balls;
		var bricks = this._bricks;
		var brick;

		// clean up destroyed bricks
		while(true) {
			var allClean = true;
			for(j = 0; j < bricks.length; j++) {
				brick = bricks[j];
				if(brick.destroyed) {
					allClean = false;
					bricks.splice(j, 1);
					this._stage.removeChild(brick.domElement);
					break;
				}
			}
			if(allClean) {
				break;
			}
		}
		
		for(i = 0; i < balls.length; i++) {

			var ball = balls[i];
			var sx = ball.speedX;// * (1 + Math.random() * 0.0001);
			var sy = ball.speedY;// * (1 + Math.random() * 0.0001);
			var bx = ball.x + sx * elapsedSeconds;
			var by = ball.y + sy * elapsedSeconds;
			//bx = bx >> 0;
			//by = by >> 0;
			var bw = ball.width;
			var bh = ball.height;
			var halfbw = bw * 0.5;
			var halfbh = bh * 0.5;
			var padx = bw * 0.45;
			var pady = bh * 0.45;
			var bmx1 = ball.x + halfbw;
			var bmy1 = ball.y + halfbh;
			var bmx2 = bx + halfbw;
			var bmy2 = by + halfbh;


			//ball.moveTo(bx, by);

			// bricks test
			for(j = 0; j < bricks.length; j++) {
				brick = bricks[j];
				var brick_x = brick.x - padx;
				var brick_y = brick.y - pady
				var brick_x2 = brick_x + brick.width + padx;
				var brick_y2 = brick_y + brick.height + pady;
				
				if(brick.destroyed) {
					continue;
				}

				/*var intersectionBelow = this.getSegmentsIntersection(ball.x, ball.y, bx, by, brick_x, brick_y2, brick_x2, brick_y2);

				if(intersectionBelow !== false) {
					console.log("BELOW");
					sy = -sy;
					by = brick_y2 + 1;
					break;
				}*/

				if((sy < 0) && this.getSegmentsIntersection(bmx1, bmy1, bmx2, bmy2, brick_x, brick_y2, brick_x2, brick_y2) !== false) {
					console.log(now, "BELOW");
					brick.doHit();
					sy = -sy;
					by = brick.y + brick.height + 1;
					break;
				} else if((sy > 0) && this.getSegmentsIntersection(bmx1, bmy1, bmx2, bmy2, brick_x, brick_y, brick_x2, brick_y) !== false) {
					console.log(now, "ABOVE");
					brick.doHit();
					sy = -sy;
					by = brick.y - 1;
					break;
				} else if((sx < 0) && this.getSegmentsIntersection(bmx1, bmy1, bmx2, bmy2, brick_x2, brick_y, brick_x2, brick_y2) !== false) {
					console.log(now, "RIGHT");
					brick.doHit();
					sx = -sx;
					bx = brick.x + brick.width + 1;
					break;
				} else if((sx > 0) && this.getSegmentsIntersection(bmx1, bmy1, bmx2, bmy2, brick_x, brick_y, brick_x, brick_y2) !== false) {
					console.log(now, "LEFT");
					brick.doHit();
					sx = -sx;
					bx = brick.x - 1;
					break;
				}


				// if(bx > brick_x && bx2 < brick_x2 && )
				/*if(this.hitTestCoords(bx, by, bw, bh, brick) || this.hitTestCoords(ball.x, ball.y, bw, bh, brick)) {
					//if(
					//	( (by <= brick_y2) && (by2 >= brick_y2) || (ball.y <= brick_y2) && (ball.y + bh >= brick_y2))
					//	&& (sy < 0)) {
					//	console.log("BELOW");
					//	sy = -sy;
					//	by = brick_y2 + 1;
					//	break;
					//}
					var intersectionBelow = this.getSegmentsIntersection(ball.x, ball.y, bx, by, brick_x, brick_y2, brick_x2, brick_y2);
					if(intersectionBelow !== false) {
						console.log("BELOW");
						sy = -sy;
						by = brick_y2 + 1;
						break;
					}
				}*/
				

			}
			

			if(bx < 0) {
				bx = 0;
				sx = -sx;
			} else if(bx + ball.width > stageWidth) {
				bx = stageWidth - ball.width;
				sx = -sx;
			}

			if(by < 0) {
				by = 0;
				sy = -sy;
			} else if(by + ball.height > stageHeight) {
				by = stageHeight - ball.height;
				sy = -sy;
			}

			ball.moveTo(bx, by);
			ball.speedX = sx;
			ball.speedY = sy;
			
			debugText += 'B' + i + ': x=' + bx + ' y=' + by + '<br />';
		}

		

		this._debug.innerHTML = debugText;
	},

	hitTestObject : function(object1, object2) {
		// bounding box test,
		// return boolean true if anotherObject overlaps with this
		var x1 = object1.x;
		var y1 = object1.y;
		var x2 = x1 + object1.width;
		var y2 = y1 + object1.height;

		var ox1 = object2.x;
		var oy1 = object2.y;
		var ox2 = ox1 + object2.width;
		var oy2 = oy1 + object2.height;

		return (this.hitTestPoint(ox1, oy1, x1, y1, x2, y2) || this.hitTestPoint(ox2, oy1, x1, y1, x2, y2) || this.hitTestPoint(ox1, oy2, x1, y1, x2, y2) || this.hitTestPoint(ox2, oy2, x1, y1, x2, y2));
	},

	hitTestCoords : function(x, y, width, height, object2) {
		var x1 = x;
		var y1 = y;
		var x2 = x1 + width;
		var y2 = y1 + height;

		var ox1 = object2.x;
		var oy1 = object2.y;
		var ox2 = ox1 + object2.width;
		var oy2 = oy1 + object2.height;

		return (this.hitTestPoint(ox1, oy1, x1, y1, x2, y2) || this.hitTestPoint(ox2, oy1, x1, y1, x2, y2) || this.hitTestPoint(ox1, oy2, x1, y1, x2, y2) || this.hitTestPoint(ox2, oy2, x1, y1, x2, y2));
	},

	hitTestPoint : function(x, y, x1, y1, x2, y2) {
		return(x >= x1 && x <= x2 && y >= y1 && y <= y2);
	},

	getSegmentsIntersection : function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var s1x = x2 - x1;
		var s1y = y2 - y1;
		var s2x = x4 - x3;
		var s2y = y4 - y3;
		var denom = (-s1x * s2y + s2x * s1y);
		var t = (-s2y * (x3 - x1) + s2x * (y3 - y1)) / denom;
		var s = (s1x * (y3 - y1) - (x3 - x1) * s1y) / denom;

		if((0 <= t) && (t <= 1) && (0 <= s) && (s <= 1)) {
			var ux = x1 + t * (x2 - x1);
			var uy = y1 + t * (y2 - y1);
			return ({'x': ux, 'y': uy});
		} else {
			return false;
		}
	},

	_stage : null,
	_stageWidth : 0,
	_stageHeight : 0,
	_lastLoopTime : -1,
	_balls : [],
	_bricks : [],
	_debug : null
};

FORM_BLOCKS.Object = function() {
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.domElement = null;

	

	this.updateDimensions = function() {
		this.width = this.domElement.clientWidth;
		this.height = this.domElement.clientHeight;
	}

	this.setDimensions = function(width, height) {
		this.width = width;
		this.height = height;
		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';
	}

	this.moveTo = function(x, y) {
		this.x = x;
		this.y = y;
		this.domElement.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
	}

	this.setZ = function(index) {
		this.domElement.style.zIndex = index;
	}

}

FORM_BLOCKS.Ball = function() {
	FORM_BLOCKS.Object.call(this);

	this.speedX = 0;
	this.speedY = 0;
	// TODO acceleration?

	this.domElement = document.createElement('input');
	this.domElement.type = 'radio';
	this.domElement.style.position = 'absolute';
	
}
FORM_BLOCKS.Ball.prototype = new FORM_BLOCKS.Object();
FORM_BLOCKS.Ball.prototype.constructor = FORM_BLOCKS.Ball;

FORM_BLOCKS.Brick = function() {
	FORM_BLOCKS.Object.call(this);

	this.domElement = document.createElement('button');
	this.domElement.style.position = 'absolute';
	this.domElement.style.fontFamily = 'Arial, Helvetica, sans';
	this.domElement.style.fontSize = '8px';
	this.domElement.innerHTML = 'x'; // XXX

	this.destroyed = false;

	this.doHit = function() {
		this.destroyed = true;
	}

}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~
FORM_BLOCKS.init('game');

