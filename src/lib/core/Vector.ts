const PRECISION = 1000
export default class Vector {
    constructor(
        public x: number,
        public y: number
    ) {
        this.x = x
        this.y = y
    }
    add(v: Vector): Vector {
        const roundedX = this.roundToTwoDecimals(this.x + v.x)
        const roundedY = this.roundToTwoDecimals(this.y + v.y)
        return new Vector(roundedX, roundedY)
    }

    // Subtract another vector
    subtract(v: Vector): Vector {
        const roundedX = this.roundToTwoDecimals(this.x - v.x)
        const roundedY = this.roundToTwoDecimals(this.y - v.y)
        return new Vector(roundedX, roundedY)
    }

    // Multiply by scalar
    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar)
    }

    // Dot product
    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y
    }

    // round to two decimals
    roundToTwoDecimals(value: number): number {
        return Math.round(value * PRECISION) / PRECISION
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
