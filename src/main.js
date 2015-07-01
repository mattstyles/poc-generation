
import Simplex from 'fast-simplex-noise'
import makeGUI from './gui'

const CANVAS_SIZE = 512

const canvas = document.createElement( 'canvas' )
const ctx = canvas.getContext( '2d' )
canvas.setAttribute( 'width', CANVAS_SIZE )
canvas.setAttribute( 'height', CANVAS_SIZE )
document.body.appendChild( canvas )


class SimplexView {
    constructor() {
        this.max = 1
        this.min = 0
        this.frequency = 0.01
        this.octaves = 4
        this.amplitude = 1
        this.persistence = .5

        this.mapSize = 8
    }

    to1d( x, y, size ) {
        return x + ( y * size )
    }

    getFill( value ) {
        // let v = ( .5 + ( value / 2  ) )
        // console.log( v )
        // let opacity = value > 0.2
        //     ? 1
        //     : 0

        return 'rgba( ' + 0 + ', 0, 0, ' + value + ')'
    }

    render() {
        let simplex = new Simplex({
            max: this.max,
            min: this.min,
            frequency: this.frequency,
            amplitude: this.amplitude,
            octaves: this.octaves,
            persistence: this.persistence
        })

        let size = Math.pow( 2, this.mapSize )

        ctx.clearRect( 0, 0, CANVAS_SIZE, CANVAS_SIZE )
        let width = CANVAS_SIZE / size

        for ( let x = 0; x < size; x++ ) {
            for ( let y = 0; y < size; y++ ) {

                let value = simplex.get2DNoise( x, y )

                ctx.fillStyle = this.getFill( value )
                ctx.fillRect( x * width, y * width, width, width )
            }
        }
    }
}

let simplexView = new SimplexView()
makeGUI( simplexView )
