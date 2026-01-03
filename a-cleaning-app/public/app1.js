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
    
    // Add mobile-specific event listeners
    initMobileFeatures();
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
        
        // Add touch feedback for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
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

function initMobileFeatures() {
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('button, .clickable');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        });
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            document.body.style.zoom = '1';
        });
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

// Schedule rendering - MOBILE FIRST CARD-BASED LAYOUT
function renderSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    const gender = currentGender;
    const genderSettings = displaySettings[gender] || {};
    
    // Clear existing content
    scheduleList.innerHTML = '';
    
    if (!schedules[gender] || schedules[gender].length === 0) {
        scheduleList.innerHTML = `
            <div class="empty-schedule">
                <i class="fas fa-calendar-times"></i>
                <h3>No Schedule Available</h3>
                <p>No schedule found for ${gender} washroom</p>
                <p class="empty-hint">Check back later or contact the administrator</p>
            </div>
        `;
        return;
    }
    
    // Create mobile-friendly schedule cards
    schedules[gender].forEach(entry => {
        const scheduleCard = createScheduleCard(entry, genderSettings);
        scheduleList.appendChild(scheduleCard);
    });
    
    // Add visual feedback for scrolling
    scheduleList.addEventListener('scroll', () => {
        const cards = scheduleList.querySelectorAll('.schedule-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight) {
                card.classList.add('in-viewport');
            } else {
                card.classList.remove('in-viewport');
            }
        });
    });
    
    // Trigger initial viewport check
    setTimeout(() => {
        const cards = scheduleList.querySelectorAll('.schedule-card');
        if (cards.length > 0) {
            cards[0].classList.add('in-viewport');
        }
    }, 100);
}

