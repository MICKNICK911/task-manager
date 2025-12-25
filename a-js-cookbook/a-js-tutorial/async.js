/**
 * ASYNCHRONOUS JAVASCRIPT
 * 
 * Asynchronous programming allows JavaScript to perform long-running tasks
 * without blocking the main thread.
 * 
 * Topics covered:
 * - Callbacks
 * - setTimeout and setInterval
 * - Event loop
 * - Callback hell and solutions
 * - async/await (brief intro, covered in promises.js)
 * - Web Workers
 * - AJAX (brief intro)
 */

document.write("<h3>12. Asynchronous JavaScript</h3>");

// ========== SYNCHRONOUS VS ASYNCHRONOUS ==========

document.write("<strong>Synchronous vs Asynchronous:</strong><br>");

document.write("Synchronous code (blocks execution):<br>");
for (let i = 1; i <= 3; i++) {
    document.write(`Sync ${i}<br>`);
}

document.write("<br>Asynchronous code (doesn't block):<br>");
setTimeout(() => {
    document.write("Async: This runs after timeout<br>");
}, 100);

document.write("This runs before the timeout callback<br>");

// ========== CALLBACK FUNCTIONS ==========

document.write("<br><strong>Callback Functions:</strong><br>");

// Basic callback example
function processData(data, callback) {
    document.write(`Processing: ${data}<br>`);
    // Simulate async operation
    setTimeout(() => {
        const result = data.toUpperCase();
        callback(null, result);
    }, 500);
}

processData("hello", (error, result) => {
    if (error) {
        document.write(`Error: ${error}<br>`);
    } else {
        document.write(`Callback result: ${result}<br>`);
    }
});

// Error-first callback pattern (Node.js convention)
function divide(a, b, callback) {
    setTimeout(() => {
        if (b === 0) {
            callback(new Error("Cannot divide by zero"), null);
        } else {
            callback(null, a / b);
        }
    }, 200);
}

divide(10, 2, (err, result) => {
    if (err) {
        document.write(`Division error: ${err.message}<br>`);
    } else {
        document.write(`Division result: ${result}<br>`);
    }
});

// ========== SETTIMEOUT AND SETINTERVAL ==========

document.write("<br><strong>setTimeout and setInterval:</strong><br>");

// setTimeout - executes once after delay
document.write("Starting setTimeout demo...<br>");
setTimeout(() => {
    document.write("setTimeout: This runs after 1 second<br>");
}, 1000);

// setInterval - executes repeatedly
let counter = 0;
const intervalId = setInterval(() => {
    counter++;
    document.write(`setInterval: Tick ${counter}<br>`);
    
    if (counter >= 3) {
        clearInterval(intervalId);
        document.write("Interval cleared after 3 ticks<br>");
    }
}, 500);

// setTimeout with arguments
setTimeout((name, age) => {
    document.write(`setTimeout with args: ${name}, ${age}<br>`);
}, 800, "Alice", 30);

// Clear timeout example
const timeoutId = setTimeout(() => {
    document.write("This should not run (cleared)<br>");
}, 2000);

// Clear it before it executes
clearTimeout(timeoutId);
document.write("Timeout cleared before execution<br>");

// ========== EVENT LOOP EXPLANATION ==========

document.write("<br><strong>The Event Loop:</strong><br>");

document.write("JavaScript has a single-threaded event loop:<br>");
document.write("1. Call Stack - executes synchronous code<br>");
document.write("2. Web APIs - handle async operations (setTimeout, DOM events, etc.)<br>");
document.write("3. Callback Queue - holds callbacks from Web APIs<br>");
document.write("4. Event Loop - moves callbacks from queue to stack when stack is empty<br>");

// Demonstrate event loop
document.write("<br>Event loop demonstration:<br>");
document.write("Start<br>");

setTimeout(() => {
    document.write("Timeout callback (macrotask)<br>");
}, 0);

Promise.resolve().then(() => {
    document.write("Promise callback (microtask)<br>");
});

document.write("End<br>");

// Microtasks (Promises) run before macrotasks (setTimeout)
document.write("<br>Microtasks have priority over macrotasks<br>");

// ========== CALLBACK HELL (PYRAMID OF DOOM) ==========

document.write("<br><strong>Callback Hell (Pyramid of Doom):</strong><br>");

// Simulate nested async operations
function step1(callback) {
    setTimeout(() => {
        document.write("Step 1 completed<br>");
        callback(null, "Result 1");
    }, 300);
}

function step2(data, callback) {
    setTimeout(() => {
        document.write(`Step 2 processed: ${data}<br>`);
        callback(null, data + " -> Result 2");
    }, 300);
}

