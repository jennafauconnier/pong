const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

const paddleHeight = 60;
const paddleWidth = 10;
const ballSize = 10;

let paddleY = 250;
let paddleY2 = 250;  // Nouveau paddle pour le deuxième joueur

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 2;

document.addEventListener('keydown', movePaddle);

function movePaddle(event) {
    if (event.key === 'ArrowUp' && paddleY > 0) {
        paddleY -= 10;
    } else if (event.key === 'ArrowDown' && paddleY < canvas.height - paddleHeight) {
        paddleY += 10;
    }

    // Envoyer la position mise à jour au serveur
    socket.write(JSON.stringify({ type: 'movement', player: { x: 0, y: paddleY } }));
}

function draw() {
    // Effacer le canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la raquette du premier joueur
    context.fillRect(0, paddleY, paddleWidth, paddleHeight);

    // Dessiner la raquette du deuxième joueur
    context.fillRect(canvas.width - paddleWidth, paddleY2, paddleWidth, paddleHeight);

    // Dessiner la balle
    context.beginPath();
    context.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    context.fill();

    // Mettre à jour la position de la balle
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Rebondir la balle sur les murs verticaux
    if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
        ballSpeedY = -ballSpeedY;
    }

    // Rebondir la balle sur les raquettes
    if (
        (ballX - ballSize < paddleWidth && ballY > paddleY && ballY < paddleY + paddleHeight) ||
        (ballX + ballSize > canvas.width - paddleWidth && ballY > paddleY2 && ballY < paddleY2 + paddleHeight)
    ) {
        ballSpeedX = -ballSpeedX;
    }

    // Si la balle sort de l'écran, la réinitialiser
    if (ballX + ballSize > canvas.width || ballX - ballSize < 0) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
    }

    // Appeler la fonction de dessin à la prochaine frame
    requestAnimationFrame(draw);
}

// Démarrer le jeu
draw();
