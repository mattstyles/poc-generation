
import dat from 'dat-gui'

export default function makeGUI( view ) {
    let gui = new dat.GUI()

    function onGUIChange() {
        view.render()
    }

    gui.add( view, 'min', -1, 1 )
        .step( 0.05 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'max', -1, 1 )
        .step( 0.05 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'octaves', 1, 8 )
        .step( 1 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'persistence', 0, 10 )
        .step( 0.1 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'frequency', 0, 1 )
        .step( 0.005 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'amplitude', 0, 10 )
        .step( 0.1 )
        .onFinishChange( onGUIChange )
    gui.add( view, 'mapSize', 1, 10 )
        .step( 1 )
        .onFinishChange( onGUIChange )

    return gui
}
