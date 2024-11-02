function bookCab() {
    const userName = document.getElementById("user_name").value;
    const userPhone = document.getElementById("user_phone").value;
    const pickup = document.getElementById("pickup").value;
    const dropoff = document.getElementById("dropoff").value;
    const description = document.getElementById("description").value;
    const resultDiv = document.getElementById("result");

    if (!userName || !userPhone || !pickup || !dropoff || !description) {
        resultDiv.innerHTML = "Please fill all fields.";
        resultDiv.style.color = "red";
        return;
    }

    fetch('/book_cab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, dropoff, user_name: userName, user_phone: userPhone, description })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.innerHTML = data.message + " Waiting for driver acceptance...";
            resultDiv.style.color = "blue";
            waitForDriverConfirmation(data.ride_id);
        } else {
            resultDiv.innerHTML = "Failed to send request.";
            resultDiv.style.color = "red";
        }
    });
}

function waitForDriverConfirmation(rideId) {
    const resultDiv = document.getElementById("result");
    const interval = setInterval(() => {
        fetch('/get_ride_requests')
        .then(response => response.json())
        .then(rideRequests => {
            const ride = rideRequests.find(r => r.id === rideId);
            if (ride && ride.status === "accepted") {
                resultDiv.innerHTML = `Ride accepted by ${ride.driver_name}. Description: ${ride.description}`;
                resultDiv.style.color = "green";
                clearInterval(interval);
                window.location.href = `/chat/${rideId}`; // Redirect to chat page
            }
        });
    }, 2000);
}
