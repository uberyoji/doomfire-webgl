/*
*/

function getDoomFire(gl)
{
		var DF = new Object;
		DF.gl = gl;
		DF.FIRE_WIDTH = 128;
		DF.FIRE_HEIGHT = 128;

		DF.firePixels = 0;

		DF.PointSize = 8;

		DF.firePal = [];
		DF.firePalSize = 38;
			
		DF.spawnFire = true;	

		DF.fireRGB = [
				0x07, 0x07, 0x07, 0x1F, 0x07, 0x07, 0x2F, 0x0F, 0x07, 0x47, 0x0F, 0x07, 0x57, 0x17, 0x07, 0x67,
				0x1F, 0x07, 0x77, 0x1F, 0x07, 0x8F, 0x27, 0x07, 0x9F, 0x2F, 0x07, 0xAF, 0x3F, 0x07, 0xBF, 0x47,
				0x07, 0xC7, 0x47, 0x07, 0xDF, 0x4F, 0x07, 0xDF, 0x57, 0x07, 0xDF, 0x57, 0x07, 0xD7, 0x5F, 0x07,
				0xD7, 0x5F, 0x07, 0xD7, 0x67, 0x0F, 0xCF, 0x6F, 0x0F, 0xCF, 0x77, 0x0F, 0xCF, 0x7F, 0x0F, 0xCF,
				0x87, 0x17, 0xC7, 0x87, 0x17, 0xC7, 0x8F, 0x17, 0xC7, 0x97, 0x1F, 0xBF, 0x9F, 0x1F, 0xBF, 0x9F,
				0x1F, 0xBF, 0xA7, 0x27, 0xBF, 0xA7, 0x27, 0xBF, 0xAF, 0x2F, 0xB7, 0xAF, 0x2F, 0xB7, 0xB7, 0x2F,
				0xB7, 0xB7, 0x37, 0xCF, 0xCF, 0x6F, 0xDF, 0xDF, 0x9F, 0xEF, 0xEF, 0xC7, 0xFF, 0xFF, 0xFF
				];
				
		const PointBase = 1;
		const ScreenBase = 128;
				
		// canvas adjustment
		DF.FIRE_HEIGHT = ScreenBase;
		
		DF.PointSize = PointBase * gl.canvas.clientHeight / DF.FIRE_HEIGHT;
		//DF.PointSize = Math.round(DF.PointSize);
		
		console.log("PointSize: "+DF.PointSize);
		
		DF.FIRE_WIDTH = gl.canvas.clientWidth / DF.PointSize;
		DF.FIRE_WIDTH = Math.floor(DF.FIRE_WIDTH);
					
		console.log("FireSize: "+DF.FIRE_WIDTH+" x "+DF.FIRE_HEIGHT);
				
		DF.firePixels = Array.matrix(DF.FIRE_WIDTH, DF.FIRE_HEIGHT, 0 );
	
		for (var i = 0; i < 37; i++)
		{
			DF.firePal[i] = getColor( 
						DF.fireRGB[i * 3 + 0] / 255.0, //16 * i,
						DF.fireRGB[i * 3 + 1] / 255.0, //16 * i,
						DF.fireRGB[i * 3 + 2] / 255.0, //16 * i
						(i == 0 ? 0.0 : 1.0) ); //16 * i
		}
			
	
	DF.initPositionBuffer = function()
	{
		DF.positions = new Float32Array(DF.FIRE_WIDTH*DF.FIRE_HEIGHT*2);

		var i = 0;
		for( var x=0; x < this.FIRE_WIDTH; x++ )
		{
			for( var y=0; y < this.FIRE_HEIGHT; y++ )
			{
				DF.positions[i+0] = x + 0.5;
				DF.positions[i+1] = this.FIRE_HEIGHT - y - 1 + 0.5;
				i += 2;
			}	  
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(DF.positions), gl.STATIC_DRAW);
	}
	
	DF.initColorBuffer = function ()
	{
		DF.colors = new Float32Array(this.FIRE_WIDTH*this.FIRE_HEIGHT*4);
	  
		var i = 0;
		for( var x=0; x < this.FIRE_WIDTH; x++ )
		{
			for( var y=0; y < this.FIRE_HEIGHT; y++ )
			{
				DF.colors[i+0] = 1.0;
				DF.colors[i+1] = 0.0;
				DF.colors[i+2] = 0.0;
				DF.colors[i+3] = 1.0;
				i+=4;
			}	  	  
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(DF.colors), gl.STATIC_DRAW);
	}
	
	DF.startFire = function()
	{
		for(var x = 0; x < this.FIRE_WIDTH; x++) 
		{
			if (this.firePixels[x][this.FIRE_HEIGHT-1] != 36 )
				this.firePixels[x][this.FIRE_HEIGHT-1] += Math.round(Math.random()) & 3;		// fixme overflow
		}
	}

	DF.stopFire = function()
	{
		 for(var y = this.FIRE_HEIGHT-1; y > (this.FIRE_HEIGHT-10); y--) 
		 {  
			for(var x = 0; x < this.FIRE_WIDTH; x++) 
			{
				if (this.firePixels[x][y] > 0)
					this.firePixels[x][y] -= Math.round(Math.random()) & 3;	//fixme underflow
			}
		 }
	}

	DF.spreadFire = function( x,  y)  
	{	
		var pixel = this.firePixels[x][y];
		if (pixel == 0)
		{
			this.firePixels[x][y - 1] = 0;
		}
		else
		{
			// DEBUG: firePixels[x][y - 1] = pixel - 1;
					
			var randIdx = Math.random() * 3;
			randIdx = Math.round(randIdx);
			
			var randIdx2 = 0;
			if( randIdx == 3 || randIdx == 1)
				randIdx2 = 1;

			if (x - randIdx + 1 > 0 && x - randIdx + 1 < this.FIRE_WIDTH)
				this.firePixels[x - randIdx + 1][y - 1] = pixel - randIdx2;
			else
				this.firePixels[x][y - 1] = pixel - randIdx2;
			
		}	
	}

	DF.updateColorBuffer = function()
	{
	  var palentry;
	  
	  var i = 0;
	  for( var x=0; x < this.FIRE_WIDTH; x++ )
	  {
		  for( var y=0; y < this.FIRE_HEIGHT; y++ )
		  {
			  palentry = this.firePal[this.firePixels[x][y]];
		  
			  DF.colors[i+0] = palentry.r;
			  DF.colors[i+1] = palentry.g;
			  DF.colors[i+2] = palentry.b;
			  DF.colors[i+3] = palentry.a;
			  i+=4;
		  }	  	  
	  }
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
	  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(DF.colors), gl.STATIC_DRAW);
	}

	DF.update = function()
	{	
		if( this.spawnFire )
			this.startFire();
		else
			this.stopFire();
		
		for (var x = 0; x < this.FIRE_WIDTH; x++)
		{
			for (var y = 1; y < this.FIRE_HEIGHT; y++)
			{
				this.spreadFire(x, y);
			}
		}
		
		this.updateColorBuffer();	
	}
	
	DF.init = function( gl, buffers )
	{
		this.gl = gl;
		this.buffers = buffers;
		
		this.initPositionBuffer();
		this.initColorBuffer();
	}

	return DF;
}



