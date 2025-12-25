    const box = document.getElementById('colorBox');
    const button = document.getElementById('colorButton');

    // When button is clicked
    button.onclick = function() {
        // Make a random color
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        
        // Change box color
        box.style.backgroundColor = randomColor;
    };