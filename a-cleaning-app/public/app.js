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
    
    if (!schedules[gender] || schedules[gender].length === 0) {
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
                <strong>${formatTimeSlotForDisplay(entry.timeSlot)}</strong>
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

// Current duty calculation - IMPROVED VERSION
function updateCurrentDuty() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    const now = new Date();
    
    let currentDuty = null;
    
    // Find current duty
    for (const entry of userSchedule) {
        const [startTime, endTime] = parseTimeSlot(entry.timeSlot);
        
        if (isTimeInSlot(now, startTime, endTime)) {
            currentDuty = entry;
            break;
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
        currentDutyElement.style.backgroundColor = 'var(--current-duty-color)';
    } else {
        currentDutyElement.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>No one currently on duty</span>
        `;
        currentDutyElement.style.color = 'var(--secondary-color)';
        currentDutyElement.style.backgroundColor = '#f8f9fa';
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
            return startTime > now && isUserInEntry(entry, currentUserName);
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
                <h4>${formatTimeSlotForDisplay(entry.timeSlot)}</h4>
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
                <span class="detail-value">${formatTimeSlotForDisplay(duty.timeSlot)}</span>
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

// IMPROVED: Time parsing functions to handle multiple formats
function parseTimeSlot(timeSlot) {
    // Clean and normalize the time slot string
    const cleanTimeSlot = timeSlot.trim().toUpperCase();
    
    // Split by various possible separators
    const separators = ['–', '—', '-', ' to ', ' TO '];
    let startStr = '', endStr = '';
    
    for (const sep of separators) {
        if (cleanTimeSlot.includes(sep)) {
            const parts = cleanTimeSlot.split(sep).map(part => part.trim());
            if (parts.length === 2) {
                [startStr, endStr] = parts;
                break;
            }
        }
    }
    
    // If no separator found, return defaults
    if (!startStr || !endStr) {
        const now = new Date();
        return [now, now];
    }
    
    // Parse start and end times
    const now = new Date();
    const today = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const startTime = parseTimeString(startStr, today, month, year);
    let endTime = parseTimeString(endStr, today, month, year);
    
    // Handle cases where end time might be earlier than start time (crossing midday)
    // This can happen with formats like "11:30AM-1:00PM"
    if (endTime < startTime) {
        // Add 12 hours to handle PM times
        if (endStr.includes('PM') && !startStr.includes('PM')) {
            endTime.setHours(endTime.getHours() + 12);
        }
        // If still earlier, add a day (unlikely for our schedule but safe)
        if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }
    }
    
    return [startTime, endTime];
}

function parseTimeString(timeStr, day, month, year) {
    // Normalize the time string
    let normalized = timeStr.trim().toUpperCase();
    
    // Extract AM/PM indicator
    let isAM = false;
    let isPM = false;
    
    if (normalized.includes('AM')) {
        isAM = true;
        normalized = normalized.replace('AM', '').trim();
    } else if (normalized.includes('PM')) {
        isPM = true;
        normalized = normalized.replace('PM', '').trim();
    }
    
    // Parse hours and minutes
    let hours, minutes;
    
    if (normalized.includes(':')) {
        const [h, m] = normalized.split(':').map(Number);
        hours = h;
        minutes = m || 0;
    } else {
        // Handle formats without colon (e.g., "4AM")
        hours = parseInt(normalized) || 0;
        minutes = 0;
    }
    
    // Convert 12-hour format to 24-hour format
    if (isAM && hours === 12) {
        hours = 0; // 12 AM = 0 hours
    } else if (isPM && hours < 12) {
        hours += 12; // 1 PM = 13 hours, etc.
    }
    
    // If no AM/PM specified, use context to determine
    if (!isAM && !isPM) {
        // Morning hours (likely AM)
        if (hours >= 1 && hours <= 11) {
            // Keep as is (AM)
        }
        // Noon
        else if (hours === 12) {
            // 12 without AM/PM is usually PM
            isPM = true;
        }
        // Afternoon hours (likely PM)
        else if (hours >= 1 && hours <= 4) {
            hours += 12; // Convert to 24-hour
        }
    }
    
    // Create and return date object
    return new Date(year, month, day, hours, minutes, 0);
}

function isTimeInSlot(now, startTime, endTime) {
    return now >= startTime && now <= endTime;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatTimeSlotForDisplay(timeSlot) {
    // Clean up the time slot for display
    return timeSlot
        .replace(/–/g, ' – ')  // Add spaces around en dash
        .replace(/(AM|PM)/gi, ' $1')  // Add space before AM/PM
        .replace(/\s+/g, ' ')  // Normalize spaces
        .trim();
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
        // Pre-fill the form with current user info
        document.getElementById('full-name').value = currentUserName;
        
        // Check the appropriate gender radio button
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => {
            if (radio.value === currentGender) {
                radio.checked = true;
                const card = radio.parentElement.querySelector('.gender-card');
                card.classList.add('active');
                card.classList.add(currentGender);
            }
        });
        
        document.getElementById('full-name').focus();
    });
}

// Test function to debug time parsing
function testTimeParsing() {
    const testSlots = [
        "9:30 – 10:00",
        "10:00 – 10:30",
        "11:00 – 11:30",
        "12:00 – 12:30",
        "1:00 – 1:30",
        "2:00 – 2:30",
        "3:00 – 3:30",
        "3:30 – 4:00",
        "4:00AM-4:30AM",
        "4:00PM-4:30PM",
        "9:30AM-10:00AM",
        "1:00PM-1:30PM"
    ];
    
    console.log("Testing time parsing:");
    testSlots.forEach(slot => {
        try {
            const [start, end] = parseTimeSlot(slot);
            console.log(`${slot}: Start=${start.toLocaleTimeString()}, End=${end.toLocaleTimeString()}`);
        } catch (error) {
            console.error(`Error parsing ${slot}:`, error);
        }
    });
}

// Call test function on load for debugging
// testTimeParsing();