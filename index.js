Math.TAU = 2 * Math.PI

Math.deg2rad = (n) => {
	return n * (Math.PI / 180)
}

class Gear
{
	constructor(
		x, y,
		outerTeeths, outerPitchDiameter, outerWidth, outerPressureAngle,
		scale, precision
	){
		this.x = x
		this.y = y
		this.outerTeeths = outerTeeths
		this.outerPitchDiameter = outerPitchDiameter
		this.outerWidth = outerWidth
		this.outerPressureAngle = outerPressureAngle
		this.scale = scale
		this.precision = precision
	}

	render(ctxt)
	{
		const obj = new GearSceneObject(this, ctxt)
		obj.render()
	}
}

class GearSceneObject {
	constructor(gear, ctxt)
	{
		this.gear = gear
		this.ctxt = ctxt

		this.center = [
			0.5 * this.ctxt.canvas.width,
			0.5 * this.ctxt.canvas.height
		]

		this.pressureAngle = Math.deg2rad(this.gear.outerPressureAngle)

		this.m = this.gear.outerPitchDiameter * this.gear.scale
		// console.log(this.gear, this.m)
		this.rPrimitif = 0.5 * this.m * this.gear.outerTeeths
		this.rBase = this.rPrimitif * Math.cos(this.pressureAngle)
		this.rTete = this.rPrimitif + this.m
		// console.log('TETE', this.rTete, this.rPrimitif)
		this.rPied = this.rPrimitif - 1.25 * this.m
		// console.log('diametres', this.rPrimitif, this.rTete, this.rPied)

		this.rInv = Math.max(this.rPied, this.rBase)

		this.outerHalfToothAngle = Math.PI / this.gear.outerTeeths
	}

	involutePolar(t, ccw, continuous, minDist, maxDist, minTheta, maxTheta)
	{
		if (ccw && continuous) {
			t = 1 - t
		}

		let rho = 1 / Math.cos(t)
		let theta = (ccw ? -1 : 1) * (t - Math.tan(t))
		// console.log('dev', theta/Math.PI, minTheta, maxTheta, theta)

		if ((minTheta !== undefined && theta < minTheta)
			|| (maxTheta !== undefined && theta > maxTheta)
		) {
			return undefined
		}

		//*
		// console.log('rho', rho, minDist, maxDist)
		if (minDist !== undefined && rho < minDist) {
			rho = minDist
		} else if (maxDist !== undefined && rho > maxDist) {
			rho = maxDist
		}
		// console.log('final rho', rho, minDist, maxDist)
		//*/

		return [
			rho,
			theta
		]
	}

	involuteXY(t, ccw, continuous, minDist, maxDist, minTheta, maxTheta)
	{
		let pos = this.involutePolar(
			t,
			ccw,
			continuous,
			minDist,
			maxDist,
			minTheta,
			maxTheta
		)

		if (pos === undefined) {
			return undefined
		}

		return [
			pos[0] * Math.cos(pos[1]),
			pos[0] * Math.sin(pos[1])
		]
	}

	render(withGuides)
	{
		if (withGuides !== false) this.renderGuides()

		this.ctxt.strokeStyle = 'black'
		for (let n = 0; n < this.gear.outerTeeths; n++) {
			const currentToothAngle = -2 * n * this.outerHalfToothAngle
			// console.log(this.center[0], this.center[1], currentToothAngle, this.rPrimitif, this.rTete, this.rPied, this.outerHalfToothAngle)

			this.renderHalfTooth(
				this.center[0],
				this.center[1],
				currentToothAngle,
				false
			)

			this.renderHalfTooth(
				this.center[0],
				this.center[1],
				currentToothAngle,
				true
			)
			// break
		}
	}