function createScheduleCard(entry, genderSettings) {
    const now = new Date();
    const [startTime, endTime] = parseTimeSlot(entry.timeSlot);
    const isCurrentDuty = isTimeInSlot(now, startTime, endTime);
    const isPastDuty = endTime < now;
    const isFutureDuty = startTime > now;
    
    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.dataset.timeSlot = entry.timeSlot;
    
    // Add status classes
    if (isCurrentDuty) {
        card.classList.add('current-duty');
    } else if (isPastDuty) {
        card.classList.add('past-duty');
    } else if (isFutureDuty) {
        card.classList.add('future-duty');
    }
    
    // Check if current user is in this entry
    const isUserInThisEntry = isUserInEntry(entry, currentUserName);
    if (isUserInThisEntry) {
        card.classList.add('user-duty');
    }
    
    // Extract data
    const names = [entry.name1, entry.name2].filter(Boolean).join(' & ') || 'Not Assigned';
    const congregations = [entry.congregation1, entry.congregation2].filter(Boolean).join(' / ');
    const numbers = [entry.number1, entry.number2].filter(Boolean).join(', ');
    const timeDisplay = formatTimeSlotForDisplay(entry.timeSlot);
    
    // Build card content
    let cardHTML = `
        <div class="card-header">
            <div class="time-display">
                <i class="fas fa-clock"></i>
                <span class="time-slot">${timeDisplay}</span>
            </div>
            <div class="card-status">
    `;
    
    // Add status badges
    if (isCurrentDuty) {
        cardHTML += `<span class="status-badge now"><i class="fas fa-user-clock"></i> NOW</span>`;
    } else if (isFutureDuty) {
        cardHTML += `<span class="status-badge upcoming">UPCOMING</span>`;
    } else {
        cardHTML += `<span class="status-badge completed">COMPLETED</span>`;
    }
    
    cardHTML += `</div></div>`;
    
    // Add user indicator if applicable
    if (isUserInThisEntry) {
        cardHTML += `<div class="user-indicator"><i class="fas fa-user"></i> YOUR DUTY</div>`;
    }
    
    // Add main content
    cardHTML += `<div class="card-content">`;
    
    // Names (always shown in mobile view)
    cardHTML += `
        <div class="info-row">
            <div class="info-label"><i class="fas fa-users"></i> On Duty</div>
            <div class="info-value name-value">${names}</div>
        </div>
    `;
    
    // Congregation (if enabled or if in current duty)
    if (genderSettings.showCongregation || isCurrentDuty || isUserInThisEntry) {
        if (congregations) {
            cardHTML += `
                <div class="info-row">
                    <div class="info-label"><i class="fas fa-church"></i> Congregation</div>
                    <div class="info-value">${congregations}</div>
                </div>
            `;
        }
    }
    
    // Contact numbers (if enabled)
    if (genderSettings.showNumber && numbers) {
        cardHTML += `
            <div class="info-row">
                <div class="info-label"><i class="fas fa-phone"></i> Contact</div>
                <div class="info-value">
                    <div class="contact-numbers">${formatPhoneNumbers(numbers)}</div>
                </div>
            </div>
        `;
    }
    
    // Add time details
    cardHTML += `
        <div class="time-details">
            <div class="time-detail">
                <i class="fas fa-play-circle"></i>
                <span>Starts: ${formatTime(startTime)}</span>
            </div>
            <div class="time-detail">
                <i class="fas fa-stop-circle"></i>
                <span>Ends: ${formatTime(endTime)}</span>
            </div>
        </div>
    `;
    
    // Add action buttons for current duty
    if (isCurrentDuty && numbers) {
        cardHTML += `
            <div class="card-actions">
                ${entry.number1 ? `<a href="tel:${cleanPhoneNumber(entry.number1)}" class="action-btn call-btn">
                    <i class="fas fa-phone"></i> Call ${entry.name1?.split(' ')[0] || 'First Person'}
                </a>` : ''}
                ${entry.number2 ? `<a href="tel:${cleanPhoneNumber(entry.number2)}" class="action-btn call-btn">
                    <i class="fas fa-phone"></i> Call ${entry.name2?.split(' ')[0] || 'Second Person'}
                </a>` : ''}
            </div>
        `;
    }
    
    cardHTML += `</div></div>`;
    
    card.innerHTML = cardHTML;
    
    // Add touch/click event for expanding details on mobile
    if (window.innerWidth <= 768) {
        const header = card.querySelector('.card-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    }
    
    return card;
}

function cleanPhoneNumber(phone) {
    return phone.replace(/[^\d+]/g, '');
}

function formatPhoneNumbers(numbers) {
    return numbers.split(',').map(num => {
        const cleaned = num.trim();
        // Format for display: add spaces for readability
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return cleaned;
    }).join('<br>');
}

function findUserDuties() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    
    // Remove existing user duty highlights
    document.querySelectorAll('.user-duty').forEach(card => {
        card.classList.remove('user-duty');
    });
    
    // Find and highlight user's duties
    userSchedule.forEach(entry => {
        if (isUserInEntry(entry, currentUserName)) {
            const cards = document.querySelectorAll(`.schedule-card[data-time-slot="${entry.timeSlot}"]`);
            cards.forEach(card => {
                card.classList.add('user-duty');
            });
        }
    });
}

function isUserInEntry(entry, userName) {
    if (!userName) return false;
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
        const names = [currentDuty.name1, currentDuty.name2].filter(Boolean).join(' & ') || 'No one assigned';
        const congregations = [currentDuty.congregation1, currentDuty.congregation2].filter(Boolean).join(' & ');
        const timeDisplay = formatTimeSlotForDisplay(currentDuty.timeSlot);
        const isUserInCurrentDuty = isUserInEntry(currentDuty, currentUserName);
        
        let currentDutyHTML = `
            <div class="current-duty-card ${isUserInCurrentDuty ? 'your-duty' : ''}">
                <div class="duty-header">
                    <div class="duty-status">
                        <i class="fas fa-user-clock"></i>
                        <span>CURRENTLY ON DUTY</span>
                    </div>
                    ${isUserInCurrentDuty ? '<div class="you-indicator">YOU</div>' : ''}
                </div>
                <div class="duty-body">
                    <div class="duty-names">${names}</div>
                    <div class="duty-time">${timeDisplay}</div>
                    ${congregations ? `<div class="duty-congregation"><i class="fas fa-church"></i> ${congregations}</div>` : ''}
                </div>
        `;
        
        // Add action buttons if numbers are available
        const numbers = [currentDuty.number1, currentDuty.number2].filter(Boolean);
        if (numbers.length > 0) {
            currentDutyHTML += `
                <div class="duty-actions">
                    ${currentDuty.number1 ? `
                    <a href="tel:${cleanPhoneNumber(currentDuty.number1)}" class="call-action">
                        <i class="fas fa-phone"></i>
                        <span>Call ${currentDuty.name1?.split(' ')[0] || ''}</span>
                    </a>` : ''}
                    ${currentDuty.number2 ? `
                    <a href="tel:${cleanPhoneNumber(currentDuty.number2)}" class="call-action">
                        <i class="fas fa-phone"></i>
                        <span>Call ${currentDuty.name2?.split(' ')[0] || ''}</span>
                    </a>` : ''}
                </div>
            `;
        }
        
        currentDutyHTML += `</div>`;
        currentDutyElement.innerHTML = currentDutyHTML;
        
    } else {
        // Check if all duties are completed for today
        const allDuties = userSchedule || [];
        const allCompleted = allDuties.length > 0 && allDuties.every(entry => {
            const [, endTime] = parseTimeSlot(entry.timeSlot);
            return endTime < now;
        });
        
        if (allCompleted) {
            currentDutyElement.innerHTML = `
                <div class="current-duty-card completed">
                    <div class="duty-header">
                        <div class="duty-status">
                            <i class="fas fa-check-circle"></i>
                            <span>ALL DUTIES COMPLETED</span>
                        </div>
                    </div>
                    <div class="duty-body">
                        <div class="duty-names">Great work today!</div>
                        <div class="duty-time">All scheduled duties are finished</div>
                    </div>
                </div>
            `;
        } else {
            currentDutyElement.innerHTML = `
                <div class="current-duty-card inactive">
                    <div class="duty-header">
                        <div class="duty-status">
                            <i class="fas fa-clock"></i>
                            <span>NO ONE ON DUTY</span>
                        </div>
                    </div>
                    <div class="duty-body">
                        <div class="duty-names">Break time</div>
                        <div class="duty-time">No duty scheduled at this time</div>
                    </div>
                </div>
            `;
        }
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
        .slice(0, 3);
    
    if (userUpcomingDuties.length === 0) {
        upcomingElement.innerHTML = `
            <div class="upcoming-empty">
                <i class="fas fa-calendar-check"></i>
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
        const names = [entry.name1, entry.name2].filter(Boolean).join(' & ');
        
        return `
            <div class="upcoming-duty-card ${isNext ? 'next-duty' : ''}">
                <div class="upcoming-header">
                    <div class="upcoming-time">${formatTimeSlotForDisplay(entry.timeSlot)}</div>
                    ${isNext ? '<div class="upcoming-badge">NEXT</div>' : ''}
                </div>
                <div class="upcoming-body">
                    <div class="upcoming-names">${names}</div>
                    <div class="upcoming-details">
                        <div class="upcoming-detail">
                            <i class="fas fa-clock"></i>
                            <span>Starts at ${timeStr}</span>
                        </div>
                        ${entry.congregation1 ? `
                        <div class="upcoming-detail">
                            <i class="fas fa-church"></i>
                            <span>${entry.congregation1}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// User details
function updateUserDetails() {
    const gender = currentGender;
    const userSchedule = schedules[gender] || [];
    const userDuties = userSchedule.filter(entry => isUserInEntry(entry, currentUserName));
    const now = new Date();
    
    const detailsElement = document.getElementById('user-details');
    
    if (userDuties.length === 0) {
        detailsElement.innerHTML = `
            <div class="user-status-card">
                <div class="status-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Not in Schedule</h4>
                </div>
                <div class="status-body">
                    <p>Your name is not found in today's schedule.</p>
                    <p class="status-hint">Contact the administrator if this is incorrect.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Categorize duties
    const currentDuty = userDuties.find(entry => {
        const [startTime, endTime] = parseTimeSlot(entry.timeSlot);
        return isTimeInSlot(now, startTime, endTime);
    });
    
    const upcomingDuties = userDuties.filter(entry => {
        const [startTime] = parseTimeSlot(entry.timeSlot);
        return startTime > now;
    });
    
    const completedDuties = userDuties.filter(entry => {
        const [, endTime] = parseTimeSlot(entry.timeSlot);
        return endTime < now;
    });
    
    detailsElement.innerHTML = `
        <div class="user-stats">
            <div class="stat-item">
                <div class="stat-value">${userDuties.length}</div>
                <div class="stat-label">Total Duties</div>
            </div>
            ${currentDuty ? `
            <div class="stat-item active">
                <div class="stat-value"><i class="fas fa-user-clock"></i></div>
                <div class="stat-label">On Duty Now</div>
            </div>` : ''}
            ${upcomingDuties.length > 0 ? `
            <div class="stat-item upcoming">
                <div class="stat-value">${upcomingDuties.length}</div>
                <div class="stat-label">Upcoming</div>
            </div>` : ''}
            ${completedDuties.length > 0 ? `
            <div class="stat-item completed">
                <div class="stat-value">${completedDuties.length}</div>
                <div class="stat-label">Completed</div>
            </div>` : ''}
        </div>
        
        ${currentDuty ? `
        <div class="current-duty-summary">
            <h4><i class="fas fa-user-clock"></i> Currently On Duty</h4>
            <div class="summary-time">${formatTimeSlotForDisplay(currentDuty.timeSlot)}</div>
            ${currentDuty.congregation1 ? `
            <div class="summary-congregation">${currentDuty.congregation1}</div>
            ` : ''}
        </div>` : ''}
        
        ${upcomingDuties.length > 0 ? `
        <div class="next-duty-summary">
            <h4><i class="fas fa-calendar-alt"></i> Next Duty</h4>
            <div class="next-duty-info">
                ${upcomingDuties[0].timeSlot ? `<div class="next-time">${formatTimeSlotForDisplay(upcomingDuties[0].timeSlot)}</div>` : ''}
                ${upcomingDuties[0].congregation1 ? `<div class="next-congregation">${upcomingDuties[0].congregation1}</div>` : ''}
            </div>
        </div>` : ''}
    `;
}

// Time parsing functions
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
    
    // Handle cases where end time might be earlier than start time
    if (endTime < startTime) {
        if (endStr.includes('PM') && !startStr.includes('PM')) {
            endTime.setHours(endTime.getHours() + 12);
        }
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
        hours = parseInt(normalized) || 0;
        minutes = 0;
    }
    
    // Convert 12-hour format to 24-hour format
    if (isAM && hours === 12) {
        hours = 0;
    } else if (isPM && hours < 12) {
        hours += 12;
    }
    
    // If no AM/PM specified, use context to determine
    if (!isAM && !isPM) {
        if (hours >= 1 && hours <= 4) {
            hours += 12;
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
    return timeSlot
        .replace(/–/g, ' – ')
        .replace(/(AM|PM)/gi, ' $1')
        .replace(/\s+/g, ' ')
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
    
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    document.getElementById('current-time').innerHTML = `
        <i class="fas fa-clock"></i>
        <div class="time-display">
            <div class="time">${timeString}</div>
            <div class="date">${dateString}</div>
        </div>
    `;
}

// Button handlers
function initButtons() {
    document.getElementById('change-user-btn').addEventListener('click', () => {
        scheduleScreen.style.display = 'none';
        welcomeScreen.style.display = 'flex';
        document.getElementById('full-name').value = currentUserName;
        
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

// Add mobile-optimized CSS
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    /* Mobile-first schedule list */
    .schedule-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 10px;
        max-height: 60vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    }
    
    /* Schedule card styles */
    .schedule-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border-left: 4px solid #ddd;
        position: relative;
        overflow: hidden;
    }
    
    .schedule-card.in-viewport {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* Card status styles */
    .schedule-card.current-duty {
        border-left-color: #4CAF50;
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.02));
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
    }
    
    .schedule-card.user-duty {
        border-left-color: #2196F3;
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.02));
    }
    
    .schedule-card.past-duty {
        opacity: 0.7;
        border-left-color: #757575;
    }
    
    .schedule-card.future-duty {
        border-left-color: #FF9800;
    }
    
    /* Card header */
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        cursor: pointer;
    }
    
    .time-display {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .time-display i {
        color: #666;
        font-size: 1.1em;
    }
    
    .time-slot {
        font-weight: 600;
        font-size: 1.1em;
        color: #333;
    }
    
    .card-status {
        display: flex;
        gap: 6px;
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-badge.now {
        background: #4CAF50;
        color: white;
        animation: pulse 2s infinite;
    }
    
    .status-badge.upcoming {
        background: #FF9800;
        color: white;
    }
    
    .status-badge.completed {
        background: #757575;
        color: white;
    }
    
    /* User indicator */
    .user-indicator {
        background: #2196F3;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.8em;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
    }
    
    /* Card content */
    .card-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .info-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .info-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
        color: #666;
        font-weight: 500;
    }
    
    .info-value {
        font-size: 1em;
        color: #333;
        font-weight: 500;
        padding-left: 20px;
    }
    
    .name-value {
        font-size: 1.1em;
        font-weight: 600;
        color: #222;
    }
    
    .contact-numbers {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    /* Time details */
    .time-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid #eee;
    }
    
    .time-detail {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
        color: #666;
    }
    
    /* Card actions */
    .card-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }
    
    .action-btn {
        padding: 10px 16px;
        border-radius: 8px;
        text-align: center;
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
    }
    
    .call-btn {
        background: #4CAF50;
        color: white;
    }
    
    .call-btn:hover, .call-btn:active {
        background: #45a049;
        transform: translateY(-1px);
    }
    
    /* Current duty display */
    .current-duty-card {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    
    .current-duty-card.your-duty {
        background: linear-gradient(135deg, #2196F3, #1976D2);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }
    
    .current-duty-card.inactive {
        background: linear-gradient(135deg, #757575, #616161);
        box-shadow: 0 4px 12px rgba(117, 117, 117, 0.3);
    }
    
    .current-duty-card.completed {
        background: linear-gradient(135deg, #009688, #00796B);
        box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
    }
    
    .duty-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .duty-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9em;
        opacity: 0.9;
        font-weight: 600;
    }
    
    .you-indicator {
        background: white;
        color: #2196F3;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: bold;
        animation: pulse 2s infinite;
    }
    
    .duty-body {
        padding: 8px 0;
    }
    
    .duty-names {
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 6px;
    }
    
    .duty-time {
        font-size: 1.1em;
        margin-bottom: 8px;
        opacity: 0.9;
    }
    
    .duty-congregation {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95em;
        opacity: 0.9;
    }
    
    .duty-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
    }
    
    .call-action {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 10px;
        border-radius: 8px;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .call-action:hover, .call-action:active {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
    }
    
    /* Upcoming duties */
    .upcoming-empty {
        text-align: center;
        padding: 20px;
        color: #666;
    }
    
    .upcoming-empty i {
        font-size: 2em;
        margin-bottom: 10px;
        color: #ddd;
    }
    
    .upcoming-duty-card {
        background: white;
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        border-left: 4px solid #FF9800;
    }
    
    .upcoming-duty-card.next-duty {
        border-left-color: #4CAF50;
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), white);
    }
    
    .upcoming-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .upcoming-time {
        font-weight: 600;
        color: #333;
    }
    
    .upcoming-badge {
        background: #4CAF50;
        color: white;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 0.75em;
        font-weight: bold;
    }
    
    .upcoming-names {
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
    }
    
    .upcoming-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .upcoming-detail {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85em;
        color: #666;
    }
    
    /* User details */
    .user-status-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
    }
    
    .status-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }
    
    .status-header i {
        font-size: 2em;
        color: #F44336;
    }
    
    .status-hint {
        font-size: 0.9em;
        color: #666;
        margin-top: 8px;
    }
    
    .user-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 10px;
        margin: 15px 0;
    }
    
    .stat-item {
        background: white;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    
    .stat-item.active {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
    }
    
    .stat-item.upcoming {
        background: linear-gradient(135deg, #FF9800, #F57C00);
        color: white;
    }
    
    .stat-item.completed {
        background: linear-gradient(135deg, #757575, #616161);
        color: white;
    }
    
    .stat-value {
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 4px;
    }
    
    .stat-label {
        font-size: 0.8em;
        opacity: 0.9;
    }
    
    .current-duty-summary, .next-duty-summary {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin: 10px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .current-duty-summary h4, .next-duty-summary h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        color: #333;
    }
    
    .summary-time, .next-time {
        font-size: 1.2em;
        font-weight: 600;
        color: #4CAF50;
        margin-bottom: 6px;
    }
    
    .summary-congregation, .next-congregation {
        color: #666;
        font-size: 0.95em;
    }
    
    /* Time display */
    .time-display-container {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    
    .time-display-container i {
        font-size: 1.4em;
        color: #4CAF50;
    }
    
    .time-display {
        display: flex;
        flex-direction: column;
    }
    
    .time {
        font-size: 1.1em;
        font-weight: 600;
        color: #333;
    }
    
    .date {
        font-size: 0.9em;
        color: #666;
    }
    
    /* Empty schedule */
    .empty-schedule {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .empty-schedule i {
        font-size: 3em;
        margin-bottom: 15px;
        color: #ddd;
    }
    
    .empty-hint {
        font-size: 0.9em;
        color: #999;
        margin-top: 10px;
    }
    
    /* Animations */
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .schedule-list {
            max-height: 50vh;
            padding: 8px;
        }
        
        .schedule-card {
            padding: 14px;
        }
        
        .time-slot {
            font-size: 1em;
        }
        
        .duty-actions {
            grid-template-columns: 1fr;
        }
        
        .user-stats {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (max-width: 480px) {
        .time-details {
            grid-template-columns: 1fr;
            gap: 6px;
        }
        
        .status-badge {
            font-size: 0.7em;
            padding: 3px 6px;
        }
        
        .duty-names {
            font-size: 1.2em;
        }
    }
`;
document.head.appendChild(mobileStyles);