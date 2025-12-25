/**
 * EVENTS IN JAVASCRIPT
 * 
 * Events are actions or occurrences that happen in the browser.
 * JavaScript can react to these events through event handlers.
 * 
 * Topics covered:
 * - Event listeners and handlers
 * - Event object and properties
 * - Event propagation (bubbling and capturing)
 * - Event delegation
 * - Common event types
 * - Custom events
 * - Event best practices
 */

document.write("<h3>11. Events</h3>");

// ========== EVENT LISTENERS ==========

document.write("<strong>Event Listeners:</strong><br>");

// Create demo elements
const eventDemo = document.createElement('div');
eventDemo.id = 'event-demo';
eventDemo.innerHTML = `
    <button id="click-button">Click Me</button>
    <div id="output-area" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
    <input type="text" id="text-input" placeholder="Type something...">
    <div id="mouse-area" style="width: 200px; height: 100px; background: #e0e0e0; margin: 10px 0; padding: 10px;">
        Mouse Area
    </div>
`;
document.body.appendChild(eventDemo);

const outputArea = document.getElementById('output-area');
const clickButton = document.getElementById('click-button');
const textInput = document.getElementById('text-input');
const mouseArea = document.getElementById('mouse-area');

// 1. Adding event listeners
clickButton.addEventListener('click', function() {
    outputArea.textContent = 'Button was clicked!';
    document.write("Button click event fired<br>");
});

// 2. Multiple events on same element
clickButton.addEventListener('mouseover', function() {
    this.style.backgroundColor = '#4CAF50';
    this.style.color = 'white';
});

clickButton.addEventListener('mouseout', function() {
    this.style.backgroundColor = '';
    this.style.color = '';
});

// 3. Event object
clickButton.addEventListener('click', function(event) {
    document.write("Event type: " + event.type + "<br>");
    document.write("Event target: " + event.target.tagName + "<br>");
    document.write("Current target: " + event.currentTarget.tagName + "<br>");
    document.write("Time stamp: " + event.timeStamp + "<br>");
});

// ========== COMMON EVENT TYPES ==========

document.write("<br><strong>Common Event Types:</strong><br>");

// Keyboard events
textInput.addEventListener('keydown', function(event) {
    outputArea.textContent = `Key down: ${event.key} (Code: ${event.code})`;
});

textInput.addEventListener('keyup', function(event) {
    document.write(`Key up: ${event.key}<br>`);
});

textInput.addEventListener('keypress', function(event) {
    // Note: keypress is deprecated, but shown for completeness
    document.write(`Key press: ${event.key} (deprecated)<br>`);
});

// Input events
textInput.addEventListener('input', function(event) {
    document.write(`Input event: ${event.target.value}<br>`);
});

textInput.addEventListener('change', function(event) {
    document.write(`Change event: ${event.target.value} (when focus is lost)<br>`);
});

// Focus events
textInput.addEventListener('focus', function() {
    this.style.border = '2px solid #3498db';
    document.write("Input focused<br>");
});

textInput.addEventListener('blur', function() {
    this.style.border = '';
    document.write("Input lost focus<br>");
});

// Mouse events
mouseArea.addEventListener('mousedown', function(event) {
    outputArea.textContent = `Mouse down at (${event.clientX}, ${event.clientY})`;
    document.write(`Mouse down: button ${event.button}<br>`);
});

mouseArea.addEventListener('mouseup', function(event) {
    outputArea.textContent = `Mouse up at (${event.clientX}, ${event.clientY})`;
});

mouseArea.addEventListener('mousemove', function(event) {
    // Throttle the output to avoid too many writes
    if (Date.now() % 100 < 5) { // Only show ~10% of moves
        document.write(`Mouse move: (${event.clientX}, ${event.clientY})<br>`);
    }
});

mouseArea.addEventListener('click', function(event) {
    outputArea.textContent = `Clicked at (${event.offsetX}, ${event.offsetY})`;
    document.write(`Click: ${event.detail} click(s)<br>`);
});

mouseArea.addEventListener('dblclick', function() {
    outputArea.textContent = 'Double clicked!';
    document.write("Double click<br>");
});

mouseArea.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Prevent default context menu
    outputArea.textContent = 'Right clicked!';
    document.write("Context menu (right click)<br>");
});

