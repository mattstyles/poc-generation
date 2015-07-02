
import Simplex from 'fast-simplex-noise'
import makeGUI from './gui'

const CANVAS_SIZE = 512
const CHUNK_SIZE = 32
const PIXEL_SIZE = 1

const canvas = document.createElement( 'canvas' )
const ctx = canvas.getContext( '2d' )
canvas.setAttribute( 'width', CANVAS_SIZE * PIXEL_SIZE )
canvas.setAttribute( 'height', CANVAS_SIZE * PIXEL_SIZE )
document.body.appendChild( canvas )



let simplexParams = {
    max: .6,
    min: .3,
    frequency: .01,
    amplitude: 1,
    octaves: 8,
    persistence: .5
}


class ChunkView {
    constructor( size = CHUNK_SIZE ) {
        this.offset = size / 2
        this.mapSize = size
        this.fullSize = size * 2
        this.map = []

        this.logging = false

        // this.generate()
    }

    to1d( x, y, size ) {
        return x + ( y * ( size || this.fullSize ) )
    }

    getPixel( x, y ) {
        let xx = x + this.offset
        let yy = y + this.offset
        return this.map[ this.to1d( xx, yy ) ]
    }

    getFill( value ) {
        // let opacity = value > .5
        //     ? 1
        //     : 0

        return 'rgba( ' + 0 + ', 0, 0, ' + value + ')'
    }

    getPartial( x1, y1, x2, y2 ) {
        let arr = []
        for ( let i = y1; i < y2; i++ ) {
            for ( let j = x1; j < x2; j++ ) {
                arr.push( this.map[ this.to1d( i, j ) ] )
            }
        }
        return arr
    }

    getTop() {
        let x1 = this.offset
        let y1 = this.offset
        let x2 = this.offset + this.mapSize
        let y2 = this.offset + this.mapSize
        return this.getPartial( x1, y1, x2, y2 )
    }

    lerp( v0, v1, t ) {
        return v0 + t * ( v1 - v0 )
    }

    logVisible() {
        for ( let i = 0; i < this.mapSize; i++ ) {
            let row = []

            for ( let j = 0; j < this.mapSize; j++ ) {
                let value = this.getPixel( j, i )

                row.push( value.toFixed( 2 ) )
            }

            console.log( row.join( ',' ) )
        }
    }

    log() {
        for ( let i = 0; i < this.fullSize; i++ ) {
            let row = []
            let colors = []

            for ( let j = 0; j < this.fullSize; j++ ) {
                let value = this.map[ this.to1d( j, i ) ]

                row.push( '%c' + value.toFixed( 2 ) )

                if ( i >= this.offset &&
                     i < this.mapSize + this.offset &&
                     j >= this.offset &&
                     j < this.mapSize + this.offset
                     ) {
                    colors.push( 'color:#ff6644' )
                } else {
                    colors.push( 'color:#888888' )
                }

            }


            console.log( row.join( ','), ...colors )
        }
    }

    /**
     * Generates a new map for a chunk
     * Maps are larger than they need to be because they overlap into
     * adjacent chunks.
     * @param edges <Object> contains each adjacent chunk
     */
    generate( edges ) {
        //console.log( 'chunk::generate', edges )
        //console.time( 'chunkGen' )
        let simplex = new Simplex( simplexParams )
        let edgeSize = this.offset
        let rawValue = 1
        let edgeValue = 1
        let lerpValue = 1

        let tmp = Math.random()

        for ( let y = 0; y < this.fullSize; y++ ) {

            // tmp += 0.01

            for ( let x = 0; x < this.fullSize; x++ ) {
                rawValue = simplex.get2DNoise( x, y )


                tmp += 0.01

                // rawValue = tmp

                // Overlap top
                if ( edges.top ) {
                    if ( y < this.mapSize ) {
                        edgeValue = edges.top.map[ this.to1d( x, y + this.mapSize ) ]
                        lerpValue = 1 - ( ( y - edgeSize ) / ( this.offset - 1 ) )

                        if ( this.logging ) {
                            if ( x === this.offset ) {
                                console.log( 'pixel', x, y )
                                // console.log( 'edgePixel', x, y + this.mapSize )
                                // console.log( 'rawValue', rawValue )
                                // console.log( 'edgeValue', edgeValue )
                                console.log( 'lerp', y < edgeSize ? 1 : lerpValue )
                            }
                        }


                        // For overlap sections just use the section from the overlapper
                        // otherwise linearly merge the two based on how much the overlap
                        // enters the visible section of this chunk
                        // @TODO this should back-populate to the overlapping chunk
                        rawValue = this.lerp(
                            rawValue,
                            edgeValue,
                            y < edgeSize ? 1 : lerpValue
                        )


                        // if ( x === this.offset && y === this.offset ) {
                        //     console.log( 'lerped value', rawValue )
                        // }


                    }
                }

                this.map[ this.to1d( x, y ) ] = rawValue
                // this.map[ this.to1d( x, y ) ] = tmp

                // if ( window.dummy ) {
                // this.map[ this.to1d( x, y ) ] = rawValue
                // }
            }
        }
        //console.timeEnd( 'chunkGen' )
    }

