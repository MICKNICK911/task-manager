document.addEventListener('DOMContentLoaded', function() {
    // Get all topic elements in the drawer
    const topics = document.querySelectorAll('.topic');
    
    // Get all topic content elements
    const topicContents = document.querySelectorAll('.topic-content');

    const showTopics = document.getElementById('show');
    const showDrawer = document.getElementById('drawers');

    showTopics.onclick = function() {
        if (showDrawer.classList.contains('hide')) {
            showDrawer.classList.remove('hide');
           
        }else{
         showDrawer.classList.add('hide');}
    };
    
    // Function to switch to a specific topic
    function switchTopic(topicNumber) {
        // Remove active class from all topics
        topics.forEach(topic => {
            topic.classList.remove('active');
        });
        
        // Remove active class from all content
        topicContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to selected topic
        const selectedTopic = document.querySelector(`.topic[data-topic="${topicNumber}"]`);
        if (selectedTopic) {
            selectedTopic.classList.add('active');
        }
        
        // Show corresponding content
        const selectedContent = document.querySelector(`.topic-content[data-topic="${topicNumber}"]`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    }
    
    // Add click event listeners to all topics
    topics.forEach(topic => {
        topic.addEventListener('click', function() {
            const topicNumber = this.getAttribute('data-topic');
            switchTopic(topicNumber);
        });
    });
    
    // Initialize with Topic 1 active
    switchTopic('1');
});