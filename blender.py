import bpy
import mathutils
import math

m = 1.0
z = 106
pressureAngle = 20.0 * (math.pi / 180.0)
cx = 0.0
cy = 0.0

gear_name = 'gear_m_' + str(m) + '_z_' + str(z) + '_a_' + str(pressureAngle)

vertices = []
edges = []
faces = []

# /!\ finds and REPLACES gear with same name in collection
gear_collection = bpy.data.collections.get('gear_collection')
if gear_collection is None:
    gear_collection = bpy.data.collections.new('gear_collection')
    bpy.context.scene.collection.children.link(gear_collection)

gear_mesh = bpy.data.meshes.new('gear_mesh')

gear_object = gear_collection.objects.get(gear_name)
if gear_object is not None:
    gear_collection.objects.unlink(gear_object)

gear_object = bpy.data.objects.new(gear_name, gear_mesh)
gear_collection.objects.link(gear_object)

def involute2Polar(t, firstHalf, minDist, maxDist, minTheta, maxTheta):
    t = (1.0 - t, t)[firstHalf]
    rho = 1.0 / math.cos(t)
    theta = ((-1.0, 1.0)[firstHalf]) * (math.tan(t) - t)

    print('firstHalf: ' + str(firstHalf) + ' theta: ' + str(theta) + ' minTheta: ' + str(minTheta) + ' maxTheta: ' + str(maxTheta))

    if theta < minTheta or theta > maxTheta:
        return None

    if rho < minDist:
        rho = minDist
    elif rho > maxDist:
        rho = maxDist

    return [
        rho * math.cos(theta),
        rho * math.sin(theta)
    ]

def renderArc(x, y, r, thetaStart, thetaStop):
    thetaStep = (thetaStop - thetaStart) / 10
    theta = thetaStart
    # print('thetaStart: ' + str(thetaStart))
    # print('thetaStop: ' + str(thetaStop))

    for i in range(0, 10):
        # print('theta: ' + str(theta))
        vertices.append(mathutils.Vector([
            x + r * math.cos(theta),
            y + r * math.sin(theta),
            0.0
        ]))

        theta += thetaStep


def renderHalfTooth(x, y, theta, z, rPrimitif, rTete, rPied, angle, firstHalf):
    ha = 0.5 * angle
    currAngle = (theta + angle + ha, theta)[firstHalf]
    print('firstHalf: ' + str(firstHalf) + ' theta: ' + str(theta) + ' currAngle: ' + str(currAngle))

    # if not firstHalf:
        # return

    if firstHalf:
        renderArc(
            x,
            y,
            rPied,
            currAngle,
            currAngle + ha
        )

        currAngle += ha

    currCos = math.cos(currAngle)
    currSin = math.sin(currAngle)

    for t in range(0, 100):
        invAngle = math.pi / (2 * z)

        print('invAngle: ' + str(invAngle) + ' t: ' + str(t))

        pos = involute2Polar(
            t / 100,
            firstHalf,
            1.0,
            rTete / rPied,
            (0.0, -invAngle)[not firstHalf],
            (invAngle, 0.0)[not firstHalf]
        )

        print('pos: ' + str(pos))

        if pos is None:
            continue

        vertices.append(mathutils.Vector([
            x + rPied * (pos[0] * currCos - pos[1] * currSin),
            y + rPied * (pos[0] * currSin + pos[1] * currCos),
            0.0
        ]))

    if not firstHalf:
        renderArc(
            x,
            y,
            rPied,
            currAngle,
            currAngle + ha
        )

    return

def render():
    rPrimitif = 0.5 * m * z
    rTete = rPrimitif + m
    rPied = rPrimitif - 1.25 * m

    ha = math.pi / z
    for n in range(0, z):
        currentToothAngle = 2.0 * n * ha
        print('currentToothAngle: ' + str(currentToothAngle))

        renderHalfTooth(
            cx,
            cy,
            currentToothAngle,
            z,
            rPrimitif,
            rTete,
            rPied,
            ha,
            True
        )

        renderHalfTooth(
            cx,
            cy,
            currentToothAngle,
            z,
            rPrimitif,
            rTete,
            rPied,
            ha,
            False
        )

        # if n == 1:
            # break

    return


render()

for i in range(0, len(vertices)):
    if i == len(vertices) - 1:
        edges.append([i, 0])
    else:
        edges.append([i, i + 1])

print(str(edges))
gear_mesh.from_pydata(vertices, edges, faces)
gear_mesh.update()
