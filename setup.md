### Real-Time Auction System with Express, Node, MongoDB (Backend) and HTML, CSS, JS (Frontend)

#### Backend Setup

1. **Install Dependencies**
```bash
npm init -y
npm install express mongoose body-parser ws
```

2. **Backend Code**

**server.js**
```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Auction = require('./models/auction');
const Bid = require('./models/bid');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/auction', { useNewUrlParser: true, useUnifiedTopology: true });

// User registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    await user.save();
    res.json({ status: 'success' });
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ status: 'success', userId: user._id });
    } else {
        res.json({ status: 'failure', message: 'Invalid credentials' });
    }
});

// Add auction item endpoint
app.post('/add_item', async (req, res) => {
    const { item_name, starting_price, start_time, end_time } = req.body;
    const auction = new Auction({ item_name, starting_price, current_price: starting_price, start_time, end_time });
    await auction.save();
    res.json({ status: 'success' });
});

// Place bid endpoint
app.post('/bid', async (req, res) => {
    const { item_id, user_id, bid_amount } = req.body;
    const auction = await Auction.findById(item_id);
    if (auction && bid_amount > auction.current_price) {
        auction.current_price = bid_amount;
        const bid = new Bid({ auction_id: item_id, user_id, bid_amount, bid_time: new Date() });
        await bid.save();
        await auction.save();
        broadcast({ type: 'update_bids', item_id, bids: await Bid.find({ auction_id: item_id }) });
        res.json({ status: 'success' });
    } else {
        res.json({ status: 'failure', message: 'Invalid bid' });
    }
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
```

**models/auction.js**
```javascript
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    item_name: String,
    starting_price: Number,
    current_price: Number,
    start_time: Date,
    end_time: Date
});

module.exports = mongoose.model('Auction', auctionSchema);
```

**models/bid.js**
```javascript
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auction_id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId,
    bid_amount: Number,
    bid_time: Date
});

module.exports = mongoose.model('Bid', bidSchema);
```

**models/user.js**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
});

module.exports = mongoose.model('User', userSchema);
```

#### Frontend Setup

1. **Create HTML, CSS, and JS files in a `public` folder**

**public/index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real-Time Auction System</title>
    <link rel="stylesheet" href="styles/style.css">
</head>
<body>
    <h1>Real-Time Auction System</h1>
    <div id="login">
        <input type="text" id="username" placeholder="Username">
        <input type="password" id="password" placeholder="Password">
        <button onclick="login()">Login</button>
    </div>
    <div id="auction-section" style="display:none;">
        <div id="auction-items"></div>
        <input type="text" id="item-id" placeholder="Item ID">
        <input type="number" id="bid-amount" placeholder="Bid Amount">
        <button onclick="placeBid()">Place Bid</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

**public/styles/style.css**
```css
body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

h1 {
    text-align: center;
}

#auction-items div {
    margin: 10px 0;
}

input {
    margin: 5px;
}

button {
    margin: 5px;
}
```

**public/script.js**
```javascript
let ws;
let userId;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              userId = data.userId;
              document.getElementById('login').style.display = 'none';
              document.getElementById('auction-section').style.display = 'block';
              initWebSocket();
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

function placeBid() {
    const itemId = document.getElementById('item-id').value;
    const bidAmount = document.getElementById('bid-amount').value;
    fetch('/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, user_id: userId, bid_amount: bidAmount })
    }).then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              console.log('Bid placed successfully');
          } else {
              console.log('Failed to place bid');
          }
      });
}

function updateBids(itemId, bids) {
    const auctionItemsDiv = document.getElementById('auction-items');
    auctionItemsDiv.innerHTML = '';
    bids.forEach(bid => {
        const bidDiv = document.createElement('div');
        bidDiv.innerText = `Item ID: ${itemId}, User ID: ${bid.user_id}, Bid Amount: ${bid.bid_amount}, Bid Time: ${new Date(bid.bid_time).toLocaleString()}`;
        auctionItemsDiv.appendChild(bidDiv);
    });
}
```

### Running the System

1. **Start MongoDB**
   ```bash
   mongod --dbpath /path/to/your/mongodb/data
   ```

2. **Start the Express Server**
   ```bash
   node server.js
   ```

3. **Open the Frontend in a Browser**
   Navigate to `http://localhost:3000` in your browser.

This setup provides a basic real-time auction system with user registration, login, and real-time bidding using WebSockets. The backend uses Node.js, Express, and MongoDB, while the frontend is implemented with plain HTML, CSS, and JavaScript.