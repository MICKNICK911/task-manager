// Global variables
let db, firebaseModules;
let currentUser = null;
let schedules = { female: [], male: [] };
let displaySettings = {};
let currentGender = '';
let currentUserName = '';

// DOM Elements
let welcomeScreen, scheduleScreen;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get Firebase references from window
    db = window.firebaseDb;
    firebaseModules = window.firebaseModules;
    
    // Get DOM elements
    welcomeScreen = document.getElementById('welcome-screen');
    scheduleScreen = document.getElementById('schedule-screen');
    
    // Initialize forms
    initUserForm();
    initButtons();
    
    // Load display settings and set up real-time listeners
    loadDisplaySettings();
    setupRealTimeListeners();
    
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// User form handling
function initUserForm() {
    const userForm = document.getElementById('user-form');
    const genderCards = document.querySelectorAll('.gender-card');
    
    // Add active class to gender cards
    genderCards.forEach(card => {
        const input = card.parentElement.querySelector('input[type="radio"]');
        input.addEventListener('change', function() {
            genderCards.forEach(c => c.classList.remove('active'));
            if (this.checked) {
                card.classList.add('active');
                if (this.value === 'female') {
                    card.classList.add('female');
                } else {
                    card.classList.add('male');
                }
            }
        });
    });
    
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('full-name').value.trim();
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        
        if (!fullName || !gender) {
            alert('Please enter your full name and select your gender');
            return;
        }
        
        currentUserName = fullName;
        currentGender = gender;
        
        // Check if user exists in schedule
        const userInSchedule = checkUserInSchedule(fullName, gender);
        
        if (userInSchedule) {
            showScheduleScreen();
        } else {
            const proceed = confirm(`Name "${fullName}" not found in ${gender} schedule. Would you like to view the schedule anyway?`);
            if (proceed) {
                showScheduleScreen();
            }
        }
    });
}

function checkUserInSchedule(name, gender) {
    const schedule = schedules[gender] || [];
    return schedule.some(entry => 
        entry.name1?.toLowerCase().includes(name.toLowerCase()) ||
        entry.name2?.toLowerCase().includes(name.toLowerCase())
    );
}

function showScheduleScreen() {
    welcomeScreen.style.display = 'none';
    scheduleScreen.style.display = 'block';
    
    // Update greeting
    document.getElementById('user-greeting').textContent = 
        `Welcome, ${currentUserName}!`;
    
    // Update user details
    updateUserDetails();
    
    // Load and display schedule
    renderSchedule();
    
    // Find and highlight user's duties
    findUserDuties();
    
    // Update current duty
    updateCurrentDuty();
    
    // Set up interval to update current duty every minute
    setInterval(updateCurrentDuty, 60000);
}

// Data loading
async function loadDisplaySettings() {
    try {
        const settingsRef = firebaseModules.collection(db, 'displaySettings');
        const snapshot = await firebaseModules.getDocs(settingsRef);
        
        if (!snapshot.empty) {
            const settingsDoc = snapshot.docs[0];
            displaySettings = settingsDoc.data();
        }
    } catch (error) {
        console.error('Error loading display settings:', error);
    }
}

function setupRealTimeListeners() {
    // Listen for schedule changes
    const schedulesRef = firebaseModules.collection(db, 'schedules');
    const q = firebaseModules.query(schedulesRef, firebaseModules.orderBy('timeSlot'));
    
    firebaseModules.onSnapshot(q, (snapshot) => {
        schedules = { female: [], male: [] };
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            schedules[data.gender].push(data);
        });
        
        // If schedule screen is showing, update it
        if (scheduleScreen.style.display !== 'none') {
            renderSchedule();
            findUserDuties();
            updateCurrentDuty();
            updateUpcomingDuties();
        }
    });
    
    // Listen for display settings changes
    const settingsRef = firebaseModules.collection(db, 'displaySettings');
    firebaseModules.onSnapshot(settingsRef, (snapshot) => {
        if (!snapshot.empty) {
            const settingsDoc = snapshot.docs[0];
            displaySettings = settingsDoc.data();
            
            // If schedule screen is showing, update it
            if (scheduleScreen.style.display !== 'none') {
                renderSchedule();
            }
        }
    });
}

