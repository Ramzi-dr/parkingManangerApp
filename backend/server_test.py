import asyncio
import multiprocessing
import socketio
from uvicorn import Config, Server

# Create an Async Socket.IO server
sio = socketio.AsyncServer()
# Wrap with a WSGI application
app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("Client disconnected:", sid)

@sio.event
async def message(sid, data):
    print("Message from", sid, ":", data)
    await sio.emit("reply", "Message received")
    
@sio.on('*') # type: ignore
async def any_event(event, sid, data):
    print(event)
async def async_gpio(sio):
    from gpio_test import gpio_controller
    await gpio_controller(sio)

async def run_app():
    config = Config(app, host="0.0.0.0", port=8000)
    server = Server(config)
    await server.serve()


async def main():
    server_task = asyncio.create_task(run_app())  # Start the server
    print(sio)
    await asyncio.sleep(3)  # Ensure server is running before starting GPIO
    await async_gpio(sio)  # Start the GPIO functionality


if __name__ == "__main__":
    asyncio.run(main())