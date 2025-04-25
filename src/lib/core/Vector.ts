export default class Vector {
    constructor(
        public x: number,
        public y: number
    ) {
        this.x = x
        this.y = y
    }
    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y)
    }

    // Subtract another vector
    subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y)
    }

    // Multiply by scalar
    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar)
    }

    // Dot product
    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y
    }

    // Magnitude (length of the vector)
    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    // Normalize the vector (make it unit length)
    normalize(): Vector {
        const mag = this.magnitude()
        if (mag === 0) return new Vector(0, 0)
        return this.scale(1 / mag)
    }
}
