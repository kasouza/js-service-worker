const counters = Object.create(null);

async function audio(counterId) {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
        client.postMessage({
            message: 'play-audio',
            counterId,
        });
    }
}

async function setupCounter(event) {
    const id = newId();
    counters[id] = {
        id,
        count: 0,
    };

    setInterval(() => {
        counters[id].count++;
        if (counters[id].count % 5 == 0) {
            audio(id);
        }
    }, 1000);

    return id;
}

async function getCount(event) {
    if (event.data.id === undefined) {
        return {
            'error': 'empty_counter_id',
        };
    }

    if (!counters[event.data.id]) {
        return {
            'error': 'invalid_counter_id',
        };
    }

    return counters[event.data.id].count;
};

const handlers = {
    'create-counter': setupCounter,
    'get-count': getCount,
};

async function callHandlers(event) {
    const handler = handlers[event.data.message];
    if (!handler) {
        event.ports.forEach(port => {
            port.postMessage({
                error: 'invalid_message',
                errorMessage: 'Invalid message "' + event.data.message + '"',
            })
        });

        return;
    }

    const result = await handler(event);

    event.ports.forEach(port => {
        port.postMessage(result);
    });
}

self.addEventListener('message', async (event) => {
    event.waitUntil(callHandlers(event));
});

let i = 0;
function newId() {
    return i++;
}