// Schedule rendering
function renderSchedule() {
    const table = document.getElementById('schedule-table');
    const tbody = document.getElementById('schedule-body');
    const gender = currentGender;
    
    if (!schedules[gender]) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <i class="fas fa-calendar-times"></i>
                    <p>No schedule available for ${gender} washroom</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Update table headers based on display settings
    const genderSettings = displaySettings[gender] || {};
    const headers = ['Time Slot'];
    
    if (genderSettings.showNames) {
        headers.push('Names');
    }
    if (genderSettings.showCongregation) {
        headers.push('Congregation');
    }
    if (genderSettings.showNumber) {
        headers.push('Contact Numbers');
    }
    
    // Update table header
    const thead = table.querySelector('thead tr');
    thead.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    
    // Update table body
    tbody.innerHTML = '';
    schedules[gender].forEach(entry => {
        const row = document.createElement('tr');
        row.dataset.timeSlot = entry.timeSlot;
        
        // Get current time slot
        const now = new Date();
        const [startTime, endTime] = parseTimeSlot(entry.timeSlot);
        const isCurrentDuty = isTimeInSlot(now, startTime, endTime);
        
        if (isCurrentDuty) {
            row.classList.add('current-duty-row');
        }
        
        const cells = [`
            <td class="time-cell">
                <strong>${entry.timeSlot}</strong>
            </td>
        `];
        
        // Add name cell if enabled
        if (genderSettings.showNames) {
            const names = [entry.name1, entry.name2].filter(Boolean).join(' & ');
            cells.push(`<td class="name-cell">${names || '-'}</td>`);
        }
        
        // Add congregation cell if enabled
        if (genderSettings.showCongregation) {
            const congregations = [entry.congregation1, entry.congregation2].filter(Boolean).join(' / ');
            cells.push(`<td class="congregation-cell">${congregations || '-'}</td>`);
        }
        
        // Add number cell if enabled
        if (genderSettings.showNumber) {
            const numbers = [entry.number1, entry.number2].filter(Boolean).join(', ');
            cells.push(`<td class="number-cell">${numbers || '-'}</td>`);
        }
        
        row.innerHTML = cells.join('');
        tbody.appendChild(row);
    });
}

function findUserDuties() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    
    // Remove existing user duty highlights
    document.querySelectorAll('.user-duty-row').forEach(row => {
        row.classList.remove('user-duty-row');
    });
    
    // Find and highlight user's duties
    userSchedule.forEach(entry => {
        if (isUserInEntry(entry, currentUserName)) {
            const rows = document.querySelectorAll(`[data-time-slot="${entry.timeSlot}"]`);
            rows.forEach(row => {
                row.classList.add('user-duty-row');
            });
        }
    });
}

function isUserInEntry(entry, userName) {
    const name1 = entry.name1?.toLowerCase() || '';
    const name2 = entry.name2?.toLowerCase() || '';
    const searchName = userName.toLowerCase();
    
    return name1.includes(searchName) || name2.includes(searchName);
}

