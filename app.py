from flask import Flask, render_template, url_for, request, redirect
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@app.route('/', methods=['GET', 'POST'])
def username():
    if request.method == 'GET':
        return render_template('username.html')
    return redirect(url_for('connect'))


@app.route('/connect', methods=['GET'])
def connect():
    return render_template('connect.html')

# # listen for events on 'my event'
# @socketio.on('my event')
# def handle_my_custom_event(json):
#     print('received json: ' + str(json))
#     # send message to client
#     emit('my response', 'You have succesfully contacted the server')


@socketio.on('message')
def handleMessage(msg):
    print('Message: ' + msg)
    send(msg, broadcast=True)


if __name__ == '__main__':
    print('listening on port 5000')
    socketio.run(app)
