from flask import Flask, render_template, url_for, request, redirect
from flask_socketio import SocketIO, send, emit
from functools import wraps

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


# decorator that redirects user if they don't have a username
def username_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in request.cookies:
            return redirect(url_for('username'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/', methods=['GET', 'POST'])
def username():
    if request.method == 'GET':
        return render_template('username.html')
    return redirect(url_for('chat'))


@app.route('/chat', methods=['GET'])
@username_required
def chat():
    return render_template('chat.html')


# --- SOCKETIO ---

# holds all users connected
userList = {}


# creates an empty user dict with the client ID as the key
@socketio.on('connect')
def connect():
    userList[request.sid] = {"username": '', "color": ''}


# adds a user to the dictionary that holds all users
@socketio.on('setUser')
def set_user(user):
    userList[request.sid]['username'] = user


# set users text color
@socketio.on('setColor')
def set_color(color):
    userList[request.sid]['color'] = color


# alerts everyone that a user connected
@socketio.on('connectEvent')
def connectEvent():
    emit('messageEvent', '<li style="color:' + userList[request.sid]['color'] + ';">' +
         userList[request.sid]['username'] + " has connected!" + '</li>', broadcast=True)


# alerts everyone that a user disconnected
@socketio.on('disconnect')
def disconnect():
    emit('messageEvent', '<li style="color:' + userList[request.sid]['color'] + ';">' +
         userList[request.sid]['username'] + " has disconnected!" + '</li>', broadcast=True)
    del userList[request.sid]


# if message was successfully received by client, sent this to the original sender
def ack(id):
    emit('messageRecd', 'Message Sent', room=id)


# all messages to client pass through here
@socketio.on('messageEvent')
def handleMessage(msg):
    # print(msg)
    emit("messageEvent",
         '<li style="color:' + userList[request.sid]['color'] + ';">' +
         userList[request.sid]['username'] + ": " + msg + '</li>',
         broadcast=True, callback=ack(request.sid))


# all commands to client pass through here
@socketio.on('commandEvent')
def handleCommand(cmd):
    # print(cmd)
    emit("messageEvent", '<li style="color:' + userList[request.sid]['color'] + ';">' +
         userList[request.sid]['username'] + cmd + '</li>', broadcast=True)


# invalid command message will only be sent to the user who made the invalid command
@socketio.on('invalidEvent')
def invalidEvent(msg):
    # print(cmd)
    emit("messageEvent", '<li style="color:' + userList[request.sid]['color'] + ';">' +
         msg + '</li>')


if __name__ == '__main__':
    print('listening on port 5000')
    socketio.run(app)
