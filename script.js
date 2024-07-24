let hourlyProfit = 0;
let userScore = 0;
let level = 1;
let maxClicks = 500;
let currentClicks = 0;
let soundPlayed = false; // Flag to track if sound has been played
let spinChances = localStorage.getItem('spinChances') ? JSON.parse(localStorage.getItem('spinChances')) : { chances: 3, lastSpin: Date.now() };

const userId = localStorage.getItem('userId') || Math.random().toString(36).substring(2);
localStorage.setItem('userId', userId);

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

document.getElementById('dragonEgg').addEventListener('click', handleClick);
document.getElementById('dragonEgg').addEventListener('touchstart', handleClick);

function handleMultipleClicks(event) {
    // Handle multiple clicks simultaneously
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();

    const clickX = event.clientX - containerRect.left;
    const clickY = event.clientY - containerRect.top;

    showClickFeedback(clickX, clickY);
    incrementScore();
    applyShakeAnimation();
    playClickSound();
}

function applyShakeAnimation() {
    const dragonEgg = document.getElementById('dragonEgg');
    dragonEgg.classList.add('shake');
    setTimeout(() => {
        dragonEgg.classList.remove('shake');
    }, 500);
}

function playClickSound() {
    const clickSound = new Audio('mixkit-arrow-whoosh-1491.wav');
    clickSound.play();
}

function showClickFeedback(x, y) {
    const container = document.querySelector('.container');
    const clickFeedback = document.createElement('div');
    clickFeedback.className = 'click-feedback';
    clickFeedback.innerText = '+1';
    clickFeedback.style.left = `${x}px`;
    clickFeedback.style.top = `${y}px`;
    container.appendChild(clickFeedback);

    setTimeout(() => {
        clickFeedback.remove();
    }, 2000);
}

function saveUsername(username) {
    // Send username to server
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "save_username.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Username saved!");
        }
    };
    xhr.send("username=" + username);
}

