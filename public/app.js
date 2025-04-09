async function fetchData() {
    try {
        // Fetch data from your backend API endpoint
        const response = await fetch('/api/data'); // Request to your Express server

        if (!response.ok) {
            // Handle HTTP errors (like 500 Internal Server Error from the backend)
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if data or a message was received
        if (data.message) {
            console.log(data.message);
             document.getElementById("co2").textContent = 'N/A';
             document.getElementById("no2").textContent = 'N/A';
             document.getElementById("pm25").textContent = 'N/A';
             document.getElementById("pm10").textContent = 'N/A';
        } else if (data.co2 !== undefined) { // Check if actual data fields exist
            // Update the HTML elements with data received from the backend
            document.getElementById("co2").textContent = data.co2;
            document.getElementById("no2").textContent = data.no2;
            document.getElementById("pm25").textContent = data.pm25;
            document.getElementById("pm10").textContent = data.pm10;
        } else {
             console.warn("Received unexpected data format:", data);
        }

    } catch (error) {
        console.error("Error fetching data from backend API:", error);
        // Display error to the user
        document.getElementById("co2").textContent = 'Error';
        document.getElementById("no2").textContent = 'Error';
        document.getElementById("pm25").textContent = 'Error';
        document.getElementById("pm10").textContent = 'Error';
    }
}

// Fetch data immediately and then every 5 seconds
fetchData();
setInterval(fetchData, 5000); // Increased interval slightly