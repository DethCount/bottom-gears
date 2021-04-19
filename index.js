class Gear
{
	constructor(
		x, y,
		innerTeeths, innerPitchDiameter, innerWidth, innerPressureAngle,
		outerTeeths, outerPitchDiameter, outerWidth, outerPressureAngle,
		scale, precision
	){
		this.x = x
		this.y = y
		this.innerTeeths = innerTeeths
		this.innerPitchDiameter = innerPitchDiameter
		this.innerWidth = innerWidth
		this.innerPressureAngle = innerPressureAngle
		this.outerTeeths = outerTeeths
		this.outerPitchDiameter = outerPitchDiameter
		this.outerWidth = outerWidth
		this.outerPressureAngle = outerPressureAngle
		this.scale = scale
		this.precision = precision
	}

	involute2Polar(t, ccw, minDist, maxDist, minTheta, maxTheta) {
		t = ccw ? 1 - t : t
		let rho = 1 / Math.cos(t)
		let theta = (ccw ? -1 : 1) * (t - Math.tan(t))
		// console.log('dev', theta/Math.PI, minTheta, maxTheta, theta)

		if (theta < minTheta || theta > maxTheta) {
			return undefined
		}

		//*
		// console.log('rho', rho, minDist, maxDist)
		if (rho < minDist) {
			rho = minDist
		} else if (rho > maxDist) {
			rho = maxDist
		}
		// console.log('final rho', rho)
		//*/

		return [
			rho * Math.cos(theta),
			rho * Math.sin(theta)
		]
	}

	renderHalfTooth(x, y, theta, z, rPrimitif, rTete, rPied, angle, ccw) {
		let ha = 0.5 * angle
		let currAngle = ccw ? (theta + angle + ha) : theta

		ctxt.beginPath()

		if (!ccw) {
			ctxt.arc(
				x,
				y,
				rPied,
				currAngle,
				currAngle + ha
			)

			currAngle += ha
		}

		let currCos = Math.cos(-currAngle)
		let currSin = Math.sin(-currAngle)
		// console.log(currAngle, angle, theta, currCos, currSin)
		// console.log('tete', rTete/rPied, rTete)

		for (let t = 0; t <= 1; t += 0.01) {
			let pos
			let invAngle = Math.PI / (2 * z)

			pos = this.involute2Polar(
				t,
				ccw,
				1,
				rTete / rPied,
				ccw ? 0 : -invAngle,
				ccw ? invAngle : 0,
				ha
			)

			if (pos === undefined) {
				continue
			}

			let tx = x + rPied * (pos[0] * currCos - pos[1] * currSin)
			let ty = y - rPied * (pos[0] * currSin + pos[1] * currCos)

			ctxt.lineTo(tx, ty)
		}

		if (ccw) {
			ctxt.arc(
				x,
				y,
				rPied,
				currAngle,
				currAngle + ha
			)
		}

		ctxt.stroke()
	}

	render(ctxt) {
		let hw = 0.5 * ctxt.canvas.width
		let hh = 0.5 * ctxt.canvas.height
		let cx = hw
		let cy = hh

		let pressureAngle = this.outerPressureAngle * (Math.PI / 180)

		let m = this.outerPitchDiameter * this.scale
		let rPrimitif = 0.5 * m * this.outerTeeths
		// let rBase = rPrimitif * Math.cos(pressureAngle)
		let rTete = rPrimitif + m
		// console.log('TETE', rTete, rPrimitif)
		let rPied = rPrimitif - 1.25 * m
		// console.log('diametres', rPrimitif, rTete, rPied)

		let outerHalfToothAngle = Math.PI / this.outerTeeths

		ctxt.beginPath()
		ctxt.arc(hw, hh, rPrimitif, 0, 2 * Math.PI)
		ctxt.strokeStyle = 'red'
		ctxt.stroke()

		ctxt.beginPath()
		ctxt.arc(cx, cy, rTete, 0, 2 * Math.PI)
		ctxt.strokeStyle = 'orange'
		ctxt.stroke()

		ctxt.beginPath()
		ctxt.moveTo(cx, cy)
		ctxt.lineTo(cx + rPrimitif, cy)
		ctxt.strokeStyle = 'blue'
		ctxt.stroke()

		ctxt.beginPath()
		ctxt.moveTo(cx, cy)
		ctxt.lineTo(
			cx + rPrimitif * Math.cos(outerHalfToothAngle),
			cy + rPrimitif * Math.sin(outerHalfToothAngle)
		)
		ctxt.strokeStyle = 'blue'
		ctxt.stroke()

		ctxt.beginPath()
		ctxt.moveTo(cx, cy)
		ctxt.lineTo(
			cx + rPrimitif * Math.cos(2 * outerHalfToothAngle),
			cy + rPrimitif * Math.sin(2 * outerHalfToothAngle)
		)
		ctxt.strokeStyle = 'blue'
		ctxt.stroke()

		ctxt.beginPath()
		ctxt.arc(cx, cy, rPied, 0, 2 * Math.PI)
		ctxt.strokeStyle = 'green'
		ctxt.stroke()

		ctxt.strokeStyle = 'black'
		for (let n = 0; n < this.outerTeeths; n++) {
			let currentToothAngle = -2 * n * outerHalfToothAngle
			// console.log(cx, cy, currentToothAngle, rPrimitif, rTete, rPied, outerHalfToothAngle)
			this.renderHalfTooth(
				cx,
				cy,
				currentToothAngle,
				this.outerTeeths,
				rPrimitif,
				rTete,
				rPied,
				outerHalfToothAngle,
				false
			)
			this.renderHalfTooth(
				cx,
				cy,
				currentToothAngle,
				this.outerTeeths,
				rPrimitif,
				rTete,
				rPied,
				outerHalfToothAngle,
				true
			)
			//break
		}
	}
}
