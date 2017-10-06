var canvas, ctx, WIDTH, HEIGHT, FPS, tileSize, playing, gameover, tilesX, tilesY, maxX, maxY, minX, minY, score, step;
var snake, food, numTiles;
var globalTouch = [],
    offSet = [];


var keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

window.addEventListener("keydown", keyDown);
window.addEventListener("resize", resizeWindow);
window.addEventListener("touchstart", touchStart);
window.addEventListener("touchend", touchEnd);
window.addEventListener("touchmove", touchMove);
document.getElementById("btnNewGame").addEventListener("click",restart);

//Evento para remover o zoom inclusive no IOS 10
document.documentElement.addEventListener("gesturestart", removeZoomIphone, false);

function touchMove(e) {

    var touch = e.touches[0];

    offSet = [touch.pageX - globalTouch[0], touch.pageY - globalTouch[1]];

}

function touchEnd(e) {
    
    if(!playing){
        toggleHide('startScreen');
    }

    //caso o toque do usuário não tenha arrasto, previne NAN    
    if (offSet.length == 0) {
        offSet = globalTouch;
    }

    //verifica se o usuário arrastou o dedo no eixo x ou y, 
    // para isso, verificar o valor do delta (offset) e ver quem é maior x ou y
    // pois o dedo nunca terá um trajetória perfeito em um núnico eixo
    if (Math.abs(offSet[0]) > Math.abs(offSet[1])) {
        // um número dividido por seu absuluto é sempre 1 ou -1
        snake.direction = [(offSet[0] / Math.abs(offSet[0])), 0];
    }
    else {
        snake.direction = [0, offSet[1] / Math.abs(offSet[1])];
    }

    playing = true;
    

}

function touchStart(e) {

    e.preventDefault();

    var touch = e.touches[0];

    globalTouch = [touch.pageX, touch.pageY];

}

//Função para remover o zoom do iphone
function removeZoomIphone(e) {
    e.preventDefault();
};

function keyDown(e) {


    //verificar se a tecla digitada faz parte para inicar o game
    if (!playing) {
        for (var [key, value] of Object.entries(keys)) {
            if (value == e.keyCode) {
                playing = true;
                toggleHide('startScreen');
            }
        }
    }

    //comportamento da direção da setas
    switch (e.keyCode) {
        case keys.left:
            snake.direction = [-1, 0];
            break;
        case keys.up:
            snake.direction = [0, -1];
            break;
        case keys.right:
            snake.direction = [1, 0];
            break;
        case keys.down:
            snake.direction = [0, 1];
            break;
    }

}

function init() {
    canvas = document.createElement("canvas");
    resizeWindow();
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    FPS = 10;
    step = 0;
    gameover = false;
    
    newGame();
    run();

}

function upd() {
    snake.update();
    document.getElementById("scoreNum").innerHTML = score;
}

function drw() {

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    snake.draw();
    food.draw();
    rectBorder();
}

function rectBorder() {
    ctx.strokeStyle = "#666";

    var x = minX * tileSize;
    var y = minY * tileSize;
    var w = (maxX - minX + 1) * tileSize;
    var h = (maxY - minY + 1) * tileSize;

    ctx.strokeRect(x, y, w, h);

    // console.log("rect",x, y, w, h);
}

function run() {

    upd();
    drw();

    var running = setTimeout(run, 1000 / FPS);

    if (gameover) {
        clearInterval(running);
    }
    
    // if (playing) {
    //     document.getElementById("overScreen").style.display = "none";
    // }

}

function resizeWindow() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    numTiles = 60;

    tileSize = Math.max(Math.floor(WIDTH / numTiles), Math.floor(HEIGHT / numTiles));

    //descobre quantos quadados cabem em cada eixo após resize
    tilesX = Math.floor(WIDTH / tileSize);
    tilesY = Math.floor(HEIGHT / tileSize);

    maxX = Math.floor(tilesX * 0.9);
    maxY = Math.floor(tilesY * 0.9);
    minX = Math.floor(tilesX * 0.1);
    minY = Math.floor(tilesY * 0.1);

}

function Food() {

    //posição aleatória com ajuste de escala pelo tileSize
    var x = Math.floor(Math.random() * (maxX - minX) + minX) * tileSize;
    var y = Math.floor(Math.random() * (maxY - minY) + minY) * tileSize;


    this.position = [x, y];
    this.color = "#FF0000";

    this.draw = function() {

        ctx.fillStyle = this.color;

        ctx.fillRect(this.position[0], this.position[1], tileSize, tileSize);

    }

}

function Snake() {
    this.body = [
        [10, 10],
        [10, 11],
        [10, 12]
    ];
    this.color = "#000";
    this.direction = [0, -1];


    this.update = function() {
        let x = this.body[0][0] + this.direction[0];
        let y = this.body[0][1] + this.direction[1];
        var nextPos = [x, y];

        if (!playing) {
            if (this.direction[1] == -1 && nextPos[1] <= minY) {
                // Y está indo pra cima, então altura máx será 10%
                // muda direção do vetor para direita
                this.direction = [1, 0];
            }
            else if (this.direction[0] == 1 && nextPos[0] >= maxX) {
                // X está indo pra direita então a largura máx será 90% 
                // muda direção do vetor para baixo
                this.direction = [0, 1];
            }
            else if (this.direction[1] == 1 && nextPos[1] >= maxY) {
                this.direction = [-1, 0];
            }
            else if (this.direction[0] == -1 && nextPos[0] <= minX) {
                this.direction = [0, -1];
            }
        }
        else {
            if (nextPos[1] <= minY) {
                // Y está indo pra cima, então altura máx será 10%
                gameOver();
            }
            else if (nextPos[0] >= maxX) {
                // X está indo pra direita então a largura máx será 90% 
                // muda direção do vetor para baixo
                gameOver();
            }
            else if (nextPos[1] >= maxY) {
                gameOver();
            }
            else if (nextPos[0] <= minX) {
                gameOver();
            }
        }

        // ajusta o tamanho da cobra quando munda de direção
        if (nextPos[0] == this.body[1][0] && nextPos[1] == this.body[1][1]) {
            this.body.reverse();
            let x = this.body[0][0] + this.direction[0];
            let y = this.body[0][1] + this.direction[1];
            nextPos = [x, y];
        }

        var delPos = true;

        if (food.position[0] == (nextPos[0] * tileSize) && food.position[1] == (nextPos[1] * tileSize)) {
            delPos = false;
        }

        if (delPos) {
            this.body.pop();
        }
        else {
            food = new Food();
            food.draw();
            score++;
        }

        this.body.splice(0, 0, nextPos);


    }

    this.draw = function() {

        ctx.fillStyle = this.color;

        for (var i = 0; i < this.body.length; i++) {

            let x = this.body[i][0] * tileSize;
            let y = this.body[i][1] * tileSize;


            ctx.fillRect(x, y, tileSize, tileSize);
            // console.log("snake",x, y, tileSize, tileSize);
        }
    }
}

function gameOver() {

    gameover = true;
    toggleHide('overScreen');

}

function newGame() {
    snake = new Snake();
    food = new Food();
    score = 0;

    playing = false;
    
    toggleHide('startScreen');
    

}

function restart(){
    toggleHide('overScreen');
    init();
}

function toggleHide(elName){
    var el = document.getElementById(elName);
    el.classList.toggle("hide");
}

init();