    /**
     * Renders at x,y within the canvas
     */
    render( x, y ) {
        // console.log( 'rendering chunk at', x, y )
        ctx.clearRect( x, y, this.mapSize * PIXEL_SIZE, this.mapSize * PIXEL_SIZE )

        // Each chunk has an overlap which is half its size
        // i.e. if a chunk is 16x16 then it is actually 32x32 within
        // an 8 pixel overlap border.
        // We want to render the middle part of the chunk and not the
        // overlap borders (which are used to generate other chunks)
        for ( let i = 0; i < this.mapSize; i++ ) {
            for ( let j = 0; j < this.mapSize; j++ ) {
                let value = this.getPixel( j, i )

                ctx.fillStyle = this.getFill( value )
                ctx.fillRect( x + ( j * PIXEL_SIZE ), y + ( i * PIXEL_SIZE ), PIXEL_SIZE, PIXEL_SIZE )

                if ( window.text ) {
                    ctx.font = '11px "Helvetica Neue"'
                    ctx.fillStyle = '#ff0000'
                    ctx.fillText( value.toFixed( 2 ), x + ( j * PIXEL_SIZE ) + 2, y + ( i * PIXEL_SIZE ) + 21 )
                }
            }
        }

        // Draw red dot to help differentiate the grid
        // @TODO remove
        //ctx.fillStyle = '#ff0000'
        //ctx.fillRect( x + ( ( CHUNK_SIZE - 1 ) * PIXEL_SIZE ), y + ( ( CHUNK_SIZE - 1 ) * PIXEL_SIZE ), PIXEL_SIZE, PIXEL_SIZE )
    }
}



class MapView {
    constructor() {
        this.mapSize = ( CANVAS_SIZE / CHUNK_SIZE )
        this.chunks = new Array( this.mapSize * this.mapSize )

        for ( let y = 0; y < this.mapSize; y++ ) {
            for ( let x = 0; x < this.mapSize; x++ ) {
                this.chunks[ this.to1d( x, y ) ] = new ChunkView( CHUNK_SIZE )
            }
        }
    }

    to1d( x, y, size ) {
        return x + ( y * ( size || this.mapSize ) )
    }

    getChunk( x, y ) {
        return this.chunks[ this.to1d( x, y ) ]
    }

    generateChunk( x, y, edges ) {
        this.chunks[ this.to1d( x, y ) ].generate( edges )

        // Re-render, it'll be quicker than re-rendering everything
        // this.renderChunk( x, y )
    }

    renderChunk( x, y ) {
        console.log( 'rendering chunk', x, y )
        this.chunks[ this.to1d( x, y ) ].render( x * CHUNK_SIZE * PIXEL_SIZE, y * CHUNK_SIZE * PIXEL_SIZE )
    }

    generate() {
        console.log( 'generating map' )
        console.time( 'mapGen' )
        for ( let y = 0; y < this.mapSize; y++ ) {
            for ( let x = 0; x < this.mapSize; x++ ) {
                this.generateChunk( x, y, {
                    top: this.chunks[ this.to1d( x, y - 1 ) ]
                })
            }
        }
        console.timeEnd( 'mapGen' )
    }

    render() {
        for ( let y = 0; y < this.mapSize; y++ ) {
            for ( let x = 0; x < this.mapSize; x++ ) {
                this.renderChunk( x, y )
            }
        }
    }
}


let mapView = new MapView()


window.mapView = mapView
window.ChunkView = ChunkView
window.canvas = canvas
window.ctx = ctx

window.dummy = false
window.text = false





mapView.generate()
mapView.render()


// Click handler to create new chunk
canvas.addEventListener( 'click', event => {
    let chunkX = ~~( event.offsetX / CHUNK_SIZE / PIXEL_SIZE )
    let chunkY = ~~( event.offsetY / CHUNK_SIZE / PIXEL_SIZE )

    console.log( chunkX, chunkY )
    mapView.generateChunk( chunkX, chunkY, {
        top: mapView.getChunk( chunkX, chunkY - 1 )
    })
    mapView.renderChunk( chunkX, chunkY )
})
