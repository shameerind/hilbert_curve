
/* N - size of hilbert curve,
 * N must be power of 2;
 *
 * hindex - number between 0..(N*N-1)
 *
 * returns [x, y]
 */
function hindex2xy(hindex, N) {
    var positions = [
    /* 0: */ [0, 0],
    /* 1: */ [0, 1],
    /* 2: */ [1, 1],
    /* 3: */ [1, 0]
    ];

    var tmp = positions[last2bits(hindex)];
    hindex = (hindex >>> 2);

    var x = tmp[0];
    var y = tmp[1];

    for (var n = 4; n <= N; n *= 2) {
        var n2 = n / 2;

        switch (last2bits(hindex)) {
        case 0: /* left-bottom */
            tmp = x; x = y; y = tmp;
            break;

        case 1: /* left-upper */
            x = x;
            y = y + n2;
            break;

        case 2: /* right-upper */
            x = x + n2;
            y = y + n2;
            break;

        case 3: /* right-bottom */
            tmp = y;
            y = (n2-1) - x;
            x = (n2-1) - tmp;
            x = x + n2;
            break;
        }

        hindex = (hindex >>> 2);
    }

    return [x, y];

    function last2bits(x) { return (x & 3); }
}

var vertices = [];
var myReq;

function hilbertDemo(canvas, size, order) {
  if (myReq) {
    window.cancelAnimationFrame(myReq);
  }
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.lineWidth = 5;

    var N = order;

    var prev = [0, 0],
        curr;
    vertices = [];
    var blockSize = Math.floor(size / N);
    var offset = blockSize/2;

    for (var i = 0; i < N*N; i += 1) {
        var color = 'hsl(' + Math.floor(i*360/(N*N)) + ', 100%, 50%)';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        curr = hindex2xy(i, N);

        dot(ctx, curr, blockSize);
        line(ctx, prev, curr, blockSize);

        prev = curr;
    }
    var points = calcWaypoints(vertices);
    // extend the line from start to finish with animation
    animate(ctx, points, 1);
  }

function dot(ctx, point, blockSize) {
    var offset = blockSize/2;
    var r = 5;
    var x = point[0], y = point[1];

    ctx.beginPath();
    ctx.arc(x*blockSize+offset, y*blockSize+offset, r, 0, 2*Math.PI);
    ctx.fill();
}


function line(ctx, from, to, blockSize) {
    var off = blockSize/2;
    var x2 = to[0]*blockSize+off;
    var y2 = to[1]*blockSize+off;

    vertices.push({
      x: x2,
      y: y2
    });
}


function animate(ctx, points, counter) {
    if (counter < points.length - 1) {
        myReq = requestAnimationFrame(function() {
          counter = counter + 1;
          animate(ctx, points, counter);
        });
    }
    ctx.beginPath();
    ctx.moveTo(points[counter - 1].x, points[counter - 1].y);
    ctx.lineTo(points[counter].x, points[counter].y);
    ctx.stroke();
}

function calcWaypoints(vertices) {
    var waypoints = [];
    for (var i = 1; i < vertices.length; i++) {
        var pt0 = vertices[i - 1];
        var pt1 = vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for (var j = 0; j < 100; j++) {
            var x = pt0.x + dx * j / 100;
            var y = pt0.y + dy * j / 100;
            waypoints.push({
                x: x,
                y: y
            });
        }
    }
    return (waypoints);
}

function animatedBSpline(context, points, t) {

  // Draw curve segment
  var ax = (-points[0].x + 3 * points[1].x - 3 * points[2].x + points[3].x) / 6;
  var ay = (-points[0].y + 3 * points[1].y - 3 * points[2].y + points[3].y) / 6;
  var bx = (points[0].x - 2 * points[1].x + points[2].x) / 2;
  var by = (points[0].y - 2 * points[1].y + points[2].y) / 2;
  var cx = (-points[0].x + points[2].x) / 2;
  var cy = (-points[0].y + points[2].y) / 2;
  var dx = (points[0].x + 4 * points[1].x + points[2].x) / 6;
  var dy = (points[0].y + 4 * points[1].y + points[2].y) / 6;
  context.beginPath();
  context.moveTo(
    ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + dx,
    ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + dy
  );
  context.lineTo(
    ax * Math.pow(t + 0.1, 3) + bx * Math.pow(t + 0.1, 2) + cx * (t + 0.1) + dx,
    ay * Math.pow(t + 0.1, 3) + by * Math.pow(t + 0.1, 2) + cy * (t + 0.1) + dy
  );
  context.stroke();

  // Keep going until t = 1
  if (t < 1) requestAnimationFrame(function() {
    animatedBSpline(context, points, t + 0.1);
  });
}
