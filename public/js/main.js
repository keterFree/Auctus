// Select DOM elements
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");
const logOutElement = document.getElementById("log-out");

// Toggle navigation menu
menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.className = isOpen ? "ri-close-line" : "ri-menu-line";
});

// Close navigation links on click
navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.className = "ri-menu-line";
});

// Scroll reveal options
const scrollRevealOption = {
    distance: "50px",
    origin: "bottom",
    duration: 1000,
};

// Log out functionality
logOutElement.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
});

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

// Handle log icon click
document.getElementById('log-icon').addEventListener('click', () => {
    fetchUserInfo().then(data => {
        if (data.status === 'success') {
            logOutElement.classList.toggle('log-out');
        } else {
            window.location.href = '/login';
        }
    });
});

// Check for valid session
function validSession() {
    fetchUserInfo().then(data => {
        if (data.status === 'success') {
            document.getElementById('log-name').innerText = data.user.username;
        } else {
            localStorage.clear();
            if (
                (window.location.pathname !== '/index.html' && window.location.pathname !== '/') &&
                (window.location.pathname !== '/explore.html' && window.location.pathname !== '/explore')
            ) {
                window.location.href = '/login';
                // alert(`You must log `);
            }
        }
    }).catch(error => {
        console.error('Error fetching user info:', error);
        alert("Oops, It's not you, it's us");
    });
}

// Ensure valid session on page load
document.addEventListener('DOMContentLoaded', () => validSession());


// Function to fetch the top three auctions by deadline, excluding past deadlines
async function fetchTopThreeAuctions() {
    try {
        const response = await fetch('/api/auctions');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
            const auctions = data.auctions;
            const now = new Date();

            // Filter out auctions with past deadlines
            const upcomingAuctions = auctions.filter(auction => new Date(auction.bidEndTime) > now);

            // Sort auctions by bidEndTime
            upcomingAuctions.sort((a, b) => new Date(a.bidEndTime) - new Date(b.bidEndTime));

            // Get top 3 auctions
            return upcomingAuctions.slice(0, 3);
        } else {
            throw new Error('Failed to fetch auctions');
        }
    } catch (error) {
        console.error('Error fetching top three auctions:', error);
        return [];
    }
}

// Function to populate the craft__image divs with auction content
async function populateTopThreeAuctions() {
    const topAuctions = await fetchTopThreeAuctions();

    // Hide all craft__image divs initially
    document.querySelectorAll('.craft__image').forEach(div => {
        div.classList.add('disappear');
    });

    topAuctions.forEach((auction, index) => {
        const craftImageDiv = document.getElementById(`craft-image-${index + 1}`);
        if (craftImageDiv) {
            const imgElement = craftImageDiv.querySelector('img');
            const pElement = craftImageDiv.querySelector('p');
            const h4Element = craftImageDiv.querySelector('h4');
            const aElement = craftImageDiv.querySelector('a');

            imgElement.src = normalizePath(auction.picture);
            imgElement.alt = auction.itemName;
            pElement.innerText = auction.itemName;
            h4Element.innerText = `$${auction.startingBid.toFixed(2)}`;
            //aElement.href = `/bid/${auction._id}`; // Assuming you have a bid page with auction ID

            // Set auction ID on craftImageDiv for event listener
            craftImageDiv.dataset.id = auction._id;

            // Display the craftImageDiv
            craftImageDiv.classList.remove('disappear');
        }
    });

    // Add event listeners to the craft__image divs
    document.querySelectorAll('.craft__image').forEach(div => {
        div.addEventListener('click', () => {
            const auctionId = div.dataset.id;
            localStorage.setItem('currentBid', auctionId);
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
    });
}

// Ensure valid session on page load
document.addEventListener('DOMContentLoaded', () => {
    validSession();
    populateTopThreeAuctions();
});

// Utility function to normalize path
function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/^public\/?/, '');
}

// Other existing code...

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

// Check for valid session
function validSession() {
    fetchUserInfo().then(data => {
        if (data.status === 'success') {
            document.getElementById('log-name').innerText = data.user.username;
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
}