// Wheel event
mouseArea.addEventListener('wheel', function(event) {
    outputArea.textContent = `Wheel delta: ${event.deltaY > 0 ? 'Down' : 'Up'}`;
    document.write(`Wheel event: deltaY = ${event.deltaY}<br>`);
});

// ========== EVENT PROPAGATION ==========

document.write("<br><strong>Event Propagation:</strong><br>");

// Create nested elements for propagation demo
const propagationDemo = document.createElement('div');
propagationDemo.id = 'propagation-demo';
propagationDemo.innerHTML = `
    <div id="outer" style="padding: 30px; background: #d0d0d0;">
        Outer Div
        <div id="middle" style="padding: 20px; background: #b0b0b0; margin: 10px;">
            Middle Div
            <div id="inner" style="padding: 10px; background: #909090; margin: 10px;">
                Inner Div (Click Me)
            </div>
        </div>
    </div>
    <div id="propagation-output" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
`;
document.body.appendChild(propagationDemo);

const outerDiv = document.getElementById('outer');
const middleDiv = document.getElementById('middle');
const innerDiv = document.getElementById('inner');
const propagationOutput = document.getElementById('propagation-output');

// Event bubbling (default)
outerDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Bubbling - Outer div clicked<br>`;
});

middleDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Bubbling - Middle div clicked<br>`;
});

innerDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Bubbling - Inner div clicked<br>`;
    // Uncomment to stop propagation:
    // event.stopPropagation();
});

// Event capturing (third parameter true)
outerDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Capturing - Outer div clicked<br>`;
}, true);

middleDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Capturing - Middle div clicked<br>`;
}, true);

innerDiv.addEventListener('click', function(event) {
    propagationOutput.innerHTML += `Capturing - Inner div clicked<br>`;
}, true);

document.write("Click the 'Inner Div' to see propagation order<br>");

// ========== EVENT DELEGATION ==========

document.write("<br><strong>Event Delegation:</strong><br>");

// Create list for delegation demo
const delegationDemo = document.createElement('div');
delegationDemo.id = 'delegation-demo';
delegationDemo.innerHTML = `
    <h4>Dynamic List (Event Delegation Demo)</h4>
    <button id="add-item">Add New Item</button>
    <ul id="dynamic-list" style="margin: 10px 0; padding: 0;">
        <li>Item 1 <button class="remove-btn">Remove</button></li>
        <li>Item 2 <button class="remove-btn">Remove</button></li>
        <li>Item 3 <button class="remove-btn">Remove</button></li>
    </ul>
    <div id="delegation-output" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
`;
document.body.appendChild(delegationDemo);

const dynamicList = document.getElementById('dynamic-list');
const addItemButton = document.getElementById('add-item');
const delegationOutput = document.getElementById('delegation-output');

let itemCounter = 3;

// Traditional approach (inefficient for dynamic content)
// Would only work for existing buttons
// document.querySelectorAll('.remove-btn').forEach(btn => {
//     btn.addEventListener('click', function() {
//         this.parentElement.remove();
//     });
// });

// Event delegation approach (efficient for dynamic content)
dynamicList.addEventListener('click', function(event) {
    // Check if the clicked element is a remove button
    if (event.target.classList.contains('remove-btn')) {
        const listItem = event.target.parentElement;
        delegationOutput.textContent = `Removed: ${listItem.firstChild.textContent}`;
        listItem.remove();
        document.write("Item removed via event delegation<br>");
    }
    
    // Also handle clicks on list items themselves
    if (event.target.tagName === 'LI') {
        event.target.classList.toggle('selected');
        delegationOutput.textContent = `Toggled: ${event.target.firstChild.textContent}`;
        document.write("List item toggled via event delegation<br>");
    }
});

// Add new items dynamically
addItemButton.addEventListener('click', function() {
    itemCounter++;
    const newItem = document.createElement('li');
    newItem.textContent = `Item ${itemCounter} `;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    
    newItem.appendChild(removeBtn);
    dynamicList.appendChild(newItem);
    
    delegationOutput.textContent = `Added: Item ${itemCounter}`;
    document.write(`Added new item ${itemCounter} (automatically has event handling)<br>`);
});

// ========== EVENT OBJECT METHODS ==========

document.write("<br><strong>Event Object Methods:</strong><br>");

// Create demo for event methods
const eventMethodsDemo = document.createElement('div');
eventMethodsDemo.id = 'event-methods-demo';
eventMethodsDemo.innerHTML = `
    <div style="padding: 20px; background: #e8f4f8; border: 2px solid #3498db;">
        <button id="prevent-default-btn">Prevent Default Action</button>
        <a href="#void" id="prevent-link">This link goes nowhere (preventDefault)</a>
        <br><br>
        <div id="stop-propagation-area" style="padding: 20px; background: #f8e8e8; border: 2px solid #e74c3c;">
            <button id="stop-propagation-btn">Stop Propagation</button>
            <div style="padding: 10px; background: #f0d0d0; margin: 10px;">
                Nested area (events bubble here)
            </div>
        </div>
    </div>
    <div id="methods-output" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