document.addEventListener('DOMContentLoaded', () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = prompt("Please enter your username:");
        if (userId) {
            localStorage.setItem('userId', userId);
            saveUsername(userId); // Save username to database
        } else {
            alert("Username not entered. Please reload the page and enter your username.");
            return;
        }
    }

    // Remaining code using userId
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "load_score.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            score = response.score || 0;
            level = response.level || 1;
            document.getElementById('score').innerText = score;
            document.getElementById('level').innerText = level;
            updateDragonEgg();
            if (level === 1) startParticles();
        }
    };
    xhr.send("userId=" + userId);

    // Tab functionality
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('current'));
            tab.classList.add('current');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('current');
            });

            const activeTab = tab.getAttribute('data-tab');
            document.getElementById(activeTab).classList.add('current');
        });
    });

    // Load particles
    tsParticles.load("tsparticles", {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    area: 800
                }
            },
            color: {
                value: ["#BD10E0", "#B8E986", "#50E3C2", "#FFD300", "#E86363"]
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#b6b2b2"
                }
            },
            opacity: {
                value: 0.5211089197812949,
                random: false,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            size: {
                value: 8.017060304327615,
                random: true,
                animation: {
                    enable: true,
                    speed: 12.181158184520175,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            lineLinked: {
                enable: false,
                distance: 150,
                color: "#c8c8c8",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: false,
                straight: false,
                outMode: "bounce",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detectOn: "canvas",
            events: {
                onHover: {
                    enable: true,
                    mode: "connect"
                },
                onClick: {
                    enable: false,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 400,
                    lineLinked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                connect: {},
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        detectRetina: true
    });

    updateSpinChances();
});

// Time limited for 4 hours in a day
function updateSpinChances() {
    const now = Date.now();
    const elapsedTime = now - spinChances.lastSpin;

    if (elapsedTime >= 4 * 60 * 60 * 1000) {
        spinChances.chances = 3;
        spinChances.lastSpin = now;
        localStorage.setItem('spinChances', JSON.stringify(spinChances));
    }

    document.getElementById('spin-chances').innerText = spinChances.chances;
    spinBtn.disabled = spinChances.chances === 0;

    // Update progress bar and timer
    if (spinChances.chances < 3) {
        const remainingTime = 4 * 60 * 60 * 1000 - elapsedTime;
        updateProgressBarAndTimer(remainingTime);
    } else {
        document.getElementById('spin-progress').value = 100;
        document.getElementById('spin-timer').innerText = "00:00:00";
    }
}

function updateProgressBar() {
    const progressPercentage = (currentClicks / maxClicks) * 100;
    document.getElementById('progress-inner').style.width = `${progressPercentage}%`;
    document.getElementById('clicks-text').innerText = `${currentClicks}/${maxClicks}`;
}

function updateProgressBarAndTimer(remainingTime) {
    const totalTime = 4 * 60 * 60 * 1000;
    const progress = ((totalTime - remainingTime) / totalTime) * 100;
    document.getElementById('spin-progress').value = progress;

    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    document.getElementById('spin-timer').innerText =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


setInterval(() => {
    const now = Date.now();
    const elapsedTime = now - spinChances.lastSpin;

    if (spinChances.chances < 3) {
        const remainingTime = 4 * 60 * 60 * 1000 - elapsedTime;
        if (remainingTime > 0) {
            updateProgressBarAndTimer(remainingTime);
        } else {
            spinChances.chances = 3;
            spinChances.lastSpin = now;
            localStorage.setItem('spinChances', JSON.stringify(spinChances));
            updateSpinChances();
        }
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    updateSpinChances();
});

spinBtn.addEventListener('click', () => {
    if (spinChances.chances > 0) {
        spinChances.chances -= 1;
        localStorage.setItem('spinChances', JSON.stringify(spinChances));
        updateSpinChances();

        spinBtn.disabled = true;
        finalValue.innerHTML = `<p>Good Luck!</p>`;
        let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
        let rotationInterval = window.setInterval(() => {
            myChart.options.rotation = myChart.options.rotation + resultValue;
            myChart.update();
            if (myChart.options.rotation >= 360) {
                count += 1;
                resultValue -= 5;
                myChart.options.rotation = 0;
            } else if (count > 15 && myChart.options.rotation == randomDegree) {
                valueGenerator(randomDegree);
                clearInterval(rotationInterval);
                count = 0;
                resultValue = 101;
                updateSpinChances();
            }
        }, 10);
    } else {
        alert('You do not have any spins left. Please try again later.');
    }
});

function handleClick(event) {
    event.preventDefault(); // Prevent default browser behavior for touch events

    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    let clickX, clickY;
    
    if (event.type === 'touchstart') {
        clickX = event.touches[0].clientX - containerRect.left;
        clickY = event.touches[0].clientY - containerRect.top;
    } else {
        clickX = event.clientX - containerRect.left;
        clickY = event.clientY - containerRect.top;
    }

    showClickFeedback(clickX, clickY);

    if (currentClicks < maxClicks) {
        currentClicks++; 
        let scoreToAdd = calculateScoreIncrement();
        incrementScore(scoreToAdd); 
        updateProgressBar();

        if (!soundPlayed) {
            const clickSound = new Audio('mixkit-arrow-whoosh-1491.wav');
            clickSound.play();
            soundPlayed = true;
        }

        const dragonEgg = document.getElementById('dragonEgg');
        dragonEgg.classList.add('shake');
        setTimeout(() => {
            dragonEgg.classList.remove('shake');
        }, 500);

        event.target.classList.add('hovered');
        setTimeout(() => {
            event.target.classList.remove('hovered');
        }, 100);
    } else {
        alert('You have reached the maximum number of clicks!');
    }
}

// Update Score On Server
function updateScoreOnServer(username, score) {
    fetch('/update-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, score: score }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Handle successful response if needed
        console.log('Score updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating score:', error);
    });
}

function incrementScore(points = 1) {
    userScore += points;
    document.getElementById('score').innerText = userScore;
    updateDragonEgg();
    saveScore();
}

function saveScore() {
    const username = localStorage.getItem('username');
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "save_score.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Score saved!");
        }
    };
    xhr.send("username=" + username + "&score=" + userScore + "&level=" + level);
}

function calculateScoreIncrement() {
    if (userScore >= 500) {
        return 3;
    } else if (userScore >= 200) {
        return 2;
    } else {
        return 1;
    }
}