function step3(data, callback) {
    setTimeout(() => {
        document.write(`Step 3 processed: ${data}<br>`);
        callback(null, data + " -> Result 3");
    }, 300);
}

// Callback hell example
document.write("Callback hell (nested callbacks):<br>");
step1((err1, result1) => {
    if (err1) {
        document.write(`Error in step1: ${err1}<br>`);
        return;
    }
    
    step2(result1, (err2, result2) => {
        if (err2) {
            document.write(`Error in step2: ${err2}<br>`);
            return;
        }
        
        step3(result2, (err3, result3) => {
            if (err3) {
                document.write(`Error in step3: ${err3}<br>`);
                return;
            }
            
            document.write(`Final result: ${result3}<br>`);
        });
    });
});

// ========== SOLUTIONS TO CALLBACK HELL ==========

document.write("<br><strong>Solutions to Callback Hell:</strong><br>");

// 1. Named functions (flattens the pyramid)
function handleStep1(err1, result1) {
    if (err1) {
        document.write(`Error in step1: ${err1}<br>`);
        return;
    }
    step2(result1, handleStep2);
}

function handleStep2(err2, result2) {
    if (err2) {
        document.write(`Error in step2: ${err2}<br>`);
        return;
    }
    step3(result2, handleStep3);
}

function handleStep3(err3, result3) {
    if (err3) {
        document.write(`Error in step3: ${err3}<br>`);
        return;
    }
    document.write(`Named functions result: ${result3}<br>`);
}

setTimeout(() => {
    document.write("<br>Using named functions:<br>");
    step1(handleStep1);
}, 1500);

// 2. Async library pattern (like async.waterfall)
function asyncWaterfall(tasks, finalCallback) {
    function next(index, previousResult) {
        if (index >= tasks.length) {
            return finalCallback(null, previousResult);
        }
        
        const task = tasks[index];
        task(previousResult, (err, result) => {
            if (err) {
                return finalCallback(err);
            }
            next(index + 1, result);
        });
    }
    
    next(0, null);
}

setTimeout(() => {
    document.write("<br>Using waterfall pattern:<br>");
    
    asyncWaterfall([
        (_, callback) => {
            setTimeout(() => {
                document.write("Waterfall step 1<br>");
                callback(null, "W1");
            }, 200);
        },
        (prev, callback) => {
            setTimeout(() => {
                document.write(`Waterfall step 2: ${prev}<br>`);
                callback(null, prev + " -> W2");
            }, 200);
        },
        (prev, callback) => {
            setTimeout(() => {
                document.write(`Waterfall step 3: ${prev}<br>`);
                callback(null, prev + " -> W3");
            }, 200);
        }
    ], (err, result) => {
        if (err) {
            document.write(`Waterfall error: ${err}<br>`);
        } else {
            document.write(`Waterfall final result: ${result}<br>`);
        }
    });
}, 2500);

// ========== REQUESTANIMATIONFRAME ==========

document.write("<br><strong>requestAnimationFrame:</strong><br>");

// Better than setTimeout for animations
let rafCounter = 0;
let lastTime = 0;

function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    
    const elapsed = timestamp - lastTime;
    
    if (elapsed > 100) { // Update every 100ms
        rafCounter++;
        document.write(`Animation frame ${rafCounter} at ${timestamp.toFixed(0)}ms<br>`);
        lastTime = timestamp;
        
        if (rafCounter >= 5) {
            document.write("Animation stopped<br>");
            return; // Stop after 5 updates
        }
    }
    
    requestAnimationFrame(animate);
}

setTimeout(() => {
    document.write("Starting requestAnimationFrame demo...<br>");
    requestAnimationFrame(animate);
}, 3500);

// ========== ASYNCHRONOUS ITERATION ==========

document.write("<br><strong>Asynchronous Iteration:</strong><br>");

