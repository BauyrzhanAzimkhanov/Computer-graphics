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
    constructor(firstArgument, y, z, w)
    {
        if (y == undefined)
        {
            this.x = firstArgument.x;
            this.y = firstArgument.y;
            this.z = firstArgument.z;
            this.w = firstArgument.w | 1;
        }
        else 
        {
            this.x = firstArgument;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    }
    x = 0;
    y = 0;
    z = 0;
    w = 0;

    subtraction(vertex) 
    { 
        return new Vertex4D(this.x - vertex.x, this.y - vertex.y, this.z - vertex.z, this.w - vertex.w); 
    }

    multiplication(factor) 
    {
        return new Vertex4D(this.x * factor, this.y * factor, this.z * factor, this.w); 
    }

    dotProduct(vector) 
    { 
        return this.x * vector.x + this.y * vector.y + this.z * vector.z; 
    }
    
    crossProduct(vertex4D) 
    { 
        return new Vertex4D(this.y * vertex4D.z - this.z * vertex4D.y, this.z * vertex4D.x - this.x * vertex4D.z, this.x * vertex4D.y - this.y * vertex4D.x); 
    }
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
    constructor(indexes, color)
    {
        this.indexes = indexes;
        this.color = color;
    }
    indexes = [];
    color = new Color();
}

class Model
{
    constructor(vertices, triangles, boundsCenter, boundsRadius)
    {
        this.vertices = vertices;
        this.triangles = triangles;
        this.boundsCenter = boundsCenter;
        this.boundsRadius = boundsRadius;
    }
    vertices = [];
    triangles = [];
    boundsCenter = [];
    boundsRadius = [];
}
  
class Instance
{
    constructor(model, position, orientation, scale)
    {
        this.model = model;
        this.position = position;
        this.orientation = orientation || IDENTITY_MATRIX_4_X_4;
        this.scale = scale || 1.0;
        this.transform = MultiplyMM4(MakeTranslationMatrix(this.position), MultiplyMM4(this.orientation, MakeScalingMatrix(this.scale)));
    }
    model = [];
    position = [];
    orientation = IDENTITY_MATRIX_4_X_4;
    scale = 1.0;
    transform = MultiplyMM4(MakeTranslationMatrix(this.position), MultiplyMM4(this.orientation, MakeScalingMatrix(this.scale)));
}

class Camera
{
    constructor(position, orientation)
    {
        this.position = position;
        this.orientation = orientation;
        this.clippingPlanes = [];
    }
    clippingPlanes = [];
    position = new Vector();
    orientation = null;
}

