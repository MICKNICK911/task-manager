// DOM Manipulation Demo - Main JavaScript File

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing DOM Manipulation Demo...');
    
    // ===================
    // 1. NAVIGATION SYSTEM
    // ===================
    
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    // Get all screen elements
    const screens = document.querySelectorAll('.screen');
    
    // Function to switch between screens
    function switchScreen(screenId) {
        // Hide all screens
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the selected screen
        const activeScreen = document.getElementById(`${screenId}-screen`);
        if (activeScreen) {
            activeScreen.classList.add('active');
        }
        
        // Update active navigation button
        navButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-screen') === screenId) {
                button.classList.add('active');
            }
        });
        
        console.log(`Switched to ${screenId} screen`);
    }
    
    // Add click event listeners to all navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            switchScreen(screenId);
        });
    });
    
    // ===================
    // 2. CREATE ELEMENTS SCREEN
    // ===================
    
    // Get references to elements on the "Create Elements" screen
    const createParagraphBtn = document.getElementById('create-paragraph');
    const createHeadingBtn = document.getElementById('create-heading');
    const createListItemBtn = document.getElementById('create-list-item');
    const clearElementsBtn = document.getElementById('clear-elements');
    const elementContainer = document.getElementById('element-container');
    
    // Counter to keep track of created elements
    let elementCounter = 0;
    
    // Function to create a new paragraph element
    function createParagraph() {
        elementCounter++;
        const newParagraph = document.createElement('p');
        newParagraph.textContent = `This is dynamically created paragraph #${elementCounter}`;
        newParagraph.classList.add('dynamic-element');
        newParagraph.style.animation = 'fadeIn 0.5s ease';
        elementContainer.appendChild(newParagraph);
        console.log('Created new paragraph element');
    }
    
    // Function to create a new heading element
    function createHeading() {
        elementCounter++;
        const newHeading = document.createElement('h3');
        newHeading.textContent = `Dynamic Heading #${elementCounter}`;
        newHeading.classList.add('dynamic-element');
        newHeading.style.animation = 'fadeIn 0.5s ease';
        newHeading.style.color = '#4a6fa5';
        elementContainer.appendChild(newHeading);
        console.log('Created new heading element');
    }
    
    // Function to create a new list item
    function createListItem() {
        elementCounter++;
        
        // Check if a list already exists, if not create one
        let list = elementContainer.querySelector('ul');
        if (!list) {
            list = document.createElement('ul');
            list.classList.add('dynamic-list');
            list.style.animation = 'fadeIn 0.5s ease';
            elementContainer.appendChild(list);
        }
        
        const newListItem = document.createElement('li');
        newListItem.textContent = `List item #${elementCounter}`;
        newListItem.classList.add('dynamic-element');
        list.appendChild(newListItem);
        console.log('Created new list item');
    }
    
    // Function to clear all created elements
    function clearElements() {
        // Remove all dynamically created elements
        const dynamicElements = elementContainer.querySelectorAll('.dynamic-element, .dynamic-list');
        dynamicElements.forEach(element => {
            element.remove();
        });
        
        // Reset counter
        elementCounter = 0;
        
        // If container is empty, add the default message
        if (elementContainer.children.length === 0) {
            const defaultMessage = document.createElement('p');
            defaultMessage.textContent = 'Elements created will appear here.';
            elementContainer.appendChild(defaultMessage);
        }
        
        console.log('Cleared all created elements');
    }
    
    // Add event listeners to create elements buttons
    createParagraphBtn.addEventListener('click', createParagraph);
    createHeadingBtn.addEventListener('click', createHeading);
    createListItemBtn.addEventListener('click', createListItem);
    clearElementsBtn.addEventListener('click', clearElements);
    
    // ===================
    // 3. MODIFY ELEMENTS SCREEN
    // ===================
    
    // Get references to elements on the "Modify Elements" screen
    const modifiableElement = document.getElementById('modifiable-element');
    const changeTextBtn = document.getElementById('change-text');
    const toggleHtmlBtn = document.getElementById('toggle-html');
    const changeImageBtn = document.getElementById('change-image');
    const toggleHiddenBtn = document.getElementById('toggle-hidden');
    const resetElementBtn = document.getElementById('reset-element');
    const modifiableImage = document.getElementById('modifiable-image');
    
    // Store the original content to reset later
    const originalContent = {
        title: modifiableElement.querySelector('h4').textContent,
        text: modifiableElement.querySelector('p').textContent,
        imageSrc: modifiableImage.getAttribute('src'),
        imageAlt: modifiableImage.getAttribute('alt')
    };
    
    // Track if HTML mode is active
    let htmlMode = false;
    
    // Function to change text content
    function changeTextContent() {
        const paragraph = modifiableElement.querySelector('p');
        paragraph.textContent = 'The text content has been modified using JavaScript!';
        console.log('Modified text content');
    }
    
    // Function to toggle between text and HTML content
    function toggleHtmlContent() {
        const paragraph = modifiableElement.querySelector('p');
        
        if (!htmlMode) {
            // Switch to HTML mode
            paragraph.innerHTML = 'Now containing <strong>HTML</strong> with a <a href="#" style="color: #4a6fa5;">link</a> and <span style="color: #e74c3c;">styled text</span>.';
            htmlMode = true;
            console.log('Switched to HTML content');
        } else {
            // Switch back to text mode
            paragraph.textContent = 'Click the buttons below to modify this element.';
            htmlMode = false;
            console.log('Switched to plain text content');
        }
    }
    
    // Function to change the image
    function changeImage() {
        // Alternate between two images
        const currentSrc = modifiableImage.getAttribute('src');
        if (currentSrc.includes('placeholder')) {
            modifiableImage.setAttribute('src', 'https://via.placeholder.com/150x100/4ecdc4/ffffff?text=New+Image');
            modifiableImage.setAttribute('alt', 'New Sample Image');
        } else {
            modifiableImage.setAttribute('src', originalContent.imageSrc);
            modifiableImage.setAttribute('alt', originalContent.imageAlt);
        }
        console.log('Changed image');
    }
    
    // Function to toggle element visibility
    function toggleVisibility() {
        const paragraph = modifiableElement.querySelector('p');
        const image = modifiableElement.querySelector('img');
        
        // Toggle visibility of paragraph and image
        if (paragraph.style.display !== 'none') {
            paragraph.style.display = 'none';
            image.style.display = 'none';
            console.log('Hidden paragraph and image');
        } else {
            paragraph.style.display = 'block';
            image.style.display = 'block';
            console.log('Showed paragraph and image');
        }
    }
    
    // Function to reset element to original state
    function resetElement() {
        modifiableElement.querySelector('h4').textContent = originalContent.title;
        modifiableElement.querySelector('p').textContent = originalContent.text;
        modifiableElement.querySelector('p').style.display = 'block';
        modifiableElement.querySelector('p').innerHTML = originalContent.text;
        modifiableImage.setAttribute('src', originalContent.imageSrc);
        modifiableImage.setAttribute('alt', originalContent.imageAlt);
        modifiableImage.style.display = 'block';
        htmlMode = false;
        console.log('Reset element to original state');
    }
    
    // Add event listeners to modify elements buttons
    changeTextBtn.addEventListener('click', changeTextContent);
    toggleHtmlBtn.addEventListener('click', toggleHtmlContent);
    changeImageBtn.addEventListener('click', changeImage);
    toggleHiddenBtn.addEventListener('click', toggleVisibility);
    resetElementBtn.addEventListener('click', resetElement);
    
    // ===================
    // 4. STYLE ELEMENTS SCREEN
    // ===================
    
    // Get references to elements on the "Style Elements" screen
    const stylableElement = document.getElementById('stylable-element');
    const styleButtons = document.querySelectorAll('.style-btn');
    const resetStylesBtn = document.getElementById('reset-styles');
    
    // Store original styles to reset later
    const originalStyles = {
        backgroundColor: stylableElement.style.backgroundColor,
        color: stylableElement.style.color,
        fontSize: stylableElement.style.fontSize,
        fontWeight: stylableElement.style.fontWeight,
        padding: stylableElement.style.padding,
        borderRadius: stylableElement.style.borderRadius,
        boxShadow: stylableElement.style.boxShadow
    };
    
    // Function to apply style to element
    function applyStyle(event) {
        const styleProperty = event.target.getAttribute('data-style');
        const styleValue = event.target.getAttribute('data-value');
        
        // Apply the style to the element
        stylableElement.style[styleProperty] = styleValue;
        console.log(`Applied style: ${styleProperty}: ${styleValue}`);
    }
    
    // Function to reset all styles
    function resetStyles() {
        // Reset all styles to their original values
        stylableElement.style.backgroundColor = originalStyles.backgroundColor;
        stylableElement.style.color = originalStyles.color;
        stylableElement.style.fontSize = originalStyles.fontSize;
        stylableElement.style.fontWeight = originalStyles.fontWeight;
        stylableElement.style.padding = originalStyles.padding;
        stylableElement.style.borderRadius = originalStyles.borderRadius;
        stylableElement.style.boxShadow = originalStyles.boxShadow;
        console.log('Reset all styles to original');
    }
    
    // Add event listeners to style buttons
    styleButtons.forEach(button => {
        button.addEventListener('click', applyStyle);
    });
    
    // Add event listener to reset styles button
    resetStylesBtn.addEventListener('click', resetStyles);
    
    // ===================
    // 5. EVENT HANDLING SCREEN
    // ===================
    
    // Get references to elements on the "Event Handling" screen
    const clickBox = document.getElementById('click-box');
    const hoverBox = document.getElementById('hover-box');
    const keypressBox = document.getElementById('keypress-box');
    const addEventsBtn = document.getElementById('add-events');
    const removeEventsBtn = document.getElementById('remove-events');
    const resetCountersBtn = document.getElementById('reset-counters');
    const eventLogContent = document.getElementById('event-log-content');
    
    // Event counters
    let clickCount = 0;
    let hoverCount = 0;
    let keypressCount = 0;
    let lastKey = 'None';
    
    // Track if event listeners are active
    let eventsActive = false;
    
    // Function to log events
    function logEvent(eventMessage) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${eventMessage}`;
        logEntry.style.padding = '5px 0';
        logEntry.style.borderBottom = '1px solid #444';
        
        // Add to the top of the log
        eventLogContent.prepend(logEntry);
        
        // Limit log to 10 entries
        if (eventLogContent.children.length > 10) {
            eventLogContent.removeChild(eventLogContent.lastChild);
        }
        
        console.log(eventMessage);
    }
    
    // Function to handle click events
    function handleClick() {
        clickCount++;
        clickBox.querySelector('.event-counter span').textContent = clickCount;
        logEvent(`Click event triggered on click box (total: ${clickCount})`);
    }
    
    // Function to handle hover events
    function handleMouseEnter() {
        hoverCount++;
        hoverBox.querySelector('.event-counter span').textContent = hoverCount;
        logEvent(`Mouse enter event triggered on hover box (total: ${hoverCount})`);
    }
    
    // Function to handle keypress events
    function handleKeyPress(event) {
        keypressCount++;
        lastKey = event.key;
        keypressBox.querySelector('.event-counter span').textContent = keypressCount;
        keypressBox.querySelector('.last-key span').textContent = lastKey;
        logEvent(`Keypress event: "${event.key}" (total: ${keypressCount})`);
    }
    
    // Function to add event listeners
    function addEventListeners() {
        if (!eventsActive) {
            clickBox.addEventListener('click', handleClick);
            hoverBox.addEventListener('mouseenter', handleMouseEnter);
            document.addEventListener('keydown', handleKeyPress);
            eventsActive = true;
            logEvent('All event listeners added');
        }
    }
    
    // Function to remove event listeners
    function removeEventListeners() {
        if (eventsActive) {
            clickBox.removeEventListener('click', handleClick);
            hoverBox.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('keydown', handleKeyPress);
            eventsActive = false;
            logEvent('All event listeners removed');
        }
    }
    
    // Function to reset counters
    function resetCounters() {
        clickCount = 0;
        hoverCount = 0;
        keypressCount = 0;
        lastKey = 'None';
        
        clickBox.querySelector('.event-counter span').textContent = '0';
        hoverBox.querySelector('.event-counter span').textContent = '0';
        keypressBox.querySelector('.event-counter span').textContent = '0';
        keypressBox.querySelector('.last-key span').textContent = 'None';
        
        logEvent('All event counters reset');
    }
    
    // Initialize event log
    logEvent('Event log initialized. Click "Add Event Listeners" to start.');
    
    // Add event listeners to control buttons
    addEventsBtn.addEventListener('click', addEventListeners);
    removeEventsBtn.addEventListener('click', removeEventListeners);
    resetCountersBtn.addEventListener('click', resetCounters);
    
    // ===================
    // 6. INTERACTIVE DEMO SCREEN
    // ===================
    
    // Get references to elements on the "Interactive Demo" screen
    const cardPreview = document.getElementById('card-preview');
    const cardTitle = document.getElementById('card-title');
    const cardContent = document.getElementById('card-content');
    const cardTitleInput = document.getElementById('card-title-input');
    const cardContentInput = document.getElementById('card-content-input');
    const cardColorPicker = document.getElementById('card-color-picker');
    const updateTitleBtn = document.getElementById('update-title');
    const updateContentBtn = document.getElementById('update-content');
    const applyColorBtn = document.getElementById('apply-color');
    const addCardBorderBtn = document.getElementById('add-card-border');
    const addCardShadowBtn = document.getElementById('add-card-shadow');
    const resetCardBtn = document.getElementById('reset-card');
    const inspectorOutput = document.getElementById('inspector-output');
    
    // Store original card state for reset
    const originalCardState = {
        title: cardTitle.textContent,
        content: cardContent.textContent,
        color: '#4a6fa5',
        border: false,
        shadow: false
    };
    
    // Track current card state
    let cardState = {
        border: false,
        shadow: false
    };
    
    // Function to update the DOM inspector
    function updateInspector() {
        const cardHTML = cardPreview.outerHTML;
        // Clean up the HTML for display (remove extra whitespace)
        const cleanHTML = cardHTML
            .replace(/\s+/g, ' ')
            .replace(/> </g, '>\n<')
            .replace(/>/g, '>\n');
        
        inspectorOutput.textContent = cleanHTML;
    }
    
    // Function to update card title
    function updateCardTitle() {
        const newTitle = cardTitleInput.value;
        cardTitle.textContent = newTitle;
        logEvent(`Card title updated to: "${newTitle}"`);
        updateInspector();
    }
    
    // Function to update card content
    function updateCardContent() {
        const newContent = cardContentInput.value;
        cardContent.textContent = newContent;
        logEvent(`Card content updated`);
        updateInspector();
    }
    
    // Function to apply color to card
    function applyCardColor() {
        const newColor = cardColorPicker.value;
        cardPreview.style.backgroundColor = newColor;
        logEvent(`Card color changed to: ${newColor}`);
        updateInspector();
    }
    
    // Function to toggle card border
    function toggleCardBorder() {
        cardState.border = !cardState.border;
        
        if (cardState.border) {
            cardPreview.style.border = '4px solid #4a6fa5';
            logEvent('Card border added');
        } else {
            cardPreview.style.border = originalCardState.border ? '4px solid #4a6fa5' : '2px solid #e0e0e0';
            logEvent('Card border removed');
        }
        
        updateInspector();
    }
    
    // Function to toggle card shadow
    function toggleCardShadow() {
        cardState.shadow = !cardState.shadow;
        
        if (cardState.shadow) {
            cardPreview.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            logEvent('Card shadow added');
        } else {
            cardPreview.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.08)';
            logEvent('Card shadow removed');
        }
        
        updateInspector();
    }
    
    // Function to reset card to original state
    function resetCard() {
        cardTitle.textContent = originalCardState.title;
        cardContent.textContent = originalCardState.content;
        cardTitleInput.value = originalCardState.title;
        cardContentInput.value = originalCardState.content;
        cardColorPicker.value = originalCardState.color;
        
        cardPreview.style.backgroundColor = 'white';
        cardPreview.style.border = '2px solid #e0e0e0';
        cardPreview.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.08)';
        
        cardState.border = false;
        cardState.shadow = false;
        
        logEvent('Card reset to original state');
        updateInspector();
    }
    
    // Add event listeners to card builder controls
    updateTitleBtn.addEventListener('click', updateCardTitle);
    updateContentBtn.addEventListener('click', updateCardContent);
    applyColorBtn.addEventListener('click', applyCardColor);
    addCardBorderBtn.addEventListener('click', toggleCardBorder);
    addCardShadowBtn.addEventListener('click', toggleCardShadow);
    resetCardBtn.addEventListener('click', resetCard);
    
    // Initialize the inspector
    updateInspector();
    
    // ===================
    // 7. INITIALIZATION
    // ===================
    
    console.log('DOM Manipulation Demo initialized successfully!');
    
    // Set up a welcome message in the console
    console.log(`
    ============================================
      DOM Manipulation Demo App
      Explore different screens to learn about:
      - Creating DOM elements
      - Modifying element content and attributes
      - Styling elements with JavaScript
      - Handling DOM events
      - Interactive DOM manipulation
    ============================================
    `);
});