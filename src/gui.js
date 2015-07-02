
import dat from 'dat-gui'
import EventEmitter from 'events'

export default class Gui extends EventEmitter {
    constructor( props ) {
        super()

        this.props = props
        this.gui = new dat.GUI()

        this.gui.add( props, 'min', -1, 1 )
            .step( 0.05 )
            .onFinishChange( this.onChange )
        this.gui.add( props, 'max', -1, 1 )
            .step( 0.05 )
            .onFinishChange( this.onChange )
        this.gui.add( props, 'octaves', 1, 8 )
            .step( 1 )
            .onFinishChange( this.onChange )
        this.gui.add( props, 'persistence', 0, 10 )
            .step( 0.1 )
            .onFinishChange( this.onChange )
        this.gui.add( props, 'frequency', 0, 1 )
            .step( 0.005 )
            .onFinishChange( this.onChange )
        this.gui.add( props, 'amplitude', 0, 10 )
            .step( 0.1 )
            .onFinishChange( this.onChange )
    }

    register( name, fn ) {
        let func = {}
        func[ name ] = fn
        this.gui.add( func, name )
    }

    onChange = () => {
        this.emit( 'change' )
    }

}