`;
document.body.appendChild(eventMethodsDemo);

const preventLink = document.getElementById('prevent-link');
const stopPropagationBtn = document.getElementById('stop-propagation-btn');
const stopPropagationArea = document.getElementById('stop-propagation-area');
const methodsOutput = document.getElementById('methods-output');

// preventDefault() example
preventLink.addEventListener('click', function(event) {
    event.preventDefault();
    methodsOutput.textContent = 'Default link behavior was prevented';
    document.write("preventDefault() prevented link navigation<br>");
});

// stopPropagation() example
stopPropagationArea.addEventListener('click', function() {
    methodsOutput.textContent = 'Stop Propagation Area clicked';
    document.write("Area click event (bubbling)<br>");
});

stopPropagationBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    methodsOutput.textContent = 'Button clicked (propagation stopped)';
    document.write("Button click with stopPropagation()<br>");
});

// stopImmediatePropagation() example
const immediatePropagationBtn = document.createElement('button');
immediatePropagationBtn.textContent = 'Test stopImmediatePropagation';
eventMethodsDemo.appendChild(immediatePropagationBtn);

immediatePropagationBtn.addEventListener('click', function(event) {
    methodsOutput.textContent = 'First handler executed';
    document.write("First event handler<br>");
    event.stopImmediatePropagation();
});

immediatePropagationBtn.addEventListener('click', function(event) {
    // This handler won't run because of stopImmediatePropagation()
    methodsOutput.textContent = 'Second handler (should not run)';
    document.write("Second event handler (should not run)<br>");
});

// ========== CUSTOM EVENTS ==========

document.write("<br><strong>Custom Events:</strong><br>");

const customEventDemo = document.createElement('div');
customEventDemo.id = 'custom-event-demo';
customEventDemo.innerHTML = `
    <button id="trigger-custom-event">Trigger Custom Event</button>
    <button id="trigger-custom-data">Trigger Custom Event with Data</button>
    <div id="custom-event-output" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
`;
document.body.appendChild(customEventDemo);

const customEventOutput = document.getElementById('custom-event-output');
const triggerCustomBtn = document.getElementById('trigger-custom-event');
const triggerCustomDataBtn = document.getElementById('trigger-custom-data');

// Create and dispatch custom events
customEventDemo.addEventListener('userLogin', function(event) {
    customEventOutput.textContent = `Custom event received: ${event.type}`;
    document.write(`Custom event received: ${event.type}<br>`);
});

customEventDemo.addEventListener('userAction', function(event) {
    customEventOutput.textContent = `User action: ${event.detail.action} at ${event.detail.timestamp}`;
    document.write(`Custom event with data: ${JSON.stringify(event.detail)}<br>`);
});

// Trigger simple custom event
triggerCustomBtn.addEventListener('click', function() {
    const event = new Event('userLogin');
    customEventDemo.dispatchEvent(event);
});

// Trigger custom event with data
triggerCustomDataBtn.addEventListener('click', function() {
    const event = new CustomEvent('userAction', {
        detail: {
            action: 'button_click',
            timestamp: new Date().toISOString(),
            userId: 12345
        },
        bubbles: true,
        cancelable: true
    });
    customEventDemo.dispatchEvent(event);
});

// ========== EVENT BINDING AND UNBINDING ==========

document.write("<br><strong>Event Binding and Unbinding:</strong><br>");

const bindingDemo = document.createElement('div');
bindingDemo.id = 'binding-demo';
bindingDemo.innerHTML = `
    <button id="bind-btn">Click to Bind/Unbind</button>
    <button id="once-btn">Once Button (fires once)</button>
    <div id="binding-output" style="margin: 10px 0; padding: 10px; background: #f0f0f0;"></div>