function updateDragonEgg() {
    if (userScore >= 100 && userScore < 500) {
        level = 2;
        document.getElementById('dragonEgg').src = 'images/level2.png';
    } else if (userScore >= 500) {
        level = 3;
        document.getElementById('dragonEgg').src = 'images/level3.png';
    } else {
        level = 1;
        document.getElementById('dragonEgg').src = 'images/level1.png';
    }
    document.getElementById('level').innerText = level;
}

// Load the last earn time from localStorage or set it to a past date if it doesn't exist
let lastEarnTime = localStorage.getItem('lastEarnTime') ? new Date(JSON.parse(localStorage.getItem('lastEarnTime'))) : new Date(0);

function canEarnCoins(lastEarnTimeKey) {
    const now = new Date();
    let lastEarnTime = localStorage.getItem(lastEarnTimeKey) ? new Date(JSON.parse(localStorage.getItem(lastEarnTimeKey))) : new Date(0);
    const elapsedTime = now - lastEarnTime;
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return elapsedTime >= oneDay;
}

function earnCoins(coins, platform, lastEarnTimeKey) {
    if (canEarnCoins(lastEarnTimeKey)) {
        incrementScore(coins);
        alert(`You received ${coins} points for joining ${platform}!`);
        const now = new Date();
        localStorage.setItem(lastEarnTimeKey, JSON.stringify(now));
        disableEarnButton(lastEarnTimeKey, platform);
    } else {
        alert(`You can only earn membership points for ${platform} once every 24 hours. Please try again later.`);
    }
}

function disableEarnButton(lastEarnTimeKey, platform) {
    if (!canEarnCoins(lastEarnTimeKey)) {
        const buttonId = `${platform.toLowerCase()}-btn`;
        const button = document.getElementById(buttonId);
        button.style.pointerEvents = 'none';
        button.style.color = 'grey';

        const now = new Date();
        let lastEarnTime = new Date(JSON.parse(localStorage.getItem(lastEarnTimeKey)));
        const remainingTime = 24 * 60 * 60 * 1000 - (now - lastEarnTime);

        updateEarnTimer(remainingTime, buttonId);

        setTimeout(() => {
            enableEarnButton(buttonId);
        }, remainingTime);
    }
}

function enableEarnButton(buttonId) {
    const button = document.getElementById(buttonId);
    button.style.pointerEvents = 'auto';
    button.style.color = 'initial';
}

