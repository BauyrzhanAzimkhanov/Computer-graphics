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

class Vertex4D 
{
    constructor(x, y, z, w)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    x = 0;
    y = 0;
    z = 0;
    w = 0;
}
  
class Mat4x4 
{
    constructor(data)
    {
        this.data = data;
    }
    data = null;
}

class Triangle
{
    constructor(vector0, vector1, vector2, color)
    {
        this.vector0 = vector0;
        this.vector1 = vector1;
        this.vector2 = vector2;
        this.color = color;
    }
    vector0 = new Vector();
    vector1 = new Vector();
    vector2 = new Vector();
    color = new Color();
}

class Model
{
    constructor(vertices, triangles)
    {
        this.vertices = vertices;
        this.triangles = triangles;
    }
    vertices = [];
    triangles = [];
}
  
class Instance
{
    constructor(model, position, orientation, scale)
    {
        this.model = model;
        this.position = position;
        this.orientation = orientation || IdentityMatrix4x4;
        this.scale = scale || 1.0;
        this.transform = MultiplyMM4(MakeTranslationMatrix(this.position), MultiplyMM4(this.orientation, MakeScalingMatrix(this.scale)));
    }
    model = [];
    position = [];
    orientation = IdentityMatrix4x4;
    scale = 1.0;
    transform = MultiplyMM4(MakeTranslationMatrix(this.position), MultiplyMM4(this.orientation, MakeScalingMatrix(this.scale)));
}

class Camera
{
    constructor(position, orientation)
    {
        this.position = position;
        this.orientation = orientation;
    }
    position = new Vector();
    orientation = null;
}

function MakeOYRotationMatrix(degrees)
{
    let cos = Math.cos(degrees * Math.PI / 180.0);
    let sin = Math.sin(degrees * Math.PI / 180.0);
    return new Mat4x4([[cos, 0, -sin, 0], [0, 1, 0, 0], [sin, 0, cos, 0], [0, 0, 0, 1]])
}
  
function MakeTranslationMatrix(translation)
{
    return new Mat4x4([[1, 0, 0, translation.x], [0, 1, 0, translation.y], [0, 0, 1, translation.z], [0, 0, 0, 1]]);
}
  
function MakeScalingMatrix(scale) 
{
    return new Mat4x4([[scale, 0, 0, 0], [0, scale, 0, 0], [0, 0, scale, 0], [0, 0, 0, 1]]);
}
  
function MultiplyMV(mat4x4, vertex4d) 
{
    let result = [0, 0, 0, 0];
    let vector = [vertex4d.x, vertex4d.y, vertex4d.z, vertex4d.w];
  
    for (let i = 0; i < 4; i++)
    {
        for (let j = 0; j < 4; j++)
        {
            result[i] += mat4x4.data[i][j] * vector[j];
        }
    }

    return new Vertex4D(result[0], result[1], result[2], result[3]);
}

function MultiplyMM4(matrixA, matrixB)
{
    let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);

    for (let i = 0; i < 4; i++)
    {
        for (let j = 0; j < 4; j++)
        {
            for (let k = 0; k < 4; k++)
            {
                result.data[i][j] += matrixA.data[i][k] * matrixB.data[k][j];
            }
        }
    }
  
    return result;
}

