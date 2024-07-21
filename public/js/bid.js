let deadline;

document.addEventListener('DOMContentLoaded', initAuctionPage);

function initAuctionPage() {
    const auctionId = localStorage.getItem('currentBid');

    if (!auctionId) {
        alert('Select an item to review');
        return;
    }

    loadAuctionDetails(auctionId);
    loadBidsDetails(auctionId);
}

async function loadAuctionDetails(auctionId) {
    try {
        const response = await fetch(`/api/auctions/${auctionId}`);
        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message);
            return;
        }

        displayAuctionDetails(data.auction);
        initSocketIO(auctionId);
    } catch (error) {
        console.error('Error fetching auction details:', error);
        alert('Failed to fetch auction details. If you are not logged in, try logging in.');
    }
}

async function loadBidsDetails(auctionId) {
    try {
        const response = await fetch(`/api/bids/bids/${auctionId}`);
        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message);
            return;
        }

        updateBidsList(data.bids);
    } catch (error) {
        console.error('Error fetching auction details:', error);
        alert('Failed to fetch auction details. If you are not logged in, try logging in.');
    }
}

function displayAuctionDetails(auction) {
    const { itemName, description, startingBid, currentBid, bidEndTime, picture, owner } = auction;

    document.getElementById('auction-item-name').textContent = itemName;
    document.getElementById('auction-description').textContent = description;
    document.getElementById('auction-starting-bid').textContent = `Ksh. ${startingBid}`;
    document.getElementById('auction-top-bid').textContent = `Top Bid: $${currentBid}`;
    document.getElementById('auction-bid-end-time').textContent = `${new Date(bidEndTime).toLocaleDateString()} ${new Date(bidEndTime).toLocaleTimeString()}`;
    document.getElementById('auction-owner').innerHTML = `${owner.email}<br> ${owner.username}`;
    document.getElementById('auction-id').innerText = auction._id;

    if (picture) {
        document.getElementById('auction-picture').src = normalizePath(picture);
        document.getElementById('auction-picture').style.display = 'block';
    } else {
        document.getElementById('auction-picture').style.display = 'none';
    }

    document.getElementById('auction-details').classList.remove('hide');
    setupOwnerActions(owner._id, bidEndTime);
    startAuctionCountdown(bidEndTime);
    deadline = bidEndTime;
}

function updateBidsList(bids) {
    const bidsList1 = document.getElementById('bids-list-1');
    const bidsList2 = document.getElementById('bids-list-2');

    bidsList1.innerHTML = '';
    bidsList2.innerHTML = '';

    bids.sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time));

    const groupedBids = bids.reduce((acc, bid) => {
        const date = new Date(bid.bid_time).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(bid);
        return acc;
    }, {});

    function renderBidsToList(bids, listElement) {
        for (const [date, bids] of Object.entries(groupedBids)) {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date;
            listElement.appendChild(dateHeader);

            bids.forEach(bid => {
                const listItem = document.createElement('li');
                listItem.className = 'bid-card';

                listItem.innerHTML = `
            <p class="username">${bid.user_id.username}</p>
            <p class="email">${bid.user_id.email}</p>
            <p class="bid-amount">$${bid.bid_amount}</p>
            <p class="bid-time">${new Date(bid.bid_time).toLocaleTimeString()}</p>
          `;

                listElement.appendChild(listItem);
            });
        }
    }

    renderBidsToList(groupedBids, bidsList1);
    renderBidsToList(groupedBids, bidsList2);
}

function setupOwnerActions(ownerId, bidEndTime) {
    const token = localStorage.getItem('token');

    fetch('/api/users/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            const view = document.getElementById('view-bid-auction');
            if (data.status === 'success' && data.user._id === ownerId) {
                document.getElementById('delete-auction').classList.remove('hide');

                const now = new Date().getTime();
                const endTime = new Date(bidEndTime).getTime();

                if (now > endTime) {
                    view.innerText = 'Reopen Auction';
                    view.addEventListener('click', () => {
                        reopenAuction();
                    });
                } else {
                    view.innerText = 'Close Auction';
                    view.addEventListener('click', () => {
                        closeAuction();
                    });
                }
            } else {
                view.addEventListener('click', () => showBidForm());
            }
        });
}

async function closeAuction() {
    const auctionId = localStorage.getItem('currentBid');
    const token = localStorage.getItem('token');

    const confirmClose = confirm('Are you sure you want to close this auction? This action cannot be undone.');

    if (!confirmClose) {
        return;
    }

    try {
        const response = await fetch(`/api/auctions/${auctionId}/bidEndTime`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bidEndTime: new Date().toISOString() })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Auction closed successfully');
            displayAuctionDetails(data.auction);
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error closing auction:', error);
        alert('Failed to close auction');
    }
}

