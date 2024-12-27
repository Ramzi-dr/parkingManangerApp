
from gpiozero.pins.rpigpio import RPiGPIOFactory
from gpiozero import DigitalOutputDevice, Button
import eventlet  # type: ignore
import logging
# Specify RPiGPIOFactory as the pin factory for gpiozero
pin_factory = RPiGPIOFactory()
# GPIO setup
RELAY_PIN_1 = 14
BUTTON_PIN = 26
relay_1 = DigitalOutputDevice(
    pin=RELAY_PIN_1, initial_value=True, pin_factory=pin_factory)
button = Button(BUTTON_PIN, pin_factory=pin_factory)


# Function to control the relay
def control_relay(relay):
    logging.info(f"Relay is turned ON")
    relay.off()  # Turn on the relay (setting it to LOW)
    eventlet.sleep(3)  # Wait for 3 seconds

    relay.on()  # Turn off the relay (setting it to HIGH)
    logging.info(f"Relay is turned OFF")

# Start the button monitoring task


def start_button_monitor():
    while True:
        if button.is_active:

            logging.info(f"Button is pressed")
            # socket_io_manager.emit_gpio_state("Button is pressed")
            # Wait for relay control to complete
            eventlet.spawn(control_relay, relay_1).wait()
        # else:
           # print("Button is not pressed")
            # socket_io_manager.emit_gpio_state('Button is not pressed')
        eventlet.sleep(5)  # Adjust debounce delay as needed


# Start the button monitoring task
eventlet.spawn(start_button_monitor)
