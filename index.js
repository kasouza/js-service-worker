let counter = null;
let button = null;

let counterId = 0;

function sendMessage(message) {
    return new Promise(function(resolve, reject) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
            if (event.data.error) {
                reject(event.data);
            } else {
                resolve(event.data);
            }
        };

        navigator.serviceWorker.controller.postMessage(message,
            [messageChannel.port2]);
    });
}

function playAudio() {
    const audio = new Audio('/audio.mp3');
    audio.play();
}

function main() {
    counter = document.querySelector('#counter');
    button = document.querySelector('#button');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.counterId !== counterId) {
                    return;
                }

                if (event.data.message === 'play-audio') {
                    playAudio();
                }
            });

            button.addEventListener('click', () => {
                sendMessage({
                    message: 'create-counter',
                })
                    .then(id => counterId = id)
                    .catch(console.error);
            });

            setInterval(async () => {
                if (counterId !== null) { 
                    const count = await sendMessage({ message: 'get-count', id: counterId}).catch(console.error);
                    counter.textContent = count ?? 'Erro';
                }
            }, 1000);
        });

        navigator.serviceWorker.register('/worker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful');
        }, function(err) {
            // Registration failed
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}

window.addEventListener('load', main);