function updateEarnTimer(remainingTime, buttonId) {
    const timerElement = document.getElementById('earn-timer');
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    timerElement.innerText =
        `Time remaining to earn points for the ${buttonId.split('-')[0]} button: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingTime > 0) {
        setTimeout(() => {
            updateEarnTimer(remainingTime - 1000, buttonId);
        }, 1000);
    } else {
        timerElement.innerText = '';
        enableEarnButton(buttonId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const platforms = ['telegram', 'instagram', 'youtube'];
    platforms.forEach(platform => {
        const lastEarnTimeKey = `${platform}-last-earn-time`;
        disableEarnButton(lastEarnTimeKey, platform);
    });
});

function applyReferral() {
    const referralCode = document.getElementById('referralCode').value;
    if (referralCode) {
        incrementScore(50); // Assuming 50 points for using a referral code
        alert(`Referral code successfully applied and you received 50 points!`);
    } else {
        alert('Please enter a valid referral code.');
    }
}


// Object that stores the minimum and maximum angle ranges for each value
const rotationValues = [
    { minDegree: 0, maxDegree: 30, value: 200 },
    { minDegree: 31, maxDegree: 90, value: 100 },
    { minDegree: 91, maxDegree: 150, value: 600 },
    { minDegree: 151, maxDegree: 210, value: 500 },
    { minDegree: 211, maxDegree: 270, value: 400 },
    { minDegree: 271, maxDegree: 330, value: 300 },
    { minDegree: 331, maxDegree: 360, value: 200 },
];

// Size of each slice in the pie chart
const data = [16, 16, 16, 16, 16, 16];

// Background color for each slice
const pieColors = [
    "#8b35bc",
    "#b163da",
    "#8b35bc",
    "#b163da",
    "#8b35bc",
    "#b163da",
];

// Create the pie chart
let myChart = new Chart(wheel, {
    // Plugin for displaying text on the pie chart
    plugins: [ChartDataLabels],
    // Chart type: Pie
    type: "pie",
    data: {
        // Labels (values displayed on the chart)
        labels: [100, 200, 300, 400, 500, 600],
        // Dataset settings
        datasets: [
            {
                backgroundColor: pieColors,
                data: data,
            },
        ],
    },
    options: {
        // Make the chart responsive
        responsive: true,
        animation: { duration: 0 },
        plugins: {
            // Hide tooltips and legend
            tooltip: false,
            legend: {
                display: false,
            },
            // Display labels inside the pie chart
            datalabels: {
                color: "#ffffff",
                formatter: (_, context) => context.chart.data.labels[context.dataIndex],
                font: { size: 24 },
            },
        },
    },
});

// Display value based on the random angle
const valueGenerator = (angleValue) => {
    for (let item of rotationValues) {
        if (angleValue >= item.minDegree && angleValue <= item.maxDegree) {
            finalValue.innerHTML = `<p>Value: ${item.value}</p>`;
            incrementScore(item.value);
            spinBtn.disabled = false;
            break;
        }
    }
};

// Spinner count
let count = 0;
// Initial rotation speed and adjustment for animation
let resultValue = 101;

// Start spinning when the button is clicked
spinBtn.addEventListener("click", () => {
    spinBtn.disabled = true;
    // Display message while spinning
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    // Generate random degree to stop at
    let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
    // Interval for rotation animation
    let rotationInterval = window.setInterval(() => {
        // Set rotation for the pie chart
        /*
        Initially, to make the pie chart rotate faster, we set resultValue to 101 degrees and decrease it by 5 with each count. On the last rotation, we rotate by 1 degree at a time.
        */
        myChart.options.rotation = myChart.options.rotation + resultValue;
        // Update chart with the new value
        myChart.update();
        // If rotation exceeds 360 degrees, reset it back to 0
        if (myChart.options.rotation >= 360) {
            count += 1;
            resultValue -= 5;
            myChart.options.rotation = 0;
        } else if (count > 15 && myChart.options.rotation == randomDegree) {
            valueGenerator(randomDegree);
            clearInterval(rotationInterval);
            count = 0;
            resultValue = 101;
        }
    }, 10);
});

// Initialize the game with user data
function initializeGame(username) {
    fetch('load_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=' + username,
    })
    .then(response => response.json())
    .then(data => {
        score = data.score || 0;
        level = data.level || 1;
        document.getElementById('score').innerText = score;
        document.getElementById('level').innerText = level;
        updateDragonEgg();
    })
    .catch(error => {
        console.error('Error loading data: ', error);
        // Handle error
    });
}

// On DOMContentLoaded, manage user login and game initialization
document.addEventListener('DOMContentLoaded', () => {
    let username = localStorage.getItem('username');
    if (!username) {
        document.getElementById('username-form').style.display = 'block';
        document.getElementById('username-submit').addEventListener('click', () => {
            username = document.getElementById('username').value;
            if (username) {
                localStorage.setItem('username', username);
                saveUsername(username); // Call function to save username on server
                initializeGame(username); // Call function to load score and level from server
                document.getElementById('username-form').style.display = 'none';
                document.getElementById('game-container').style.display = 'block';
            } else {
                alert("Please enter your username.");
            }
        });
    } else {
        initializeGame(username); // Call function to load score and level from server
    }
});

// Function to buy a card
function buyCard(cardId, profit, cost) {
    if (score >= cost) {
        score -= cost;
        document.getElementById('score').innerText = score;
        hourlyProfit += profit;
        document.getElementById('hourly-profit').innerText = hourlyProfit;
        alert(`Card ${cardId} purchased! Your hourly profit: ${profit} points`);
    } else {
        alert('Not enough coins to purchase this card.');
    }
}

// Example initial level and hourly profit
document.getElementById('level').innerText = 1;
document.getElementById('hourly-profit').innerText = hourlyProfit;