	renderGuides()
	{
		this.ctxt.beginPath()
		this.ctxt.arc(this.center[0], this.center[1], this.rPrimitif, 0, Math.TAU)
		this.ctxt.strokeStyle = 'red'
		this.ctxt.stroke()

		this.ctxt.beginPath()
		this.ctxt.arc(this.center[0], this.center[1], this.rTete, 0, Math.TAU)
		this.ctxt.strokeStyle = 'orange'
		this.ctxt.stroke()

		this.ctxt.beginPath()
		this.ctxt.moveTo(this.center[0], this.center[1])
		this.ctxt.lineTo(this.center[0] + this.rPrimitif, this.center[1])
		this.ctxt.strokeStyle = 'blue'
		this.ctxt.stroke()

		this.ctxt.beginPath()
		this.ctxt.moveTo(this.center[0], this.center[1])
		this.ctxt.lineTo(
			this.center[0] + this.rPrimitif * Math.cos(this.outerHalfToothAngle),
			this.center[1] + this.rPrimitif * Math.sin(this.outerHalfToothAngle)
		)
		this.ctxt.strokeStyle = 'blue'
		this.ctxt.stroke()

		this.ctxt.beginPath()
		this.ctxt.moveTo(this.center[0], this.center[1])
		this.ctxt.lineTo(
			this.center[0] + this.rPrimitif * Math.cos(2 * this.outerHalfToothAngle),
			this.center[1] + this.rPrimitif * Math.sin(2 * this.outerHalfToothAngle)
		)
		this.ctxt.strokeStyle = 'blue'
		this.ctxt.stroke()


		this.ctxt.beginPath()
		this.ctxt.arc(this.center[0], this.center[1], this.rBase, 0, Math.TAU)
		this.ctxt.strokeStyle = 'purple'
		this.ctxt.stroke()

		this.ctxt.beginPath()
		this.ctxt.arc(this.center[0], this.center[1], this.rPied, 0, Math.TAU)
		this.ctxt.strokeStyle = 'green'
		this.ctxt.stroke()

		for (let n = 1; n <= this.center[0] / this.rInv; n++) {
			this.ctxt.beginPath()
			this.ctxt.arc(this.center[0], this.center[1], n * this.rInv, 0, Math.TAU)
			this.ctxt.strokeStyle = 'blue'
			this.ctxt.stroke()
		}

		const tmul = 1.5
		this.renderSpiral(false, tmul)
		this.renderSpiral(true, tmul)
	}

	renderSpiral(ccw, tmul)
	{
		ccw = ccw === true

		if (tmul === undefined) {
			tmul = 1
		}

		const ba = (ccw ? -1 : 1) * Math.TAU

		for (let n = 0; n <= 2 * this.gear.outerTeeths; n++) {
			let a = ba * 0.5 * (n / this.gear.outerTeeths) - 0.5 * this.outerHalfToothAngle
			let cosa = Math.cos(a)
			let sina = Math.sin(a)

			if (n % 2 == 1 * !ccw) {
				continue
			}

			let prevT
			for (let t = 0; t <= 1; t += 0.01) {
				if (t > 0) {
					let p1 = this.involuteXY(tmul * prevT, ccw, false)
					let p2 = this.involuteXY(tmul * t, ccw, false)
					// console.log(p1, p2)

					let p11 = [
						this.center[0] + this.rInv * (p1[0] * cosa - p1[1] * sina),
						this.center[1] - this.rInv * (p1[0] * sina + p1[1] * cosa)
					]

					let p22 = [
						this.center[0] + this.rInv * (p2[0] * cosa - p2[1] * sina),
						this.center[1] - this.rInv * (p2[0] * sina + p2[1] * cosa)
					]

					// console.log(p11, p22)

					this.ctxt.beginPath()
					this.ctxt.moveTo(p11[0], p11[1])
					this.ctxt.lineTo(p22[0], p22[1])
					this.ctxt.strokeStyle = ccw ? 'red' : 'green'
					this.ctxt.stroke()
				}

				prevT = t
			}

			//if (n > 1) break
		}
	}

	renderHalfTooth(x, y, theta, ccw)
	{
		let ha = 0.5 * this.outerHalfToothAngle
		let currAngle = ccw ? (theta + this.outerHalfToothAngle + ha) : theta

		this.ctxt.beginPath()

		if (!ccw) {
			this.ctxt.arc(
				x,
				y,
				this.rPied,
				currAngle,
				currAngle + ha
			)

			currAngle += ha
		}

		let currCos = Math.cos(-currAngle)
		let currSin = Math.sin(-currAngle)
		// console.log(currAngle, this.outerHalfToothAngle, theta, currCos, currSin)
		// console.log('tete', this.rTete/this.rPied, this.rTete)

		for (let t = 0; t <= 1; t += 0.01) {
			let pos
			let invAngle = Math.PI / (2 * this.gear.outerTeeths)

			pos = this.involuteXY(
				t,
				ccw,
				true,
				1,
				this.rTete / this.rInv,
				ccw ? 0 : -invAngle,
				ccw ? invAngle : 0
			)

			// console.log(pos)

			if (pos === undefined) {
				continue
			}

			let tx = x + this.rInv * (pos[0] * currCos - pos[1] * currSin)
			let ty = y - this.rInv * (pos[0] * currSin + pos[1] * currCos)

			this.ctxt.lineTo(tx, ty)
		}

		if (ccw) {
			this.ctxt.arc(
				x,
				y,
				this.rPied,
				currAngle,
				currAngle + ha
			)
		}

		this.ctxt.stroke()
	}
}
