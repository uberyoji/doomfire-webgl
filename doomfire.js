
var can = document.getElementById("glcanvas");

function resizeCanvas() {
  can.style.width = window.innerWidth + "px";
  setTimeout(function() {
    can.style.height = window.innerHeight + "px";
	console.log("resizeCanvas");
	console.log("canvas "+gl.canvas.clientWidth+" x "+gl.canvas.clientHeight);
  }, 0);
  
  
  // updatePositionBuffer()
};

// Webkit/Blink will fire this on load, but Gecko doesn't.
window.onresize = resizeCanvas;

// So we fire it manually...
//resizeCanvas();


var gl;
var buffers;
var programInfo;


Array.matrix = function(numrows, numcols, initial) {
    var arr = [];
    for (var i = 0; i < numrows; ++i) {
        var columns = [];
        for (var j = 0; j < numcols; ++j) {
            columns[j] = initial;
        }
        arr[i] = columns;
    }
    return arr;
}

FIRE_WIDTH = 128;
FIRE_HEIGHT = 128;

firePixels = 0;

PointSize = 8;

firePal = [];
firePalSize = 38;

fireRGB = [
	0x07, 0x07, 0x07, 0x1F, 0x07, 0x07, 0x2F, 0x0F, 0x07, 0x47, 0x0F, 0x07, 0x57, 0x17, 0x07, 0x67,
	0x1F, 0x07, 0x77, 0x1F, 0x07, 0x8F, 0x27, 0x07, 0x9F, 0x2F, 0x07, 0xAF, 0x3F, 0x07, 0xBF, 0x47,
	0x07, 0xC7, 0x47, 0x07, 0xDF, 0x4F, 0x07, 0xDF, 0x57, 0x07, 0xDF, 0x57, 0x07, 0xD7, 0x5F, 0x07,
	0xD7, 0x5F, 0x07, 0xD7, 0x67, 0x0F, 0xCF, 0x6F, 0x0F, 0xCF, 0x77, 0x0F, 0xCF, 0x7F, 0x0F, 0xCF,
	0x87, 0x17, 0xC7, 0x87, 0x17, 0xC7, 0x8F, 0x17, 0xC7, 0x97, 0x1F, 0xBF, 0x9F, 0x1F, 0xBF, 0x9F,
	0x1F, 0xBF, 0xA7, 0x27, 0xBF, 0xA7, 0x27, 0xBF, 0xAF, 0x2F, 0xB7, 0xAF, 0x2F, 0xB7, 0xB7, 0x2F,
	0xB7, 0xB7, 0x37, 0xCF, 0xCF, 0x6F, 0xDF, 0xDF, 0x9F, 0xEF, 0xEF, 0xC7, 0xFF, 0xFF, 0xFF
];


class Color  
{
  constructor( r, g, b, a ) 
  {
	  this.r = r; this.g = g; this.b = b; this.a = a;
  }
}

function init() 
{
	console.log("init");
	console.log("canvas "+gl.canvas.clientWidth+" x "+gl.canvas.clientHeight);
	
	PointBase = 1;
	ScreenBase = 128;
	
	// canvas adjustment
	FIRE_WIDTH = ScreenBase * gl.canvas.clientWidth / gl.canvas.clientHeight;
	FIRE_WIDTH = Math.round(FIRE_WIDTH);
	FIRE_HEIGHT = ScreenBase;
		
	console.log("FireSize: "+FIRE_WIDTH+" x "+FIRE_HEIGHT);
	
	PointSize = PointBase * gl.canvas.clientHeight / FIRE_HEIGHT;
	PointSize = Math.round(PointSize);
	
	console.log("PointSize: "+PointSize);

	
	firePixels = Array.matrix(FIRE_WIDTH, FIRE_HEIGHT, 0 );
	
	for (var i = 0; i < 37; i++)
	{
		firePal[i] = new Color( 
					fireRGB[i * 3 + 0] / 255.0, //16 * i,
					fireRGB[i * 3 + 1] / 255.0, //16 * i,
					fireRGB[i * 3 + 2] / 255.0, //16 * i
					(i == 0 ? 0.0 : 1.0) ); //16 * i
	}
	
//	console.log(firePal);
//	console.log(firePal[0]);
	
	// set first line to white
	for (var x = 0; x < FIRE_WIDTH; x++)
	{
		firePixels[x][FIRE_HEIGHT-1] = 36;
	}
}

function spreadFire( x,  y)
{	
	var pixel = firePixels[x][y];
	if (pixel == 0)
	{
		firePixels[x][y - 1] = 0;
	}
	else
	{
		// DEBUG: firePixels[x][y - 1] = pixel - 1;
				
		var randIdx = Math.random() * 3;
		randIdx = Math.round(randIdx);
		
		var randIdx2 = 0;
		if( randIdx == 3 || randIdx == 1)
			randIdx2 = 1;

		if (x - randIdx + 1 > 0 && x - randIdx + 1 < FIRE_WIDTH)
			firePixels[x - randIdx + 1][y - 1] = pixel - randIdx2;
		else
			firePixels[x][y - 1] = pixel - randIdx2;
		
	}	
}


function doFire()
{	
	for (var x = 0; x < FIRE_WIDTH; x++)
	{
		for (var y = 1; y < FIRE_HEIGHT; y++)
		{
			spreadFire(x, y);
		}
	}	
	
//	for (var y = 1; y < FIRE_HEIGHT; y++)
//		console.log()
}

