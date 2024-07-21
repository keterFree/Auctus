let ws;
let token;

const itemForm = document.getElementById('create-auction-form');
if (itemForm !== null) {
    itemForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('itemName', document.getElementById('item-name').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('startingBid', document.getElementById('starting-bid').value);
        formData.append('bidEndTime', document.getElementById('bid-end-time').value);
        formData.append('picture', document.getElementById('picture').files[0]);

        alert(`
${document.getElementById('item-name').value}
${document.getElementById('description').value}
${document.getElementById('starting-bid').value}
${document.getElementById('bid-end-time').value}
data:
${formData.get('itemName')}
${formData.get('description')}
${formData.get('startingBid')}
${formData.get('bidEndTime')}
`);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/auctions/addAuction', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Auction created successfully');
                window.location.reload();
            } else {
                alert(`Failed to create auction: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
    }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Registration successful. Please log in.');
                window.location.href = 'login.html';
            } else {
                alert('Registration failed');
            }
        });
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                token = data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('name', username);
                window.location.href = 'index.html';
            } else {
                alert('Login failed');
            }
        });
}

function initWebSocket() {
    ws = new WebSocket('ws://localhost:3000');
    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update_bids') {
            updateBids(data.item_id, data.bids);
        }
    };
}

function updateBids(item_id, bids) {
    // Update bids in the UI
    console.log(`Update bids for item ${item_id}:`, bids);
}
