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
const VIEWPORT_SIZE = 1;
const PROJECTION_PLANE_Z = 1;

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

function ViewportToCanvas(vector) 
{
    return new Vector(vector.x * canvas.width/VIEWPORT_SIZE, vector.y * canvas.height/VIEWPORT_SIZE, 0);
}

function ProjectVertex(vertex) 
{
    return ViewportToCanvas(new Vector(vertex.x * PROJECTION_PLANE_Z / vertex.z, vertex.y * PROJECTION_PLANE_Z / vertex.z, 0))
}

let vAf = new Vector(-2, -0.5, 5);
let vBf = new Vector(-2, 0.5, 5);
let vCf = new Vector(-1, 0.5, 5);
let vDf = new Vector(-1, -0.5, 5);

let vAb = new Vector(-2, -0.5, 6);
let vBb = new Vector(-2, 0.5, 6);
let vCb = new Vector(-1, 0.5, 6);
let vDb = new Vector(-1, -0.5, 6);

let blueColor = new Color(0, 0, 255);
let redColor = new Color(255, 0, 0);
let greenColor = new Color(0, 255, 0);

DrawLine(ProjectVertex(vAf), ProjectVertex(vBf), blueColor);
DrawLine(ProjectVertex(vBf), ProjectVertex(vCf), blueColor);
DrawLine(ProjectVertex(vCf), ProjectVertex(vDf), blueColor);
DrawLine(ProjectVertex(vDf), ProjectVertex(vAf), blueColor);

DrawLine(ProjectVertex(vAb), ProjectVertex(vBb), redColor);
DrawLine(ProjectVertex(vBb), ProjectVertex(vCb), redColor);
DrawLine(ProjectVertex(vCb), ProjectVertex(vDb), redColor);
DrawLine(ProjectVertex(vDb), ProjectVertex(vAb), redColor);

DrawLine(ProjectVertex(vAf), ProjectVertex(vAb), greenColor);
DrawLine(ProjectVertex(vBf), ProjectVertex(vBb), greenColor);
DrawLine(ProjectVertex(vCf), ProjectVertex(vCb), greenColor);
DrawLine(ProjectVertex(vDf), ProjectVertex(vDb), greenColor);

UpdateCanvas();