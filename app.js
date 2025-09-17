document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const alertsContainer = document.getElementById('alerts');
    const logoutBtn = document.getElementById('logoutBtn');

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        window.location.href = 'login.html';
    });

    function simulateAlert(message, type = 'warning') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        alertsContainer.prepend(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 10000);
    }

    setInterval(() => {
        const randomTemp = Math.floor(Math.random() * 100);
        if (randomTemp > 70) {
            simulateAlert(`High Temperature Alert! Current temp: ${randomTemp}°C`, 'danger');
        } else if (randomTemp > 50) {
            simulateAlert(`Temperature Warning. Current temp: ${randomTemp}°C`, 'warning');
        }
    }, 5000);

    const ctx = document.getElementById('dataChart').getContext('2d');
    const labels = [];
    const tempData = [];
    const humidityData = [];
    for (let i = 11; i >= 0; i--) {
        labels.push(`${i * 5} mins ago`);
        tempData.push(Math.floor(20 + Math.random() * 15));
        humidityData.push(Math.floor(40 + Math.random() * 30));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempData.reverse(),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3,
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData.reverse(),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Value' } }
            }
        }
    });

    const tempCtx = document.getElementById('temperatureGauge').getContext('2d');
    let currentTemp = 27;

    const tempGauge = new Chart(tempCtx, {
        type: 'doughnut',
        data: {
            labels: ['Temperature', 'Remaining'],
            datasets: [{
                data: [currentTemp, 50 - currentTemp],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(230, 230, 230, 0.3)'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            cutout: '70%',
            responsive: false,
            plugins: { legend: { display: false } }
        }
    });

    function simulateTemperature() {
        const fluctuation = (Math.random() - 0.5) * 0.5;
        currentTemp += fluctuation;
        currentTemp = Math.min(28, Math.max(26, currentTemp));

        document.getElementById('temperatureValue').innerText = `${currentTemp.toFixed(1)}°C`;
        tempGauge.data.datasets[0].data[0] = currentTemp;
        tempGauge.data.datasets[0].data[1] = 50 - currentTemp;
        tempGauge.update();
    }

    setInterval(simulateTemperature, 1000);

    function initMap() {
        const deviceLatLng = { lat: 37.7749, lng: -122.4194 };
        const map = new google.maps.Map(document.getElementById('map'), {
            center: deviceLatLng,
            zoom: 12,
        });

        const marker = new google.maps.Marker({
            position: deviceLatLng,
            map: map,
            title: 'Device Location',
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<b>Device Info</b><br>Location: San Francisco<br>Status: Active`,
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
    window.initMap = initMap;

    const container = document.getElementById('widgetContainer');
    let draggedElement = null;

    function saveLayout() {
        const widgetOrder = [...container.children].map(w => w.id);
        localStorage.setItem('dashboardLayout', JSON.stringify(widgetOrder));
    }

    function loadLayout() {
        const savedOrder = JSON.parse(localStorage.getItem('dashboardLayout'));
        if (savedOrder) {
            savedOrder.forEach(id => {
                const widget = document.getElementById(id);
                if (widget) container.appendChild(widget);
            });
        }
    }

    container.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.classList.add('dragging');
    });

    container.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        saveLayout();
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = [...container.querySelectorAll('.widget:not(.dragging)')].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;

        if (afterElement) {
            container.insertBefore(draggedElement, afterElement);
        } else {
            container.appendChild(draggedElement);
        }
    });

    loadLayout();
});
