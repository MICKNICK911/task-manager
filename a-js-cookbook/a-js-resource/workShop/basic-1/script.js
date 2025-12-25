const box = document.getElementById('containerID');    
const box2 = document.getElementById('containerID2');    

// When button is clicked
    box.onclick = function() {
        if (box2.classList.contains('hide')) {
            box2.classList.remove('hide');
            
        }
        box.classList.add('hide');  
    };

    box2.onclick = function() {
        if (box.classList.contains('hide')) {
            box.classList.remove('hide');
           
        }
         box2.classList.add('hide');
    };

// demoDiv.classList.add('highlight', 'padded');
// demoDiv.classList.remove('primary');