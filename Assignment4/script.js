class Vector
{
    constructor(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    x = 0;
    y = 0;
    z = 0;

    setValues(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sum(vector) 
    {
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);   
    }

    multiplication(factor)
    {
        return new Vector(this.x * factor, this.y * factor, this.z * factor);
    }

    subtraction(vector)
    {
        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    lenght()
    {
        return Math.sqrt(this.dotProduct(this));
    }

    normalization()
    {
        return new Vector (this.multiplication(this, 1.0 / this.lenght()));
    }

    dotProduct(vector)
    {
        return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
    }
}

class Color
{
    constructor(red, green, blue)
    {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    red = 125;
    green = 125;
    blue = 125;

    multiplication(factor)
    {
        return new Color(this.red * factor, this.green * factor, this.blue * factor);
    }

    sum(color)
    {
        return new Color(this.red + color.red, this.green + color.green, this.blue + color.blue);
    }
}

function PutPixel(x, y, color)
{
    x = canvas.width / 2 + (x | 0);
    y = canvas.height / 2 - (y | 0) - 1;
  
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
    {
      return;
    }
  
    let offset = 4 * (x + canvasBuffer.width*y);
    canvasBuffer.data[offset++] = color.red;
    canvasBuffer.data[offset++] = color.green;
    canvasBuffer.data[offset++] = color.blue;
    canvasBuffer.data[offset++] = 255;
}

var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");
var canvasBuffer = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

function Swap(point0, point1)
{
    let temp = new Vector(point0.x, point0.y, point0.z);
    point0.setValues(point1.x, point1.y, point1.z);
    point1.setValues(temp.x, temp.y, temp.z);
    delete temp;
}

function UpdateCanvas()
{
    canvasContext.putImageData(canvasBuffer, 0, 0);
}

function Interpolate(i0, d0, i1, d1)
{
    if (i0 == i1)
    {
        return [d0];
    }
    let values = [];
    let a = (d1 - d0) / (i1 - i0);
    let d = d0;
    for (let i = i0; i <= i1; i++)
    {
        values.push(d);
        d = d + a;
    }
    return values;
}

function DrawLine(point0, point1, color)
{
    let dx = point1.x - point0.x;
    let dy = point1.y - point0.y;
    if (Math.abs(dx) > Math.abs(dy))
    {
        if (dx < 0)
        {
            Swap(point0, point1);
        }
        let ys = Interpolate(point0.x, point0.y, point1.x, point1.y);
        for (let x = point0.x; x <= point1.x; x++)
        {
            PutPixel(x, ys[(x - point0.x) | 0], color);
        }        
    }
    else
    {
        if (dy < 0)
        {
            Swap(point0, point1);
        }
        let xs = Interpolate(point0.y, point0.x, point1.y, point1.x);
        for (let y = point0.y; y <= point1.y; y++)
        {
            PutPixel(xs[(y - point0.y) | 0], y, color);
        }        
    }
}

function DrawWireframeTriangle(point0, point1, point2, color)
{
    DrawLine(point0, point1, color);
    DrawLine(point1, point2, color);
    DrawLine(point2, point0, color);
}

function DrawFilledTriangle(point0, point1, point2, color)
{
    if (point1.y < point0.y)
    {
        Swap(point1, point0);
    }
    if (point2.y < point0.y)
    {
        Swap(point2, point0);
    }
    if (point2.y < point1.y)
    {
        Swap(point2, point1);
    }
    let x01 = Interpolate(point0.y, point0.x, point1.y, point1.x);
    let x12 = Interpolate(point1.y, point1.x, point2.y, point2.x);
    let x02 = Interpolate(point0.y, point0.x, point2.y, point2.x);
    x01.pop();
    let x012 = x01.concat(x12);

    let m = (x02.length/2) | 0;

    let xLeft, xRight;
    if (x02[m] < x012[m])
    {
        xLeft = x02;
        xRight = x012;
    }
    else
    {
        xLeft = x012;
        xRight = x02;
    }
    for (let y = point0.y; y <= point2.y; y++)
    {
        for (let x = xLeft[y - point0.y]; x <= xRight[y - point0.y]; x++)
        {
            PutPixel(x, y, color);
        }
    }
}

var point0 = new Vector(-69, -337, 0);
var point1 = new Vector(228, 228, 0);
var point2 = new Vector(14, 88, 0);

DrawFilledTriangle(point0, point1, point2, new Color(155, 255, 0));
DrawWireframeTriangle(point0, point1, point2, new Color(0, 0, 0));

UpdateCanvas();