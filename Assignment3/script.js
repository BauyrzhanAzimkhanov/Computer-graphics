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

    sum(color)
    {
        return new Color(this.red + color.red, this.green + color.green, this.blue + color.blue);
    }
}

class Sphere
{
    constructor(origin, radius, color, specular, reflective)
    {
        this.origin = origin;
        this.radius = radius;
        this.color = color;
        this.specular = specular;
        this.reflective = reflective
    }
    origin = new Vector(0, 0, 0);
    radius = 1;
    color = new Color();
    specular = 1;
    reflective = 0;
}

function ReflectRay(ray, normal)
{
    let dotProductNormalRay = normal.dotProduct(ray);
    let temp = normal.multiplication(2 * dotProductNormalRay);
    return temp.subtraction(ray);
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
    return new Vector(x * VIEWPORT_SIZE / canvas.width, y * VIEWPORT_SIZE / canvas.height, PROJECTION_PLANE_Z);
}

function ComputeLighting(point, normal, view, specular)
{
    let intensity = 0.0;
    for (let light of lights)
    {
        if (light.type === "ambient")
        {
            intensity += light.intensity;
            continue;
        }
        let vectorL;
        let tMax;
        if (light.type === "point")
        {
            vectorL = light.point.subtraction(point);
            tMax = 1.0;
        }
        else
        {
            vectorL = light.point;
            tMax = Infinity;
        }

        let shadowSphere = ClosestIntersection(point, vectorL, EPSILON, tMax);
        if (shadowSphere != null)
        {
            continue;
        }

        let nDotVectorL = normal.dotProduct(vectorL);
        if (nDotVectorL > 0)
        {
            intensity += light.intensity * nDotVectorL / (normal.lenght() * vectorL.lenght()); 
        }

        if(specular != -1)
        {
            let vectorR = normal.multiplication(2.0 * nDotVectorL);
            vectorR = vectorR.subtraction(vectorL);
            let rDotVectorV = vectorR.dotProduct(view);
            if (rDotVectorV > 0)
            {
                intensity += light.intensity * Math.pow(rDotVectorV / (vectorR.lenght() * view.lenght()), specular);
            }
        }
    }
    return intensity;
}

function IntersectRaySphere(origin, direction, sphere)
{
    let r = sphere.radius;
    let sphereCenterToOriginVector = origin.subtraction(sphere.origin);

    let a = direction.dotProduct(direction);
    let b = 2 * sphereCenterToOriginVector.dotProduct(direction);
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

function ClosestIntersection(origin, direction, tMin, tMax)
{
    let closestT = Infinity;
    let closestSphere = null;
    for (let sphere of spheres)
    {
        ts = IntersectRaySphere(origin, direction, sphere);
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
    if (closestSphere)
    {
        return [closestSphere, closestT];
    }
    return null;
}

function TraceRay(origin, direction, tMin, tMax, recurcionDepth) 
{
    let intersection = ClosestIntersection(origin, direction, tMin, tMax);
    if (!intersection)
    {
        return BACKGROUND_COLOR;
    }
    let closestSphere = intersection[0];
    let closestT = intersection[1];
    let point = origin.sum(direction.multiplication(closestT));
    let normal = point.subtraction(closestSphere.origin);
    normal = normal.multiplication(1.0 / normal.lenght());    
    let view = direction.multiplication(-1);
    let lighting = ComputeLighting(point, normal, view, closestSphere.specular);
    let localColor = closestSphere.color.multiplication(lighting);
    let reflectiveness = closestSphere.reflective;
    if (recurcionDepth <= 0 || reflectiveness <= 0)
    {
        return localColor;
    }
    let reflection = ReflectRay(view, normal);
    let reflectedColor = TraceRay(point, reflection, EPSILON, Infinity, recurcionDepth - 1);
    let localColorMultiplied = localColor.multiplication(1 - reflectiveness);
    let reflectedColorMultiplied = reflectedColor.multiplication(reflectiveness);
    return localColorMultiplied.sum(reflectedColorMultiplied);
}

const BACKGROUND_COLOR = new Color(0, 0, 0);
const VIEWPORT_SIZE = 1;
const PROJECTION_PLANE_Z = 1; 
const CAMERA_POSITION = new Vector(0, 0, 0);
const EPSILON = 0.001;

var origin = new Vector(0, 0, 0);
spehereA = new Sphere(new Vector(0, -1, 3), 1, new Color(255, 0, 0), 2000, 0.2);
spehereB = new Sphere(new Vector(-2, 0, 4), 1, new Color(0, 255, 0), 2000, 0.3);
spehereC = new Sphere(new Vector(2, 0, 4), 1, new Color(0, 0, 255), 2000, 0.4);
spehereD = new Sphere(new Vector(0, -5001, 0), 5000, new Color(255, 255, 0), 1000, 0.5);
var spheres = [spehereA, spehereB, spehereC, spehereD];

lightAmbient = new Light("ambient", 0.2, null);
lightPoint = new Light("point", 0.6, new Vector(2, 1, 0));
lightDirection = new Light("direction", 0.2, new Vector(1, 4, 4));
var lights = [lightAmbient, lightPoint, lightDirection];
let recursion_depth = 5;

var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");
var canvasBuffer = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

function ClearAll()
{
    canvas.width = canvas.width;
}

function Render() 
{
    ClearAll();
    setTimeout(function()
    {
        for (let x = -canvas.width / 2; x < canvas.width / 2; x++)
        {
            for (let y = -canvas.height / 2; y < canvas.height / 2; y++)
            {
                let direction = CanvasToViewport(x, y);
                let color = TraceRay(CAMERA_POSITION, direction, 1, Infinity, recursion_depth);
                PutPixel(x, y, color);
            }
        }
        UpdateCanvas();
    }, 0);
}


function UpdateCanvas()
{
    canvasContext.putImageData(canvasBuffer, 0, 0);
}

Render();

