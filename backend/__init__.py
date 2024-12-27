# # import your socketio object (with the other imports at the
# # top of the file)
# # in this example, the file from the previous step is named socket.py
# from .socket import socketio

# # initialize the app with the socket instance
# # you could include this line right after Migrate(app, db)
# socketio.init_app(app)

# # at the bottom of the file, use this to run the app
# if __name__ == '__main__':
#     socketio.run(app)