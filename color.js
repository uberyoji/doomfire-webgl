function getColor( r,g,b,a)
{
  var color = new Object;
  color.r = r; color.g = g; color.b = b; color.a = a;

  color.Set = function( r, g, b ) 
  {
	  this.r = r / 255.0; this.g = g/255.0; this.b = b/255.0; this.a = 1.0;
    }
  color.GetLerp = function ( c1, c2, r )
  {
	  var c = getColor(1,1,1,1);
	  
	  c.r = c1.r+r*(c2.r-c1.r);
	  c.g = c1.g+r*(c2.g-c1.g);
	  c.b = c1.b+r*(c2.b-c1.b);
	  c.a = c1.a+r*(c2.a-c1.a);
	 
	  return c;
  }
  return color;
}

function getWhiteColor()
{  
  return getColor(1,1,1,1);
}