function getCustomColor()
{
	var CC = new Object;
	CC.colorA = getWhiteColor(); CC.colorA.Set(0xbf,0x00,0x00);
	CC.colorB = getWhiteColor(); CC.colorB.Set(0xff,0x92,0x00);
	CC.colorC = getWhiteColor(); CC.colorC.Set(0xff,0xff, 0xff);
	
	CC.buildPal = function ()
	{
		var palColor = [];
		
		palColor[0] = getColor(1,1,1,1); palColor[0].Set( 0x07,0x07,0x07);
		
		for( var i=0;i<12;i++)
			palColor[i+1] = this.colorA.GetLerp( palColor[0], this.colorA, i/11.0);

		for( var i=0;i<12;i++)
			palColor[i+13] = this.colorA.GetLerp( palColor[12], this.colorB, i/11.0);		
		
		for( var i=0;i<12;i++)
			palColor[i+25] = this.colorA.GetLerp( palColor[24], this.colorC, i/11.0);
		
		palColor[37] = getColor(); palColor[37].Set(0xFF,0xFF,0xFF); 
		
//		for( var i=0; i<38; i++)
//			console.log(palColor[i]);

		if( DF != undefined)
      	{
        	DF.firePal = palColor;
      	}	
		
		return palColor;
	}

	return CC;
}