function Transposed(matrix)
{
    let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    for (let i = 0; i < 4; i++)
    {
        for (let j = 0; j < 4; j++)
        {
            result.data[i][j] = matrix.data[j][i];
        }
    }
    return result;
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
const IdentityMatrix4x4 = new Mat4x4([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);

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
            let swap = point0; point0 = point1; point1 = swap; 
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
            let swap = point0; point0 = point1; point1 = swap;
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
    DrawLine(point0, point2, color);
}

function ViewportToCanvas(vector) 
{
    return new Vector(vector.x * canvas.width/VIEWPORT_SIZE, vector.y * canvas.height/VIEWPORT_SIZE, 0);
}

function ProjectVertex(vertex) 
{
    return ViewportToCanvas(new Vector(vertex.x * PROJECTION_PLANE_Z / vertex.z, vertex.y * PROJECTION_PLANE_Z / vertex.z, 0))
}

function RenderTriangle(triangle, projected_triangle) 
{
    DrawWireframeTriangle(projected_triangle[triangle.vector0], projected_triangle[triangle.vector1], projected_triangle[triangle.vector2], triangle.color);
}

function RenderInstance(instance)
{
    let projected_instance = [];
    let model = instance.model;
    for (let i = 0; i < model.vertices.length; i++)
    {
        projected_instance.push(ProjectVertex(model.vertices[i].sum(instance.position)));
    }
    for (let i = 0; i < model.triangles.length; i++)
    {
        RenderTriangle(model.triangles[i], projected_instance);
    }
}

function RenderModel(model, transform)
{
    let projected_model = [];
    for (let i = 0; i < model.vertices.length; i++)
    {
        let vertex = model.vertices[i]
        let vertexH = new Vertex4D(vertex.x, vertex.y, vertex.z, 1)
        projected_model.push(ProjectVertex(MultiplyMV(transform, vertexH)));
    }
    for (let i = 0; i < model.triangles.length; i++)
    {
        RenderTriangle(model.triangles[i], projected_model);
    }
}
  
  

function RenderObject(vertices, triangles) 
{
    let projected_triangle = [];
    for (let i = 0; i < vertices.length; i++) 
    {
        projected_triangle.push(ProjectVertex(vertices[i]));
    }
    for (let i = 0; i < triangles.length; i++) 
    {
        RenderTriangle(triangles[i], projected_triangle);
    }
}

function RenderScene(camera, instances)
{
    let cameraMatrix = MultiplyMM4(Transposed(camera.orientation), MakeTranslationMatrix(camera.position.multiplication(-1)));
  
    for (let i = 0; i < instances.length; i++)
    {
        let transform = MultiplyMM4(cameraMatrix, instances[i].transform);
        RenderModel(instances[i].model, transform);
    }
}

const vertices = [
    new Vector(1, 1, 1),
    new Vector(-1, 1, 1),
    new Vector(-1, -1, 1),
    new Vector(1, -1, 1),
    new Vector(1, 1, -1),
    new Vector(-1, 1, -1),
    new Vector(-1, -1, -1),
    new Vector(1, -1, -1)
];

let blueColor = new Color(0, 0, 255);
let redColor = new Color(255, 0, 0);
let greenColor = new Color(0, 255, 0);
let yellowColor = new Color(255, 255, 0);
let purpleColor = new Color(255, 0, 255);
let cyanColor = new Color(0, 255, 255);

const triangles = [
    new Triangle(0, 1, 2, redColor),
    new Triangle(0, 2, 3, redColor),
    new Triangle(4, 0, 3, greenColor),
    new Triangle(4, 3, 7, greenColor),
    new Triangle(5, 4, 7, blueColor),
    new Triangle(5, 7, 6, blueColor),
    new Triangle(1, 5, 6, yellowColor),
    new Triangle(1, 6, 2, yellowColor),
    new Triangle(4, 5, 1, purpleColor),
    new Triangle(4, 1, 0, purpleColor),
    new Triangle(2, 6, 7, cyanColor),
    new Triangle(2, 7, 3, cyanColor)
];

let cube = new Model(vertices, triangles);

let instances = [
    new Instance(cube, new Vector(-1.5, 0, 7), IdentityMatrix4x4, 0.75),
    new Instance(cube, new Vector(1.25, 2.5, 7.5), MakeOYRotationMatrix(228))
];

let camera = new Camera(new Vector(-3, 1, 2), MakeOYRotationMatrix(-30));

function Render()
{
    RenderScene(camera, instances);
    UpdateCanvas();
}

Render();

UpdateCanvas();