// Current duty calculation
function updateCurrentDuty() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    const now = new Date();
    
    let currentDuty = null;
    let nextDuty = null;
    let foundCurrent = false;
    
    // Find current and next duty
    for (const entry of userSchedule) {
        const [startTime, endTime] = parseTimeSlot(entry.timeSlot);
        
        if (isTimeInSlot(now, startTime, endTime)) {
            currentDuty = entry;
            foundCurrent = true;
        } else if (!foundCurrent && isTimeBefore(now, startTime)) {
            // This is a future slot, find the next one
            if (!nextDuty || isTimeBefore(startTime, parseTimeSlot(nextDuty.timeSlot)[0])) {
                nextDuty = entry;
            }
        }
    }
    
    // Update current duty display
    const currentDutyElement = document.getElementById('current-duty');
    
    if (currentDuty) {
        const names = [currentDuty.name1, currentDuty.name2].filter(Boolean).join(' & ');
        currentDutyElement.innerHTML = `
            <i class="fas fa-user-clock"></i>
            <span>Currently on duty: <strong>${names}</strong></span>
        `;
        currentDutyElement.style.color = 'var(--success-color)';
    } else if (nextDuty) {
        const [nextStart] = parseTimeSlot(nextDuty.timeSlot);
        const timeUntil = Math.floor((nextStart - now) / (1000 * 60)); // minutes until
        
        if (timeUntil <= 30) {
            currentDutyElement.innerHTML = `
                <i class="fas fa-hourglass-half"></i>
                <span>Next duty in ${timeUntil} minutes</span>
            `;
            currentDutyElement.style.color = 'var(--warning-color)';
        } else {
            currentDutyElement.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>No current duty. Next duty at ${formatTime(nextStart)}</span>
            `;
            currentDutyElement.style.color = 'var(--secondary-color)';
        }
    } else {
        currentDutyElement.innerHTML = `
            <i class="fas fa-calendar-check"></i>
            <span>No more duties scheduled for today</span>
        `;
        currentDutyElement.style.color = 'var(--secondary-color)';
    }
    
    // Update upcoming duties sidebar
    updateUpcomingDuties();
}

function updateUpcomingDuties() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    const now = new Date();
    const upcomingElement = document.getElementById('upcoming-duties');
    
    // Find user's upcoming duties
    const userUpcomingDuties = userSchedule
        .filter(entry => {
            const [startTime] = parseTimeSlot(entry.timeSlot);
            return isTimeBefore(now, startTime) && isUserInEntry(entry, currentUserName);
        })
        .slice(0, 3); // Show next 3 duties
    
    if (userUpcomingDuties.length === 0) {
        upcomingElement.innerHTML = `
            <div class="upcoming-duty">
                <h4>No upcoming duties</h4>
                <p>You have no more scheduled duties today</p>
            </div>
        `;
        return;
    }
    
    upcomingElement.innerHTML = userUpcomingDuties.map((entry, index) => {
        const [startTime] = parseTimeSlot(entry.timeSlot);
        const timeStr = formatTime(startTime);
        const isNext = index === 0;
        
        return `
            <div class="upcoming-duty ${isNext ? 'next' : ''}">
                <h4>${entry.timeSlot}</h4>
                <p><i class="fas fa-clock"></i> ${timeStr}</p>
                ${entry.congregation1 ? `<p><i class="fas fa-church"></i> ${entry.congregation1}</p>` : ''}
            </div>
        `;
    }).join('');
}

// User details
function updateUserDetails() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    const userDuties = userSchedule.filter(entry => isUserInEntry(entry, currentUserName));
    
    const detailsElement = document.getElementById('user-details');
    
    if (userDuties.length === 0) {
        detailsElement.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">Not in schedule</span>
            </div>
        `;
        return;
    }
    
    // Find today's duties
    const todayDuties = userDuties; // Assuming all entries are for today
    
    detailsElement.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Total Duties</span>
            <span class="detail-value">${userDuties.length}</span>
        </div>
        ${todayDuties.map((duty, index) => `
            <div class="detail-item">
                <span class="detail-label">Duty ${index + 1}</span>
                <span class="detail-value">${duty.timeSlot}</span>
            </div>
            ${duty.congregation1 ? `
            <div class="detail-item">
                <span class="detail-label">Congregation</span>
                <span class="detail-value">${duty.congregation1}</span>
            </div>
            ` : ''}
        `).join('')}
    `;
}

// Utility functions
function parseTimeSlot(timeSlot) {
    // Parse time slot like "9:30 – 10:00"
    const [startStr, endStr] = timeSlot.split('–').map(s => s.trim());
    
    const now = new Date();
    const today = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const startTime = parseTimeString(startStr, today, month, year);
    let endTime = parseTimeString(endStr, today, month, year);
    
    // Handle overnight slots (though unlikely for washroom schedule)
    if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
    }
    
    return [startTime, endTime];
}

function parseTimeString(timeStr, day, month, year) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date(year, month, day, hours, minutes || 0);
    
    // Handle 12-hour format if needed
    if (timeStr.toLowerCase().includes('pm') && hours < 12) {
        time.setHours(hours + 12);
    } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
        time.setHours(0);
    }
    
    return time;
}

function isTimeInSlot(now, startTime, endTime) {
    return now >= startTime && now <= endTime;
}

function isTimeBefore(time1, time2) {
    return time1 < time2;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    document.getElementById('current-time').textContent = timeString;
}

// Button handlers
function initButtons() {
    document.getElementById('change-user-btn').addEventListener('click', () => {
        scheduleScreen.style.display = 'none';
        welcomeScreen.style.display = 'flex';
        document.getElementById('full-name').value = currentUserName;
        document.getElementById('full-name').focus();
    });
}