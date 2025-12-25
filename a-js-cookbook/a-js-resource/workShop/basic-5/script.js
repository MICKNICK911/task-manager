document.addEventListener('DOMContentLoaded', function() {
    // Topic data - in a real app, this might come from an API or database
    const topicContents = {
        topic1: {
            title: "Web Development Fundamentals",
            content: `
                <h3>HTML, CSS, and JavaScript Basics</h3>
                <p>These three technologies form the foundation of modern web development:</p>
                <ul>
                    <li><strong>HTML (HyperText Markup Language):</strong> Provides the structure and content of web pages</li>
                    <li><strong>CSS (Cascading Style Sheets):</strong> Controls the visual presentation and layout</li>
                    <li><strong>JavaScript:</strong> Adds interactivity and dynamic behavior</li>
                </ul>
                
                <h4>Key Concepts</h4>
                <ol>
                    <li>Semantic HTML elements for better accessibility</li>
                    <li>CSS Flexbox and Grid for modern layouts</li>
                    <li>JavaScript DOM manipulation</li>
                    <li>Responsive design principles</li>
                    <li>Cross-browser compatibility</li>
                </ol>
                
                <div class="topic-footer">
                    <p><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> Start with the basics before moving to frameworks.</p>
                </div>
            `
        },
        topic2: {
            title: "Advanced Web Technologies",
            content: `
                <h3>Modern Frameworks and Tools</h3>
                <p>Advanced web development involves learning powerful frameworks and tools that streamline development:</p>
                
                <h4>Popular Frontend Frameworks</h4>
                <ul>
                    <li><strong>React:</strong> Component-based library by Facebook</li>
                    <li><strong>Vue.js:</strong> Progressive JavaScript framework</li>
                    <li><strong>Angular:</strong> Full-featured framework by Google</li>
                    <li><strong>Svelte:</strong> Compiler-based approach</li>
                </ul>
                
                <h4>Development Tools</h4>
                <ul>
                    <li>Package managers (npm, yarn)</li>
                    <li>Module bundlers (Webpack, Vite)</li>
                    <li>Version control (Git)</li>
                    <li>Testing frameworks (Jest, Cypress)</li>
                </ul>
                
                <h4>Best Practices</h4>
                <ol>
                    <li>Component-based architecture</li>
                    <li>State management patterns</li>
                    <li>Performance optimization</li>
                    <li>Accessibility compliance</li>
                </ol>
                
                <div class="topic-footer">
                    <p><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> Master one framework deeply before exploring others.</p>
                </div>
            `
        },
        topic3: {
            title: "Deployment and DevOps",
            content: `
                <h3>From Development to Production</h3>
                <p>Taking a web application from local development to production requires several important steps:</p>
                
                <h4>Deployment Platforms</h4>
                <ul>
                    <li><strong>Static Hosting:</strong> Netlify, Vercel, GitHub Pages</li>
                    <li><strong>Cloud Platforms:</strong> AWS, Google Cloud, Azure</li>
                    <li><strong>Containerization:</strong> Docker, Kubernetes</li>
                    <li><strong>Serverless:</strong> AWS Lambda, Cloud Functions</li>
                </ul>
                
                <h4>Development Workflow</h4>
                <ol>
                    <li>Local development and testing</li>
                    <li>Version control and branching strategies</li>
                    <li>Continuous Integration/Continuous Deployment (CI/CD)</li>
                    <li>Automated testing and deployment pipelines</li>
                    <li>Monitoring and analytics</li>
                </ol>
                
                <h4>Essential Tools</h4>
                <ul>
                    <li>Code editors (VS Code, WebStorm)</li>
                    <li>Browser Developer Tools</li>
                    <li>API testing (Postman, Insomnia)</li>
                    <li>Performance monitoring tools</li>
                </ul>
                
                <div class="topic-footer">
                    <p><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> Automate as much as possible to reduce human error.</p>
                </div>
            `
        }
    };

    // Get all topic elements
    const topics = document.querySelectorAll('.topic');
    const contentBody = document.getElementById('content-body');
    const currentTopicSpan = document.getElementById('current-topic');

    // Function to update content area
    function updateContent(topicId) {
        const topicData = topicContents[topicId];
        
        if (topicData) {
            // Update the content area
            contentBody.innerHTML = `
                <div class="topic-content">
                    ${topicData.content}
                </div>
            `;
            
            // Update the current topic indicator
            currentTopicSpan.textContent = topicData.title;
            
            // Update active topic styling
            topics.forEach(topic => {
                if (topic.getAttribute('data-content') === topicId) {
                    topic.classList.add('active');
                } else {
                    topic.classList.remove('active');
                }
            });
            
            // Add CSS for topic-footer if not already present
            if (!document.querySelector('#topic-footer-style')) {
                const style = document.createElement('style');
                style.id = 'topic-footer-style';
                style.textContent = `
                    .topic-footer {
                        margin-top: 25px;
                        padding: 15px;
                        background-color: #e8f4ff;
                        border-left: 4px solid #4b6cb7;
                        border-radius: 8px;
                    }
                    
                    .topic-footer p {
                        margin: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .topic-footer i {
                        color: #ffc107;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    // Add click event listeners to all topics
    topics.forEach(topic => {
        topic.addEventListener('click', function() {
            const topicId = this.getAttribute('data-content');
            updateContent(topicId);
            
            // Add a visual feedback animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
        
        // Add keyboard accessibility
        topic.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const topicId = this.getAttribute('data-content');
                updateContent(topicId);
            }
        });
        
        // Make topics focusable for accessibility
        topic.setAttribute('tabindex', '0');
    });

    // Initialize with the first topic as active (optional)
    // updateContent('topic1');
});