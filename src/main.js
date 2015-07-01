
import Simplex from 'fast-simplex-noise'
import makeGUI from './gui'

const CANVAS_SIZE = 512
const CHUNK_SIZE = 128

const canvas = document.createElement( 'canvas' )
const ctx = canvas.getContext( '2d' )
canvas.setAttribute( 'width', CANVAS_SIZE )
canvas.setAttribute( 'height', CANVAS_SIZE )
document.body.appendChild( canvas )



let simplexParams = {
    max: 1,
    min: 0,
    frequency: .01,
    amplitude: 1,
    octaves: 8,
    persistence: .5
}


class SimplexView {
    constructor( size = CHUNK_SIZE ) {
        this.offset = size / 2
        this.mapSize = size * 2
        this.map = []

        this.generate()
    }

    to1d( x, y, size ) {
        return x + ( y * ( size || this.mapSize ) )
    }

    getFill( value ) {
        // let opacity = value > .5
        //     ? 1
        //     : 0

        return 'rgba( ' + 0 + ', 0, 0, ' + value + ')'
    }

    generate() {
        let simplex = new Simplex( simplexParams )

        for ( let x = 0; x < this.mapSize; x++ ) {
            for ( let y = 0; y < this.mapSize; y++ ) {
                this.map[ this.to1d( x, y ) ] = simplex.get2DNoise( x, y )
            }
        }
    }

    /**
     * Renders at x,y within the canvas
     */
    render( x, y ) {

        //ctx.clearRect( 0, 0, CANVAS_SIZE, CANVAS_SIZE )

        // Each chunk has an overlap which is half its size
        // i.e. if a chunk is 16x16 then it is actually 32x32 within
        // an 8 pixel overlap border.
        // We want to render the middle part of the chunk and not the
        // overlap borders (which are used to generate other chunks)
        for ( let i = 0; i < this.mapSize / 2; i++ ) {
            for ( let j = 0; j < this.mapSize / 2; j++ ) {
                let xi = j + this.offset
                let yi = i + this.offset
                let value = this.map[ this.to1d( xi, yi ) ]

                ctx.fillStyle = this.getFill( value )
                ctx.fillRect( x + j, y + i, 1, 1 )
            }
        }
    }
}

class MapView {
    constructor() {
        this.chunks = []
        this.mapSize = ( CANVAS_SIZE / CHUNK_SIZE )

        for ( let y = 0; y < this.mapSize; y++ ) {
            for ( let x = 0; x < this.mapSize; x++ ) {
                this.chunks.push( new SimplexView( CHUNK_SIZE ) )
            }
        }

        // this.chunk = new SimplexView( 32 )
        // this.chunk.generate()
    }

    to1d( x, y, size ) {
        return x + ( y * ( size || this.mapSize ) )
    }

    render() {
        for ( let y = 0; y < this.mapSize; y++ ) {
            for ( let x = 0; x < this.mapSize; x++ ) {
                this.chunks[ this.to1d( x, y ) ].render( x * CHUNK_SIZE, y * CHUNK_SIZE )
            }
        }
    }
}

let mapView = new MapView()

mapView.render()

window.mapView = mapView
window.SimplexView = SimplexView