async function reopenAuction() {
    const auctionId = localStorage.getItem('currentBid');
    const token = localStorage.getItem('token');
    const newDeadline = prompt('Enter new deadline (YYYY-MM-DDTHH:mm:ss):');

    if (!newDeadline) {
        alert('Invalid deadline');
        return;
    }

    try {
        const response = await fetch(`/api/auctions/${auctionId}/bidEndTime`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bidEndTime: new Date(newDeadline).toISOString() })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Auction reopened successfully');
            displayAuctionDetails(data.auction);
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error reopening auction:', error);
        alert('Failed to reopen auction');
    }
}

function startAuctionCountdown(endTime) {
    const remainingTimeElem = document.getElementById('auction-remaining-time');

    const updateCountdown = () => {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const remainingTime = end - now;

        if (remainingTime > 0) {
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            remainingTimeElem.textContent = `${days}d ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        } else {
            remainingTimeElem.textContent = 'Auction Closed';
            document.getElementById('bid-form').classList.add('hide');
        }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
}

function showBidForm() {
    const endTime = new Date(deadline).getTime();

    const now = new Date().getTime();

    if (now > endTime) {
        alert('The auction has ended. Bids can no longer be placed.');
    } else {
        const bidForm = document.getElementById('bid-form');
        bidForm.style.display = 'flex';
        startCountdown('countdown-timer', 20, hideBidForm);
    }
}

function hideBidForm() {
    const bidForm = document.getElementById('bid-form');
    bidForm.style.display = 'none';
    clearInterval(countdownInterval);
}

function cancelBid() {
    hideBidForm();
}

function confirmBid() {
    const bidAmount = document.getElementById('bid-amount').value;
    if (!bidAmount) {
        alert('Please enter a bid amount');
        return;
    }
    document.getElementById('confirm-bid-amount').textContent = bidAmount;
    const confirmForm = document.getElementById('confirm-form');
    confirmForm.style.display = 'flex';
    hideBidForm();
    startCountdown('confirm-countdown', 10, placeBid);
}

function cancelConfirmation() {
    const confirmForm = document.getElementById('confirm-form');
    confirmForm.style.display = 'none';
    clearInterval(countdownInterval);
}

let countdownInterval;

function startCountdown(elementId, time, callback) {
    let countdownTime = time;
    const countdownElem = document.getElementById(elementId);

    countdownElem.textContent = countdownTime;

    countdownInterval = setInterval(() => {
        countdownTime--;
        countdownElem.textContent = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            callback();
        }
    }, 1000);
}

async function placeBid() {
    clearInterval(countdownInterval);

    const itemId = localStorage.getItem('currentBid');
    const bidAmount = document.getElementById('bid-amount').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/bids/bid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ item_id: itemId, bid_amount: bidAmount })
        });

        const data = await response.json();
        if (data.status === 'success') {
            console.log('Bid placed successfully');
            updateBidSocketIO(itemId, bidAmount);
        } else {
            console.log('Bid failed:', data.message);
        }

        document.getElementById('confirm-form').style.display = 'none';
    } catch (error) {
        console.error('Error placing bid:', error);
    }
}

function updateBids(itemId, bidAmount) {
    document.getElementById('auction-top-bid').textContent = `Top Bid: $${bidAmount}`;
}

function initSocketIO(auctionId) {
    const socket = io();

    socket.emit('joinAuction', auctionId);

    socket.on('bidUpdate', (data) => {
        if (data.type === 'update_bids') {
            updateBids(data.item_id, data.bidAmount);
            updateBidsList(data.bidsList);
            document.getElementById('auction-top-bid').textContent = `Top Bid: $${data.top_bid}`;
        }
    });
}

function updateBidSocketIO(auctionId, bidAmount) {
    const socket = io();
    socket.emit('placeBid', { auctionId, bidAmount });
}

async function deleteAuction() {
    const auctionId = localStorage.getItem('currentBid');
    const token = localStorage.getItem('token');

    const confirmDelete = confirm('Are you sure you want to delete this auction? It cannot be undone.');
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/auctions/${auctionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Auction deleted successfully');
            window.location.href = '/explore';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error deleting auction:', error);
        alert('Failed to delete auction');
    }
}

function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/^public\/?/, '');
}
