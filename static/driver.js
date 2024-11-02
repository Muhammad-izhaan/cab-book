document.addEventListener('DOMContentLoaded', function () {
    const rideRequestsElement = document.getElementById('rideRequests');
    const noRequestsElement = document.getElementById('noRequests');

    // Function to fetch and display ride requests
    function fetchRideRequests() {
        fetch('/get_ride_requests')
            .then(response => response.json())
            .then(data => {
                rideRequestsElement.innerHTML = ''; // Clear previous requests
                let hasRequests = false; // Flag to check if there are any pending requests

                data.forEach(ride => {
                    if (ride.status === "pending") {
                        hasRequests = true; // Set the flag to true if a pending request is found
                        const listItem = document.createElement("li");
                        listItem.innerHTML = `
                            Ride from ${ride.user_name} (Phone: ${ride.user_phone})<br>
                            Pickup: ${ride.pickup}, Dropoff: ${ride.dropoff}
                            <button onclick="acceptRide(${ride.id})">Accept Ride</button>
                        `;
                        rideRequestsElement.appendChild(listItem);
                    }
                });

                // Show or hide the no requests message based on the flag
                noRequestsElement.style.display = hasRequests ? 'none' : 'block';
            })
            .catch(error => {
                console.error('Error fetching ride requests:', error);
                noRequestsElement.style.display = 'block'; // Show message if there's an error
            });
    }

    // Function to accept a ride
    window.acceptRide = function (rideId) {
        const driverName = document.getElementById("driver_name").value;
        if (!driverName) {
            alert("Please enter your name.");
            return;
        }

        fetch('/accept_ride', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ride_id: rideId, driver_name: driverName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // Redirect to the chat page after acceptance
                window.location.href = `/chat/${rideId}?user_type=driver&driver_name=${encodeURIComponent(driverName)}`;
            } else {
                alert("Failed to accept ride.");
            }
        })
        .catch(error => {
            console.error('Error accepting ride:', error);
            alert("Failed to accept ride. Please try again later.");
        });
    }

    // Fetch ride requests every 5 seconds
    setInterval(fetchRideRequests, 5000);
});
