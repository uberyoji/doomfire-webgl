function onClickCanvas()
{
//	console.log("onClick");	
	DF.spawnFire = !DF.spawnFire;	
}
window.onclick = onClickCanvas;

var cc = getCustomColor();

// wallpaper engine configuration
window.wallpaperPropertyListener = 
{
    applyUserProperties: function(properties) 
    {
      var baseColor;
      var midColor;
      var topColor;

        // Read scheme color
      if (properties.basecolor) 
      {
        // Convert the scheme color to be applied as a CSS style
        baseColor = properties.basecolor.value.split(' ');
        baseColor = baseColor.map(function(c) { return Math.ceil(c * 255); });
        cc.colorC.Set( baseColor[0], baseColor[1], baseColor[2] );
      }
      if (properties.midcolor) 
      {
        // Convert the scheme color to be applied as a CSS style
        midColor = properties.midcolor.value.split(' ');
        midColor = midColor.map(function(c) { return Math.ceil(c * 255); });
        cc.colorB.Set( midColor[0], midColor[1], midColor[2] );
      }
      if (properties.topcolor) 
      {
        // Convert the scheme color to be applied as a CSS style
        topColor = properties.topcolor.value.split(' ');
        topColor = topColor.map(function(c) { return Math.ceil(c * 255); });
        cc.colorA.Set( topColor[0], topColor[1], topColor[2] );
      }     
      cc.buildPal();      		  
    }
}; 

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

var DF;

main();

function renderLoop() 
{
	DF.update();
	
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
	
	console.log("init");
	console.log("canvas "+gl.canvas.clientWidth+" x "+gl.canvas.clientHeight);
	
	DF = getDoomFire(gl);
	
// Vertex shader program 
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
  
// Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

 programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	  pointSize: gl.getUniformLocation(shaderProgram, 'uPS'),
    },
  };

	buffers = initBuffers(gl);

	DF.init( gl, buffers );
	
	renderLoop() ;
}

//
// initBuffers
function initBuffers(gl) 
{
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  
  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

function resize(gl) {
  var realToCSSPixels = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
  var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

  // Check if the canvas is not the same size.
  if (gl.canvas.width  !== displayWidth ||
      gl.canvas.height !== displayHeight) {

    // Make the canvas the same size
    gl.canvas.width  = displayWidth;
    gl.canvas.height = displayHeight;
	
	DF = getDoomFire(gl);
	DF.init( gl, buffers );
	
  }
}

//
// Draw the scene.
//
function drawScene() 
{
	resize(gl);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	gl.clearColor(0.1, 0.1, 0.1, 1.0);

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, 0, DF.FIRE_WIDTH+1, 0, DF.FIRE_HEIGHT+1, -10, 10);

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

  gl.useProgram(programInfo.program);

 gl.uniformMatrix4fv( programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
 gl.uniform1f (programInfo.uniformLocations.pointSize, DF.PointSize);

  {
    const offset = 0;
    const vertexCount = DF.FIRE_WIDTH*DF.FIRE_HEIGHT;
    gl.drawArrays(gl.POINTS, offset, vertexCount);
  }
}

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
// creates a shader of the given type, uploads the source and compiles it.
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

