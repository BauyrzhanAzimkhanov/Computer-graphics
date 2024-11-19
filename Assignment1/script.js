class Point
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
}

class Sphere
{
    constructor(origin, radius, color)
    {
        this.origin = origin;
        this.radius = radius;
        this.color = color;
    }
    origin = new Point(0, 0, 0);
    radius = 1;
    color = new Color();
}

function PutPixel(x, y, color)
{
    x = canvas.width / 2 + x;
    y = canvas.height / 2 - y - 1;
  
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
    {
      return;
    }
  
    let offset = 4 * (x + canvas_buffer.width*y);
    canvas_buffer.data[offset++] = color.red;
    canvas_buffer.data[offset++] = color.green;
    canvas_buffer.data[offset++] = color.blue;
    canvas_buffer.data[offset++] = 255;
}

function CanvasToViewport(x, y)
{
    return new Point(x * VIEWPORT_SIZE / canvas.width, y * VIEWPORT_SIZE / canvas.height, D);
}

function TraceRay(O, D, t_min, t_max) 
{
    let closest_t = Infinity;
    let closest_sphere = null;
    for (let sphere of spheres) 
    {
        ts = IntersectRaySphere(O, D, sphere);
        if (ts[0] >= t_min && ts[0] <= t_max && ts[0] < closest_t) 
        {
            closest_t = ts[0];
            closest_sphere = sphere;
        }
        if (ts[1] >= t_min && ts[1] <= t_max && ts[1] < closest_t)
        {
            closest_t = ts[1];
            closest_sphere = sphere;
        }
    }
    if (closest_sphere == null)
    {
        return BACKGROUND_COLOR;
    }
    return closest_sphere.color;
}

function VectorSubtraction(point1, point2)
{
    return new Point(point1.x - point2.x, point1.y - point2.y, point1.z - point2.z);
}

function DotProduct(point1, point2)
{
    return (point1.x * point2.x) + (point1.y * point2.y) + (point1.z * point2.z);
}

function IntersectRaySphere(O, D, sphere)
{
    let r = sphere.radius;
    let CO = VectorSubtraction(O, sphere.origin);

    let a = DotProduct(D, D);
    let b = 2 * DotProduct(CO, D);
    let c = DotProduct(CO, CO) - r * r;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) 
    {
        return [Infinity, Infinity];
    }

    t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return [t1, t2];
}

const BACKGROUND_COLOR = new Color(255, 255, 255);
const VIEWPORT_SIZE = 1;
const D = 1; // projection_plane_z
const CAMERA_POSITION = new Point(0, 0, 0);

var O = new Point(0, 0, 0);
spehereA = new Sphere(new Point(1, 2, 4), 1, new Color(255, 0, 0));
spehereB = new Sphere(new Point(-1, -2, 4), 1, new Color(0, 255, 0));
spehereC = new Sphere(new Point(0, 0, 3), 1, new Color(0, 0, 255));
var spheres = [spehereA, spehereB, spehereC];
var canvas = document.getElementById("canvas");
var canvas_context = canvas.getContext("2d");
var canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height);


for (let x = -canvas.width / 2; x < canvas.width / 2; x++)
{
    for (let y = -canvas.height / 2; y < canvas.height / 2; y++)
    {
        let direction = CanvasToViewport(x, y);
        let color = TraceRay(CAMERA_POSITION, direction, 1, Infinity);
        PutPixel(x, y, color);
    }
}

function UpdateCanvas()
{
    canvas_context.putImageData(canvas_buffer, 0, 0);
}
   
UpdateCanvas();

