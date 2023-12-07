
// VARIABLES DEL ESCENARIO
var w=800
var h=400
var jugador
var fondo
var nave
var nave2
var menu

// VARIABLES DE BALAS
var bala, balaD=false
var bala2,balaD2=false
var velocidadBalaX
var distanciaBalaX
var distanciaBala2Y
var velocidadBala2Y
var posicionBala2X
var posicionActual
var movimientoActivo = false


// VARIABLES DE MOVIMIENTO
var salto
var derecha
var izquierda

// VARIABLES PARA RED NEURONAL
var estatusSalto
var estatusIzquierda
var estatusDerecha
var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[]
var modoAuto = false, eCompleto=false

// VARIABLE DE JUEGO PHASER
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render})

// PRELOAD (DEFINICIÓN DE SPRITES)
function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg')
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48)
    juego.load.image('nave', 'assets/game/ufo.png')
    juego.load.image('bala', 'assets/sprites/purple_ball.png')
    juego.load.image('menu', 'assets/game/menu.png')

}



function create() {

    // DEFINIR BASE DEL JUEGO Y VARIABLES
    juego.physics.startSystem(Phaser.Physics.ARCADE)
    juego.physics.arcade.gravity.y = 800
    juego.time.desiredFps = 30

    //DEFINICIÓN SPRITES
    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo')
    nave = juego.add.sprite(w-100, h-70, 'nave')
    nave2 = juego.add.sprite(10, h-400, 'nave')
    bala = juego.add.sprite(w-100, h, 'bala')
    jugador = juego.add.sprite(50, h, 'mono')
    bala2 = juego.add.sprite(50, h-300, 'bala')

    // FISICAS DE BALA 1
    juego.physics.enable(bala)
    bala.body.collideWorldBounds = true

    // FISICAS DE BALA 2
    juego.physics.enable(bala2)
    bala2.body.collideWorldBounds = true
    bala2.body.allowGravity = false 

    //FISICAS DEL JUGADOR
    juego.physics.enable(jugador)
    jugador.body.collideWorldBounds = true
    var corre = jugador.animations.add('corre',[8,9,10,11])
    jugador.animations.play('corre', 10, true)

    // CONTROL DE PAUSA
    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' })
    pausaL.inputEnabled = true
    pausaL.events.onInputUp.add(pausa, self)
    juego.input.onDown.add(mPausa, self)

    //DEFINICIÓN DE BOTONES
    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    derecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT)


    //RED NEURONAL
        // nnEntrenamiento = new synaptic.Architect.LSTM(2,3,1)
    nnNetwork =  new synaptic.Architect.Perceptron(4, 10, 10, 2)
    nnEntrenamiento = new synaptic.Trainer(nnNetwork)

}


// CREACIÓN DE RED NEURONAL

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000, shuffle: true})
}


// GENERACIÓN DE DATOS DE ENTRENAMIENTO

function datosDeEntrenamiento(param_entrada){
    // [distanciaBalaX , velocidadBalaX, distanciaBala2Y, velocidadBala2Y]
    console.log("DX: ",param_entrada[0]+" VBX: "+param_entrada[1]+" DY: ",param_entrada[2]+" VBY: "+param_entrada[3])

    nnSalida = nnNetwork.activate(param_entrada)

    // UNA NEURONA
    // var solo = Math.round( nnSalida*100 )
    // var saltarP = nnSalida>=0.5
    // console.log("Valor único de salida: "+nnSalida+" ¿Salta?: "+saltarP)
    // return saltarP

    // DOS NEURONAS
    // var aire=Math.round( nnSalida[0]*100 )
    // var piso=Math.round( nnSalida[1]*100 )
    // console.log("Valor ","En el Aire %: "+ aire + " En el suelo %: " + piso )
    // return nnSalida[0]>=nnSalida[1]

    // CUATRO NEURONAS
    var salto=Math.round( nnSalida[0]*100 )
    var derecha=Math.round( nnSalida[1]*100 )
    console.log("Salto %: "+ salto + ", Derecha %: " + derecha )
    return [ nnSalida[0]>=0.5, nnSalida[1]>=0.5]

}

// FUNCIONES DEL MENÚ

function resetJuego(){
    jugador.body.velocity.x=0
    jugador.body.velocity.y=0
    jugador.position.x=50

    resetBala1()
    resetBala2()
}