class Plane
{
    constructor(normal, distance)
    {
        this.normal = normal;
        this.distance = distance;
    }
    normal = new Vector();
    distance = 0;
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

function Shuffle(vector)
{
    for (let i = vector.length - 1; i > 0; --i)
    {
        let randomValue = Math.floor(Math.random() * (i + 1));
        [vector[i], vector[randomValue]] = [vector[randomValue], vector[i]];
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
var depthBuffer = Array();
depthBuffer.length = canvas.width * canvas.height;

var depthBufferingEnabled = true;
var backfaceCullingEnabled = true;
var drawOutlines = false;

const VIEWPORT_SIZE = 1;
const PROJECTION_PLANE_Z = 1;
const IDENTITY_MATRIX_4_X_4 = new Mat4x4([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);


function UpdateCanvas()
{
    canvasContext.putImageData(canvasBuffer, 0, 0);
}

function UpdateDepthBufferIfCloser(x, y, invZ) 
{
    x = canvas.width / 2 + (x | 0);
    y = canvas.height / 2 - (y | 0) - 1;
  
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height)
    {
        return false;
    }
  
    let offset = x + canvas.width * y;
    if (depthBuffer[offset] == undefined || depthBuffer[offset] < invZ)
    {
        depthBuffer[offset] = invZ;
        return true;
    }
    return false;
}
  
function ClearAll()
{
    canvas.width = canvas.width;
    depthBuffer = Array();
    depthBuffer.length = canvas.width * canvas.height;
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
    return new Vector(vector.x * canvas.width / VIEWPORT_SIZE | 0, vector.y * canvas.height / VIEWPORT_SIZE | 0, 0);
}

function ProjectVertex(vertex) 
{
    return ViewportToCanvas(new Vector(vertex.x * PROJECTION_PLANE_Z / vertex.z, vertex.y * PROJECTION_PLANE_Z / vertex.z, 0))
}

function SortedVertexIndexes(vertexIndexes, projected) 
{
    let indexes = [0, 1, 2];
  
    if (projected[vertexIndexes[indexes[1]]].y < projected[vertexIndexes[indexes[0]]].y) 
    { 
        let swap = indexes[0]; indexes[0] = indexes[1]; indexes[1] = swap; 
    }
    
    if (projected[vertexIndexes[indexes[2]]].y < projected[vertexIndexes[indexes[0]]].y) 
    { 
        let swap = indexes[0]; indexes[0] = indexes[2]; indexes[2] = swap; 
    }

    if (projected[vertexIndexes[indexes[2]]].y < projected[vertexIndexes[indexes[1]]].y) 
    { 
        let swap = indexes[1]; indexes[1] = indexes[2]; indexes[2] = swap; 
    }
  
    return indexes;
}
  
  
function ComputeTriangleNormal(vector0, vector1, vector2) 
{
    let vector0Vector1 = vector1.subtraction(vector0);
    let vector0Vector2 = vector2.subtraction(vector0);
    return vector0Vector1.crossProduct(vector0Vector2);
}
  
function EdgeInterpolate(y0, v0, y1, v1, y2, v2) 
{
    let v01 = Interpolate(y0, v0, y1, v1);
    let v12 = Interpolate(y1, v1, y2, v2);
    let v02 = Interpolate(y0, v0, y2, v2);
    v01.pop();
    let v012 = v01.concat(v12);
    return [v02, v012];
}
  

    
function RenderTriangle(triangle, vertices, projected) 
{
    let indexes = SortedVertexIndexes(triangle.indexes, projected);
    let [i0, i1, i2] = indexes;
    
    let vertex0 = vertices[triangle.indexes[i0]];
    let vertex1 = vertices[triangle.indexes[i1]];
    let vertex2 = vertices[triangle.indexes[i2]];
  
    let normal = ComputeTriangleNormal(vertices[triangle.indexes[0]], vertices[triangle.indexes[1]], vertices[triangle.indexes[2]]);
  
    if (backfaceCullingEnabled) 
    {
        let vertexToCamera = vertices[triangle.indexes[0]].multiplication(-1);
        if (vertexToCamera.dotProduct(normal) <= 0)
        {
            return;
        }
    }
  
    let p0 = projected[triangle.indexes[i0]];
    let p1 = projected[triangle.indexes[i1]];
    let p2 = projected[triangle.indexes[i2]];
  
    let [x02, x012] = EdgeInterpolate(p0.y, p0.x, p1.y, p1.x, p2.y, p2.x);
    let [iz02, iz012] = EdgeInterpolate(p0.y, 1.0/vertex0.z, p1.y, 1.0/vertex1.z, p2.y, 1.0/vertex2.z);
  
    let middle = (x02.length/2) | 0;
    if (x02[middle] < x012[middle]) 
    {
        var [x_left, x_right] = [x02, x012];
        var [iz_left, iz_right] = [iz02, iz012];
    } 
    else 
    {
        var [x_left, x_right] = [x012, x02];
        var [iz_left, iz_right] = [iz012, iz02];
    }
  
    for (let y = p0.y; y <= p2.y; y++) 
    {
        let [xl, xr] = [x_left[y - p0.y] | 0, x_right[y - p0.y] | 0];
    
        let [zl, zr] = [iz_left[y - p0.y], iz_right[y - p0.y]];
        let zscan = Interpolate(xl, zl, xr, zr);
  
        for (let x = xl; x <= xr; x++)
        {
            if (!depthBufferingEnabled || UpdateDepthBufferIfCloser(x, y, zscan[x - xl])) 
            {
                PutPixel(x, y, triangle.color);
            }
        }
    }
  
    if (drawOutlines) 
    {
        console.log("p0 is " + p0);
        console.log("p1 is " + p1);
        console.log("p2 is " + p2);
        let outlineColor = triangle.color.multiplication(0.75);
        DrawLine(p0, p1, outlineColor);
        DrawLine(p0, p2, outlineColor);
        DrawLine(p2, p1, outlineColor);
    }
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

function ClipTriangle(triangle, plane, triangles, vertices) 
{
    let vertex0 = vertices[triangle.indexes[0]];
    let vertex1 = vertices[triangle.indexes[1]];
    let vertex2 = vertices[triangle.indexes[2]];
  
    let intersection0 = plane.normal.dotProduct(vertex0) + plane.distance > 0;
    let intersection1 = plane.normal.dotProduct(vertex1) + plane.distance > 0;
    let intersection2 = plane.normal.dotProduct(vertex2) + plane.distance > 0;
  
    let intersectionCount = intersection0 + intersection1 + intersection2;
    if (intersectionCount == 0) 
    {
        // Nothing to do
    } 
    else if (intersectionCount == 3) 
    {
        triangles.push(triangle);
    } 
    else if (intersectionCount == 1) 
    {
        // Output is one clipped triangle.
    } 
    else if (intersectionCount == 2) 
    {
        // Output is two clipped triangles.
    }
}
  
  
function TransformAndClip(clippingPlanes, model, scale, transform)
{
    let center = MultiplyMV(transform, new Vertex4D(model.boundsCenter));
    let radius = model.boundsRadius * scale;
    for (let p = 0; p < clippingPlanes.length; p++) 
    {
        let distance = clippingPlanes[p].normal.dotProduct(center) + clippingPlanes[p].distance;
        if (distance < -radius) 
        {
            return null;
        }
    }
  
    let vertices = [];
    for (let i = 0; i < model.vertices.length; i++) 
    {
        vertices.push(MultiplyMV(transform, new Vertex4D(model.vertices[i])));
    }

    let triangles = model.triangles.slice();
    for (let p = 0; p < clippingPlanes.length; p++) 
    {
        let newTriangles = [];
        for (let i = 0; i < triangles.length; i++)
        {
            ClipTriangle(triangles[i], clippingPlanes[p], newTriangles, vertices);
        }
        triangles = newTriangles;
    }
  
    return new Model(vertices, triangles, center, model.boundsRadius);
}

function RenderModel(model)
{
    let projectedModel = [];
    for (let i = 0; i < model.vertices.length; i++)
    {
        projectedModel.push(ProjectVertex(new Vertex4D(model.vertices[i])));
    }
    for (let i = 0; i < model.triangles.length; i++)
    {
        RenderTriangle(model.triangles[i], model.vertices, projectedModel);
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
        console.log("Rendering object number " + i);
        let transform = MultiplyMM4(cameraMatrix, instances[i].transform);
        let clippedObjects = TransformAndClip(camera.clippingPlanes, instances[i].model, instances[i].scale, transform);
        if (clippedObjects != null)
        {
            console.log("It's object is not null!");
            RenderModel(clippedObjects);
        }
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
    new Triangle([0, 1, 2], redColor),
    new Triangle([0, 2, 3], redColor),
    new Triangle([1, 5, 6], yellowColor),
    new Triangle([1, 6, 2], yellowColor),
    new Triangle([2, 6, 7], cyanColor),
    new Triangle([2, 7, 3], cyanColor),
    new Triangle([4, 0, 3], greenColor),
    new Triangle([4, 1, 0], purpleColor),
    new Triangle([4, 3, 7], greenColor),
    new Triangle([4, 5, 1], purpleColor),
    new Triangle([5, 4, 7], blueColor),
    new Triangle([5, 7, 6], blueColor)
];

let cube = new Model(vertices, triangles, new Vector(0, 0, 0), Math.sqrt(3));

let instances = [
    new Instance(cube, new Vector(-1.5, 0, 7), IDENTITY_MATRIX_4_X_4, 0.55),
    new Instance(cube, new Vector(1.25, 2.5, 7.5), MakeOYRotationMatrix(100)),
];

let camera = new Camera(new Vector(-3, 1, 2), MakeOYRotationMatrix(-30));

let s2 = 1.0 / Math.sqrt(2);

camera.clippingPlanes = [
    new Plane(new Vector(  0,   0,  1), -1),
    new Plane(new Vector( s2,   0, s2),  0),
    new Plane(new Vector(-s2,   0, s2),  0),
    new Plane(new Vector(  0, -s2, s2),  0),
    new Plane(new Vector(  0,  s2, s2),  0),
];

function ShuffleCubeTriangles() 
{
    Shuffle(cube.triangles);
    Render();
}
  
function SetDepthEnabled(enabled) 
{
    depthBufferingEnabled = enabled;
    backfaceCullingEnabled = enabled;
    Render();
}

function SetOutlinesEnabled(enabled)
{
    drawOutlines = enabled;
    Render();
}

function Render()
{
    ClearAll();
    setTimeout(function() {
        RenderScene(camera, instances);
        UpdateCanvas();
    }, 0);
}

Render();
