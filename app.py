from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

# Sample data for rides
rides = []
ride_id_counter = 1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/user')
def user():
    return render_template('user.html')

@app.route('/driver')
def driver():
    return render_template('driver.html')

@app.route('/get_ride_requests')
def get_ride_requests():
    return jsonify(rides)

@app.route('/book_cab', methods=['POST'])
def book_cab():
    global ride_id_counter
    data = request.get_json()
    
    # Create a new ride request
    ride = {
        'id': ride_id_counter,
        'user_name': data['user_name'],
        'user_phone': data['user_phone'],
        'pickup': data['pickup'],
        'dropoff': data['dropoff'],
        'description': data.get('description', ''),
        'status': 'pending'
    }
    
    rides.append(ride)
    ride_id_counter += 1
    
    return jsonify({'success': True, 'message': 'Ride booked successfully.', 'ride_id': ride['id']})

@app.route('/accept_ride', methods=['POST'])
def accept_ride():
    data = request.get_json()
    ride_id = data['ride_id']
    driver_name = data['driver_name']

    for ride in rides:
        if ride['id'] == ride_id and ride['status'] == 'pending':
            ride['status'] = 'accepted'
            ride['driver_name'] = driver_name
            return jsonify({'success': True, 'message': 'Ride accepted successfully.'})

    return jsonify({'success': False, 'message': 'Failed to accept ride.'})

@app.route('/chat/<int:ride_id>')
def chat(ride_id):
    ride = next((ride for ride in rides if ride['id'] == ride_id), None)
    if ride:
        return render_template('chat.html', ride_id=ride['id'], user_name=ride['user_name'], 
                               pickup=ride['pickup'], dropoff=ride['dropoff'], 
                               description=ride['description'], driver_name=ride.get('driver_name', 'Not Assigned Yet'))
    return redirect(url_for('index'))

@socketio.on('join_chat')
def handle_join_chat(ride_id):
    join_room(ride_id)

@socketio.on('send_message')
def handle_send_message(data):
    emit('receive_message', {
        'message': data['message'],
        'sender_name': data['sender_name']
    }, room=data['ride_id'])

if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5000)
    