function pausa(){
    juego.paused = true
    menu = juego.add.sprite(w/2,h/2, 'menu')
    menu.anchor.setTo(0.5, 0.5)
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2

        var mouse_x = event.x  ,
            mouse_y = event.y  
        
        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2  ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false
                datosEntrenamiento = []
                modoAuto = false
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" )
                    enRedNeural()
                    eCompleto=true
                }
                modoAuto = true
            }

            menu.destroy()
            resetJuego()
            juego.paused = false

        }
    }
}

function colisionH(){
    pausa()
    resetJuego()
}


// MOVIMIENTOS DEL JUGADOR

function saltar(){
    jugador.body.velocity.y = -250
}

function movDerecha() {
    var original = jugador.position.x
    if (!movimientoActivo) {
        movimientoActivo = true
        juego.add.tween(jugador).to({ x: original + 40 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(
            function () {juego.time.events.add(500, 
                function () {juego.add.tween(jugador).to({ x: original }, 100, Phaser.Easing.Linear.None, true).onComplete.add(
                    function () {movimientoActivo = false})}, this)}, this)
    }
}

// function movIzquierda() {
//         jugador.position.x -= velocidadMovimiento
//         estatusIzquierda = 1
// }

// UPDATE

function update() {

    fondo.tilePosition.x -= 1 
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this)
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this)

    estatusSalto = 0
    estatusDerecha = 0
    estatusIzquierda = 0
    // posicionActual = jugador.position.x


    if(salto.isDown ) {
        estatusSalto = 1
    }

    if(derecha.isDown ) {
        estatusDerecha = 1
    }

    // if(izquierda.isDown) {
    //     estatusIzquierda = 1
    // }
	
    distanciaBalaX = Math.floor( jugador.position.x - bala.position.x )
    distanciaBala2Y = Math.floor( jugador.position.y - bala2.position.y )
    // posicionBala2X = Math.floor( jugador.position.x - bala2.position.x )

    // MODO MANUAL

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar()
    }

    if( modoAuto==false && derecha.isDown ){
        movDerecha()
    }

    // if( modoAuto==false && izquierda.isDown ){
    //     movIzquierda()
    // }

    // MODO AUTOMÁTICO
    if( modoAuto == true ) {
        resultados = datosDeEntrenamiento([distanciaBalaX , velocidadBalaX, distanciaBala2Y, velocidadBala2Y])
        
        if(resultados[0] && jugador.body.onFloor()){
            saltar()
        }
        if(resultados[1]){
            movDerecha()
        }
    }

    // VERIFICAR DATOS DE LA BALA

    if( balaD==false ){
        disparo()
    }

    if( balaD2==false ){
        disparo2()
    }

    if( bala.position.x <= 0  ){
        resetBala1()
    }

    if (bala2.position.y == 383) {
        resetBala2()
    }
    // GENERAR DATOS DE ENTRENAMIENTO

    if( modoAuto ==false  && bala.position.x > 0 ){

        datosEntrenamiento.push({
                'input' :  [distanciaBalaX , velocidadBalaX, distanciaBala2Y, velocidadBala2Y],
                'output':  [estatusSalto, estatusDerecha]  
        })

        // console.log("distanciaBalaX: "+distanciaBalaX + " velocidadBalaX: " +velocidadBalaX + " distanciaBala2Y: "
        // + distanciaBala2Y+" velocidadBala2Y: "+velocidadBala2Y+' estatusSalto: '
        // +estatusSalto+' estatusDerecha: '+estatusDerecha)

        console.log("Datos: "+distanciaBalaX + ", " +velocidadBalaX + ", "
        + distanciaBala2Y+", "+velocidadBala2Y+", "
        +estatusSalto+", "+estatusDerecha)
    }



    }


// FUNCIONES DE LA BALA

function disparo(){
    velocidadBalaX =  -1 * velocidadRandom(200,300)
    bala.body.velocity.y = 0 
    bala.body.velocity.x = velocidadBalaX 
    balaD=true
}

function disparo2(){
    velocidadBala2Y =  1 * velocidadRandom(200,300)
    bala2.body.velocity.y = velocidadBala2Y 
    balaD2=true
}


function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function resetBala1(){
    bala.body.velocity.x = 0
    bala.position.x = w-100
    balaD=false
}

function resetBala2(){
    bala2.body.velocity.x = 0
    bala2.position.y = h-350
    balaD2=false
}


function render(){

}
