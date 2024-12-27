from configuration import socket_io
from flask_socketio import SocketIO, emit


class SocketIOManager:
    # Singleton implementation

    def __new__(cls, *args, **kwargs):
        if not hasattr(cls, '_instance'):
            cls._instance = super(SocketIOManager, cls).__new__(cls, *args, **kwargs)
            cls._instance.__initialized = False
        return cls._instance

    def __init__(self):
        if not self.__initialized:
            self.__initialized = True


    def emit_gpio_state(self, state):
        socket_io.emit('gpio_state', {'state': state}, )