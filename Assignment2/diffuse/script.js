class Light
{
    constructor(type, intensity, value)
    {
        this.type = type;
        this.intensity = intensity;
        this.point = value;
    }
    type = null;
    intensity = 0;
    point = null;
}

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
}

// function ColorMultiplication(color, factor)
// {
//     return new Color(color.red * factor, color.green * factor, color.blue * factor);
// }

class Sphere
{
    constructor(origin, radius, color, specular)
    {
        this.origin = origin;
        this.radius = radius;
        this.color = color;
        this.specular = specular;
    }
    origin = new Vector(0, 0, 0);
    radius = 1;
    color = new Color();
    specular = 1;
}

function PutPixel(x, y, color)
{
    x = canvas.width / 2 + x;
    y = canvas.height / 2 - y - 1;
  
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

function CanvasToViewport(x, y)
{
    return new Vector(x * VIEWPORT_SIZE / canvas.width, y * VIEWPORT_SIZE / canvas.height, DIRECTION);
}

// function VectorSum(point1, point2)
// {
//     return new Vector(point1.x + point2.x, point1.y + point2.y, point1.z + point2.z);
// }

// function VectorMultiplication(point, factor)
// {
//     return new Vector(point.x * factor, point.y * factor, point.z * factor);
// }

// function VectorSubtraction(point1, point2)
// {
//     return VectorSum(point1, VectorMultiplication(point2, -1));
// }

// function VectorLenght(point)
// {
//     return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
// }

// function VectorNormalization(point)
// {
//     return VectorMultiplication(point, 1.0 / VectorLenght(point));
// }

// function DotProduct(point1, point2)
// {
//     return (point1.x * point2.x) + (point1.y * point2.y) + (point1.z * point2.z);
// }

function ComputeLighting(point, normal)
{
    let intensity = 0.0;
    for (let light of lights)
    {
        if (light.type === "ambient")
        {
            intensity += light.intensity;
        }
        else 
        {
            if (light.type === "point")
            {
                // vectorL = VectorSubtraction(light.point, point);
                vectorL = light.point.subtraction(point);
            }
            else
            {
                vectorL = light.point;
            }
            // let nDotVectorL = DotProduct(normal, vectorL);
            let nDotVectorL = normal.dotProduct(vectorL);
            if (nDotVectorL > 0)
            {
                // intensity += light.intensity * nDotVectorL / (VectorLenght(normal) * VectorLenght(vectorL)); 
                intensity += light.intensity * nDotVectorL / (normal.lenght() * vectorL.lenght()); 
            }
        }
    }
    return intensity;
}

function IntersectRaySphere(origin, DIRECTION, sphere)
{
    let r = sphere.radius;
    // let sphereCenterToOriginVector = VectorSubtraction(origin, sphere.origin);
    let sphereCenterToOriginVector = origin.subtraction(sphere.origin);

    // let a = DotProduct(DIRECTION, DIRECTION);
    let a = DIRECTION.dotProduct(DIRECTION);
    // let b = 2 * DotProduct(sphereCenterToOriginVector, DIRECTION);
    let b = 2 * sphereCenterToOriginVector.dotProduct(DIRECTION);
    // let c = DotProduct(sphereCenterToOriginVector, sphereCenterToOriginVector) - r * r;
    let c = sphereCenterToOriginVector.dotProduct(sphereCenterToOriginVector) - r * r;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) 
    {
        return [Infinity, Infinity];
    }

    t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return [t1, t2];
}

function TraceRay(origin, DIRECTION, tMin, tMax) 
{
    let closestT = Infinity;
    let closestSphere = null;
    for (let sphere of spheres) 
    {
        ts = IntersectRaySphere(origin, DIRECTION, sphere);
        if (ts[0] >= tMin && ts[0] <= tMax && ts[0] < closestT) 
        {
            closestT = ts[0];
            closestSphere = sphere;
        }
        if (ts[1] >= tMin && ts[1] <= tMax && ts[1] < closestT)
        {
            closestT = ts[1];
            closestSphere = sphere;
        }
    }
    if (closestSphere == null)
    {
        return BACKGROUND_COLOR;
    }
    // let point = VectorSum(origin, VectorMultiplication(DIRECTION, closestT));
    let point = origin.sum(DIRECTION.multiplication(closestT));
    // let normal = VectorSubtraction(point, closestSphere.origin);
    let normal = point.subtraction(closestSphere.origin);
    // normal = VectorNormalization(normal);
    // normal = normal.normalization();
    normal = normal.multiplication(1.0 / normal.lenght());
    // return ColorMultiplication(closestSphere.color, ComputeLighting(point, normal));
    return closestSphere.color.multiplication(ComputeLighting(point, normal));
}

const BACKGROUND_COLOR = new Color(255, 255, 255);
const VIEWPORT_SIZE = 1;
const DIRECTION = 1; 
const CAMERA_POSITION = new Vector(0, 0, 0);

var origin = new Vector(0, 0, 0);
spehereA = new Sphere(new Vector(1, 1, 4), 1, new Color(255, 0, 0), 500);
spehereB = new Sphere(new Vector(-1, 1, 4), 1, new Color(0, 255, 0), 400);
spehereC = new Sphere(new Vector(0, -1, 3), 1, new Color(0, 0, 255), 10);
spehereD = new Sphere(new Vector(0, -5001, 0), 5000, new Color(255, 255, 0), 1000);
var spheres = [spehereA, spehereB, spehereC, spehereD];

lightAmbient = new Light("ambient", 0.2, null);
lightPoint = new Light("point", 0.6, new Vector(2, 1, 0));
lightDirection = new Light("direction", 0.2, new Vector(1, 4, 4));
var lights = [lightAmbient, lightPoint, lightDirection];

var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");
var canvasBuffer = canvasContext.getImageData(0, 0, canvas.width, canvas.height);


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
    canvasContext.putImageData(canvasBuffer, 0, 0);
}
   
UpdateCanvas();

