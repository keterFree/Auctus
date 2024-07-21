document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/auctions');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
            fetchUserInfo().then(userData => {
                if (userData.status === 'success') {
                    let filterAuctions = false;
                    const filterBtn = document.getElementById('filter-btn');

                    // Toggle filter button
                    filterBtn.addEventListener('click', () => {
                        filterAuctions = !filterAuctions;
                        let auctions;
                        if (filterAuctions) {
                            filterBtn.innerText = 'View all products';
                            auctions = data.auctions.filter(auction => auction.owner._id === UID);
                        } else {
                            filterBtn.innerText = 'View my products';
                            auctions = data.auctions;
                        }
                        displayAuctions(UID, auctions);
                    });

                    const UID = userData.user._id;
                    const initialAuctions = data.auctions;
                    displayAuctions(UID, initialAuctions);
                } else {
                    localStorage.clear();
                    if (
                        (window.location.pathname !== '/index.html' && window.location.pathname !== '/') 
                    ) {
                        window.location.href = '/login';
                    }
                }
            }).catch(error => {
                console.error('Error fetching user info:', error);
                alert("Oops, It's not you, it's us");
            });
        } else {
            alert(`Failed to fetch auctions: ${data.message}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/^public\/?/, '');
}

const input = 'public\\uploads\\img.png';
const output = normalizePath(input);
console.log(output); // Output: "uploads/img.png"

function displayAuctions(UID, auctions) {
    const auctionsContainer = document.getElementById('auctions-container');
    auctionsContainer.innerHTML = '';

    // Sort auctions by bidEndTime
    auctions.sort((a, b) => {
        const now = new Date().getTime();
        const aTime = new Date(a.bidEndTime).getTime();
        const bTime = new Date(b.bidEndTime).getTime();

        if (aTime < now && bTime < now) {
            return bTime - aTime; // Both past, sort by end time descending
        } else if (aTime < now) {
            return 1; // a is past, b is future
        } else if (bTime < now) {
            return -1; // a is future, b is past
        } else {
            return aTime - bTime; // Both future, sort by end time ascending
        }
    });

    auctions.forEach(auction => {
        const auctionElement = document.createElement('div');
        auctionElement.className = 'auction-item';
        auctionElement.dataset.id = auction._id;
        auctionElement.dataset.bidEndTime = auction.bidEndTime;
        auctionElement.dataset.picture = auction.picture;
        auctionElement.dataset.itemName = auction.itemName;
        auctionElement.dataset.description = auction.description;
        auctionElement.dataset.startingBid = auction.startingBid;

        // Placeholder content
        auctionElement.innerHTML = `
            <div class='loading-placeholder'>Loading...</div>
        `;

        auctionsContainer.appendChild(auctionElement);

        // Observe the auction element
        observer.observe(auctionElement);
    });
}

// Intersection Observer callback
function loadAuctionContent(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const auctionElement = entry.target;
            const bidEndTime = new Date(auctionElement.dataset.bidEndTime);
            auctionElement.innerHTML = `
                ${auctionElement.dataset.picture ? `<img src="${normalizePath(auctionElement.dataset.picture)}" alt="${normalizePath(auctionElement.dataset.picture)}" />` : ''}
                <div class='item-info'>
                    <div>
                        <h4>${auctionElement.dataset.itemName}</h4>
                        <p class='describe'>${auctionElement.dataset.description}</p>
                    </div>
                    <div>
                        <p>Starting Bid: ${auctionElement.dataset.startingBid}</p>
                        <p class='dead-time' id='deadline-${auctionElement.dataset.id}'>Loading...</p>
                        <p>End Time: ${bidEndTime.toLocaleString()}</p>
                    </div>
                </div>          
            `;

            // Add event listener to auctionElement
            auctionElement.addEventListener('click', () => {
                localStorage.setItem('currentBid', auctionElement.dataset.id);
                fetchUserInfo().then(data => {
                    if (data.status === 'success') {
                        window.location.href = 'bid.html';
                    } else {
                        window.location.href = 'login.html';
                        alert("Log in to gain access");
                    }
                }).catch(error => {
                    console.error('Error fetching user info:', error);
                    alert("Oops, It's not you, it's us");
                });
            });

            // Update the remaining time dynamically
            updateRemainingTime(auctionElement.dataset.id, bidEndTime);
            setInterval(() => updateRemainingTime(auctionElement.dataset.id, bidEndTime), 1000);

            // Stop observing the element since it has been loaded
            observer.unobserve(auctionElement);
        }
    });
}

// Create the Intersection Observer
const observer = new IntersectionObserver(loadAuctionContent, {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
});

function updateRemainingTime(id, bidEndTime) {
    const deadlineElement = document.getElementById(`deadline-${id}`);
    if (deadlineElement != null) {
        const now = new Date().getTime();
        const timeRemaining = bidEndTime.getTime() - now;
        const timeRemainingText = timeRemaining > 0 ? `Closes in: ${formatTimeRemaining(timeRemaining)}` : 'Auction closed';
        deadlineElement.textContent = timeRemainingText;
    }
}

function formatTimeRemaining(time) {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    const formatUnit = (unit) => unit < 10 ? `0${unit}` : unit;

    let formattedTime = '';

    if (days > 0) {
        formattedTime += `${days}d `;
    }

    formattedTime += `${formatUnit(hours)}:${formatUnit(minutes)}:${formatUnit(seconds)}`;

    return formattedTime;
}

// Fetch user info function
async function fetchUserInfo() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user info:', error);
            return { status: 'failure' };
        }
    }
    return { status: 'failure' };
}