`;
document.body.appendChild(bindingDemo);

const bindBtn = document.getElementById('bind-btn');
const onceBtn = document.getElementById('once-btn');
const bindingOutput = document.getElementById('binding-output');

// Named function for event handling
function handleClick() {
    bindingOutput.textContent = `Button clicked at ${new Date().toLocaleTimeString()}`;
    document.write("Button clicked (named handler)<br>");
}

let isBound = false;

bindBtn.addEventListener('click', function() {
    if (!isBound) {
        // Add event listener
        bindBtn.addEventListener('click', handleClick);
        bindingOutput.textContent = 'Event handler bound';
        isBound = true;
        document.write("Event handler bound<br>");
    } else {
        // Remove event listener
        bindBtn.removeEventListener('click', handleClick);
        bindingOutput.textContent = 'Event handler unbound';
        isBound = false;
        document.write("Event handler unbound<br>");
    }
});

// Event listener with once option
onceBtn.addEventListener('click', function() {
    bindingOutput.textContent = 'This button only works once';
    document.write("Once button clicked (will only fire once)<br>");
}, { once: true });

// ========== EVENT THROTTLING AND DEBOUNCING ==========

document.write("<br><strong>Event Throttling and Debouncing:</strong><br>");

const throttleDebounceDemo = document.createElement('div');
throttleDebounceDemo.id = 'throttle-demo';
throttleDebounceDemo.innerHTML = `
    <div style="padding: 20px; background: #f0f0f0;">
        <p>Move mouse in this area:</p>
        <div id="mousemove-area" style="width: 100%; height: 100px; background: #d0d0d0; border: 1px solid #999;"></div>
        <p>Normal events: <span id="normal-count">0</span></p>
        <p>Throttled events (200ms): <span id="throttled-count">0</span></p>
        <p>Debounced events (200ms): <span id="debounced-count">0</span></p>
    </div>
`;
document.body.appendChild(throttleDebounceDemo);

const mousemoveArea = document.getElementById('mousemove-area');
const normalCount = document.getElementById('normal-count');
const throttledCount = document.getElementById('throttled-count');
const debouncedCount = document.getElementById('debounced-count');

let normalCounter = 0;
let throttledCounter = 0;
let debouncedCounter = 0;

// Normal mousemove (fires many times)
mousemoveArea.addEventListener('mousemove', function() {
    normalCounter++;
    normalCount.textContent = normalCounter;
});

// Throttled mousemove (fires at most once every 200ms)
let lastThrottledCall = 0;
mousemoveArea.addEventListener('mousemove', function() {
    const now = Date.now();
    if (now - lastThrottledCall >= 200) {
        lastThrottledCall = now;
        throttledCounter++;
        throttledCount.textContent = throttledCounter;
        document.write(`Throttled event #${throttledCounter}<br>`);
    }
});

// Debounced mousemove (fires 200ms after last event)
let debounceTimer;
mousemoveArea.addEventListener('mousemove', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        debouncedCounter++;
        debouncedCount.textContent = debouncedCounter;
        document.write(`Debounced event #${debouncedCounter}<br>`);
    }, 200);
});

document.write("Move mouse in the gray area to see throttling/debouncing in action<br>");

// ========== EVENT BEST PRACTICES ==========

document.write("<br><strong>Event Best Practices:</strong><br>");
document.write("1. Use event delegation for dynamic content<br>");
document.write("2. Remove event listeners when they're no longer needed<br>");
document.write("3. Use passive event listeners for scroll events for better performance<br>");
document.write("4. Throttle or debounce frequent events like scroll, resize, mousemove<br>");
document.write("5. Use event.preventDefault() sparingly<br>");
document.write("6. Consider using the once option for one-time events<br>");
document.write("7. Be careful with event.stopPropagation() - it can break other code<br>");
document.write("8. Use custom events for component communication<br>");

// Passive event listener example
document.addEventListener('wheel', function(event) {
    // This won't block scrolling because it's passive
}, { passive: true });

// Clean up after a delay
setTimeout(() => {
    eventDemo.remove();
    propagationDemo.remove();
    delegationDemo.remove();
    eventMethodsDemo.remove();
    customEventDemo.remove();
    bindingDemo.remove();
    throttleDebounceDemo.remove();
}, 3000);