// Simulating async data fetching
function fetchItem(id, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Item ${id}`);
        }, delay);
    });
}

// Async generator
async function* asyncItemGenerator(count) {
    for (let i = 1; i <= count; i++) {
        const item = await fetchItem(i, 100);
        yield item;
    }
}

// Using for-await-of (ES2018)
setTimeout(async () => {
    document.write("Async iteration with for-await-of:<br>");
    
    for await (const item of asyncItemGenerator(3)) {
        document.write(`Received: ${item}<br>`);
    }
}, 4000);

// ========== WEB WORKERS ==========

document.write("<br><strong>Web Workers (for CPU-intensive tasks):</strong><br>");

// Note: Web Workers run in separate threads
// They can't access DOM directly

document.write("Web Workers allow running scripts in background threads<br>");
document.write("They communicate with main thread via messages<br>");

// Create a simple worker inline (for demo purposes)
const workerCode = `
  self.onmessage = function(e) {
    const startTime = Date.now();
    let result = 0;
    
    // Simulate heavy computation
    for (let i = 0; i < 100000000; i++) {
      result += Math.sqrt(i);
    }
    
    const endTime = Date.now();
    self.postMessage({
      result: result,
      time: endTime - startTime
    });
  };
`;

// Create worker from blob
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerURL = URL.createObjectURL(workerBlob);

setTimeout(() => {
    document.write("<br>Starting Web Worker demo...<br>");
    
    if (typeof Worker !== 'undefined') {
        const worker = new Worker(workerURL);
        
        worker.onmessage = function(e) {
            document.write(`Worker completed in ${e.data.time}ms<br>`);
            document.write(`Result: ${e.data.result.toFixed(2)}<br>`);
            
            // Clean up
            worker.terminate();
            URL.revokeObjectURL(workerURL);
        };
        
        worker.onerror = function(e) {
            document.write(`Worker error: ${e.message}<br>`);
        };
        
        worker.postMessage('start');
    } else {
        document.write("Web Workers not supported in this browser<br>");
    }
}, 4500);

// ========== AJAX (ASYNCHRONOUS JAVASCRIPT AND XML) ==========

document.write("<br><strong>AJAX (Asynchronous JavaScript and XML):</strong><br>");

// Traditional XMLHttpRequest
function makeAjaxRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(null, xhr.responseText);
            } else {
                callback(new Error(`Request failed with status ${xhr.status}`), null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback(new Error("Network error"), null);
    };
    
    xhr.open('GET', url, true);
    xhr.send();
}

// Fetch API (modern replacement for XMLHttpRequest)
setTimeout(() => {
    document.write("<br>Using Fetch API (modern AJAX):<br>");
    
    // Fetch returns a Promise
    fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.write(`Fetched post: ${data.title.substring(0, 30)}...<br>`);
        })
        .catch(error => {
            document.write(`Fetch error: ${error.message}<br>`);
        });
}, 5000);

// ========== ASYNC PATTERNS ==========

document.write("<br><strong>Async Patterns:</strong><br>");

// 1. Parallel execution
document.write("1. Parallel execution (run async operations concurrently)<br>");

setTimeout(() => {
    document.write("<br>Parallel execution demo:<br>");
    
    const startTime = Date.now();
    
    // Simulate parallel operations
    const ops = [
        new Promise(resolve => setTimeout(() => resolve("Task 1"), 800)),
        new Promise(resolve => setTimeout(() => resolve("Task 2"), 600)),
        new Promise(resolve => setTimeout(() => resolve("Task 3"), 400))
    ];
    
    Promise.all(ops)
        .then(results => {
            const endTime = Date.now();
            document.write(`All tasks completed in ${endTime - startTime}ms<br>`);
            document.write(`Results: ${results.join(', ')}<br>`);
        });
}, 5500);

// 2. Race conditions
document.write("<br>2. Race conditions (first to finish wins)<br>");

setTimeout(() => {
    document.write("<br>Promise.race() demo:<br>");
    
    const fast = new Promise(resolve => setTimeout(() => resolve("Fast"), 300));
    const medium = new Promise(resolve => setTimeout(() => resolve("Medium"), 600));
    const slow = new Promise(resolve => setTimeout(() => resolve("Slow"), 900));
    
    Promise.race([fast, medium, slow])
        .then(winner => {
            document.write(`Race winner: ${winner}<br>`);
        });
}, 6000);

// ========== ASYNC BEST PRACTICES ==========

document.write("<br><strong>Async Best Practices:</strong><br>");
document.write("1. Avoid callback hell - use Promises or async/await<br>");
document.write("2. Always handle errors in async operations<br>");
document.write("3. Use Promise.all() for parallel execution when possible<br>");
document.write("4. Use Web Workers for CPU-intensive tasks<br>");
document.write("5. Be aware of the event loop and microtask queue<br>");
document.write("6. Use requestAnimationFrame() for animations instead of setTimeout<br>");
document.write("7. Cancel async operations when no longer needed (clearTimeout, AbortController)<br>");
document.write("8. Consider using async iterators for streaming data<br>");

// AbortController example (for cancelling fetch)
document.write("<br>AbortController example (for cancelling async operations):<br>");
setTimeout(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    fetch('https://jsonplaceholder.typicode.com/posts/1', { signal })
        .then(response => response.json())
        .then(data => {
            document.write(`Fetched: ${data.title}<br>`);
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                document.write("Fetch was aborted<br>");
            } else {
                document.write(`Fetch error: ${err.message}<br>`);
            }
        });
    
    // Abort the fetch
    controller.abort();
}, 6500);