/*
function updatePositionBuffer()
{
	PointBase = 1;
	ScreenBase = 128;
	
	PointSize = PointBase * gl.canvas.clientHeight / FIRE_HEIGHT;
	PointSize = Math.round(PointSize);

	// canvas adjustment
	FIRE_WIDTH = ScreenBase * gl.canvas.clientWidth / gl.canvas.clientHeight;
	FIRE_WIDTH = Math.round(FIRE_WIDTH);
	FIRE_HEIGHT = ScreenBase;
	
	console.log("FIRE SIZE is "+FIRE_WIDTH+" x "+FIRE_HEIGHT);
	
	firePixels = Array.matrix(FIRE_WIDTH, FIRE_HEIGHT, 0 );
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var positions = new Float32Array(FIRE_WIDTH*FIRE_HEIGHT*2);

	var i = 0;
	for( var x=0; x < FIRE_WIDTH; x++ )
	{
	  for( var y=0; y < FIRE_HEIGHT; y++ )
	  {
		positions[i+0] = x + 1.0;
		positions[i+1] = FIRE_HEIGHT - y - 1;
		i+= 2;
	  }	  
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}
*/

function updateColorBuffer()
{
  var colors = new Float32Array(FIRE_WIDTH*FIRE_HEIGHT*4);
  
  var palentry;
  
  i = 0;
  for( var x=0; x < FIRE_WIDTH; x++ )
  {
	  for( var y=0; y < FIRE_HEIGHT; y++ )
	  {
		  palentry = firePal[firePixels[x][y]];
	  
		  colors[i+0] = palentry.r;
		  colors[i+1] = palentry.g;
		  colors[i+2] = palentry.b;
		  colors[i+3] = palentry.a;
		  i+=4;
	  }	  	  
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}


main();

function renderLoop() 
{
	doFire();
	
	updateColorBuffer();
	
	drawScene();
  
	window.setTimeout(renderLoop, 1000 / 60); // 60
}


function main() 
{
	const canvas = document.querySelector('#glcanvas');
	gl = canvas.getContext('webgl');

	// If we don't have a GL context, give up now
	if (!gl)
	{
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}
  
	init();
	
	// Vertex shader program 
  //     uniform mat4 uModelViewMatrix;

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uProjectionMatrix;
	uniform float uPS;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * aVertexPosition;
      vColor = aVertexColor;
	  gl_PointSize = uPS;
    }
  `;
  
  //  // * uModelViewMatrix * aVertexPosition;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
 programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
//      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
	  pointSize: gl.getUniformLocation(shaderProgram, 'uPS'),
    },
  };
 
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  buffers = initBuffers(gl);

  // Draw the scene
//  drawScene(gl, programInfo, buffers);
  
  renderLoop() ;
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) 
{
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  var positions = new Float32Array(FIRE_WIDTH*FIRE_HEIGHT*2);
  
  var i = 0;
  for( var x=0; x < FIRE_WIDTH; x++ )
  {
	  for( var y=0; y < FIRE_HEIGHT; y++ )
	  {
		positions[i+0] = x;
		positions[i+1] = FIRE_HEIGHT - y - 1;
		i+= 2;
	  }	  
  }
//  console.log(positions);
//  console.log("positions array size is "+positions.length);
// console.log("Point: "+positions[0]+","+positions[1]);
//  console.log("Point: "+positions[2]+","+positions[3]);
//  console.log("Point: "+positions[4]+","+positions[5]);
//  console.log("Point: "+positions[6]+","+positions[7]);
              
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the vertices

  var colors = new Float32Array(FIRE_WIDTH*FIRE_HEIGHT*4);
  
  i = 0;
  for( var x=0; x < FIRE_WIDTH; x++ )
  {
	  for( var y=0; y < FIRE_HEIGHT; y++ )
	  {
		  colors[i+0] = 1.0;
		  colors[i+1] = 0.0;
		  colors[i+2] = 0.0;
		  colors[i+3] = 1.0;
		  i+=4;
	  }	  	  
  }
  
//  console.log(colors);
//  console.log("colors array size is "+colors.length);
//  console.log(colors[0]+","+colors[1]+","+colors[2]+","+colors[3]);
  

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}


//
// Draw the scene.
//
function drawScene() 
{

  gl.clearColor(0.1, 0.1, 0.1, 1.0);  // Clear to black, fully opaque
//  gl.clearDepth(1.0);                 // Clear everything
//  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
//  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  /*
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                  fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  */
  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, 0, FIRE_WIDTH, 0, FIRE_HEIGHT, -10, 10);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
//  const modelViewMatrix = mat4.create();
//  mat4.identity(modelViewMatrix);

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

 // mat4.translate(modelViewMatrix,     // destination matrix
 //                modelViewMatrix,     // matrix to translate
 //                [-0.0, 0.0, -6.0]);  // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

 gl.uniformMatrix4fv( programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
// gl.uniformMatrix4fv( programInfo.uniformLocations.modelViewMatrix,  false,  modelViewMatrix);
 gl.uniform1f (programInfo.uniformLocations.pointSize, PointSize);

  {
    const offset = 0;
    const vertexCount = FIRE_WIDTH*FIRE_HEIGHT;
    gl.drawArrays(gl.POINTS, offset, vertexCount);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

