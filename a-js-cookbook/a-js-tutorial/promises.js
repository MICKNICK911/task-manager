/**
 * PROMISES IN JAVASCRIPT
 * 
 * Promises represent the eventual completion (or failure) of an asynchronous operation.
 * They are a cleaner alternative to callbacks for handling async operations.
 * 
 * Topics covered:
 * - Creating promises
 * - Promise states (pending, fulfilled, rejected)
 * - Promise methods (then, catch, finally)
 * - Chaining promises
 * - Promise static methods (all, race, allSettled, any)
 * - Async/await syntax
 * - Error handling with promises
 * - Promise patterns and best practices
 */

document.write("<h3>13. Promises</h3>");

// ========== CREATING PROMISES ==========

document.write("<strong>Creating Promises:</strong><br>");

// Basic promise creation
const simplePromise = new Promise((resolve, reject) => {
    // This is the executor function
    // It runs immediately when the promise is created
    
    // Simulate async operation
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% chance of success
        
        if (success) {
            resolve("Operation completed successfully!");
        } else {
            reject(new Error("Operation failed!"));
        }
    }, 500);
});

document.write("Promise created (check console for result)<br>");

// Consuming the promise
simplePromise
    .then(result => {
        document.write(`Promise resolved: ${result}<br>`);
    })
    .catch(error => {
        document.write(`Promise rejected: ${error.message}<br>`);
    });

// ========== PROMISE STATES ==========

document.write("<br><strong>Promise States:</strong><br>");

// Pending state
const pendingPromise = new Promise((resolve, reject) => {
    // Not calling resolve or reject yet
    setTimeout(() => resolve("Resolved later"), 1000);
});

document.write(`Initial state: ${pendingPromise}<br>`);
document.write("After creation, promise is 'pending'<br>");

// Check state indirectly
pendingPromise.then(() => {
    document.write("Promise is now 'fulfilled'<br>");
});

// Settled states
const fulfilledPromise = Promise.resolve("Already fulfilled");
const rejectedPromise = Promise.reject(new Error("Already rejected"));

document.write("<br>Created already settled promises:<br>");
document.write("- fulfilledPromise: Promise.resolve()<br>");
document.write("- rejectedPromise: Promise.reject()<br>");

// ========== PROMISE CONSUMING METHODS ==========

document.write("<br><strong>Promise Consuming Methods:</strong><br>");

const demoPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Demo data loaded");
    }, 300);
});

// 1. then() - handles fulfillment
demoPromise.then(
    result => {
        document.write(`then() success: ${result}<br>`);
        return result.toUpperCase();
    },
    error => {
        // This is the second argument for rejection (less common)
        document.write(`then() error: ${error}<br>`);
    }
).then(upperResult => {
    document.write(`Chained then(): ${upperResult}<br>`);
});

// 2. catch() - handles rejection
const failingPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error("Something went wrong"));
    }, 400);
});

failingPromise
    .then(result => {
        document.write("This won't run<br>");
    })
    .catch(error => {
        document.write(`catch() handled: ${error.message}<br>`);
    });

// 3. finally() - runs regardless of outcome
demoPromise
    .finally(() => {
        document.write("finally() called (cleanup code)<br>");
    });

// ========== PROMISE CHAINING ==========

document.write("<br><strong>Promise Chaining:</strong><br>");

// Simulate async operations
function getUser(id) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id, name: `User ${id}` });
        }, 200);
    });
}

function getPosts(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, userId, title: "Post 1" },
                { id: 2, userId, title: "Post 2" }
            ]);
        }, 200);
    });
}

function getComments(postId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, postId, text: "Comment 1" },
                { id: 2, postId, text: "Comment 2" }
            ]);
        }, 200);
    });
}

// Promise chain (avoiding callback hell)
document.write("Fetching user data with promise chain...<br>");

getUser(123)
    .then(user => {
        document.write(`Got user: ${user.name}<br>`);
        return getPosts(user.id);
    })
    .then(posts => {
        document.write(`Got ${posts.length} posts<br>`);
        return getComments(posts[0].id);
    })
    .then(comments => {
        document.write(`Got ${comments.length} comments<br>`);
        document.write("Promise chain completed successfully!<br>");
    })
    .catch(error => {
        document.write(`Error in chain: ${error.message}<br>`);
    });

// ========== PROMISE STATIC METHODS ==========

document.write("<br><strong>Promise Static Methods:</strong><br>");

// 1. Promise.all() - waits for all promises to fulfill
document.write("1. Promise.all() - all must succeed:<br>");

const promise1 = Promise.resolve("Result 1");
const promise2 = new Promise(resolve => setTimeout(() => resolve("Result 2"), 300));
const promise3 = Promise.resolve("Result 3");

Promise.all([promise1, promise2, promise3])
    .then(results => {
        document.write(`All resolved: ${results.join(", ")}<br>`);
    })
    .catch(error => {
        document.write(`One failed: ${error.message}<br>`);
    });

// Promise.all() with rejection
const failingPromise2 = Promise.reject(new Error("Failed early"));

Promise.all([promise1, failingPromise2, promise3])
    .then(results => {
        document.write("This won't run (one promise failed)<br>");
    })
    .catch(error => {
        document.write(`Promise.all() caught: ${error.message}<br>`);
    });

// 2. Promise.race() - first to settle wins
document.write("<br>2. Promise.race() - first to settle:<br>");

const fastPromise = new Promise(resolve => setTimeout(() => resolve("Fast"), 100));
const slowPromise = new Promise(resolve => setTimeout(() => resolve("Slow"), 500));
const errorPromise = new Promise((resolve, reject) => 
    setTimeout(() => reject(new Error("Error")), 200)
);

Promise.race([fastPromise, slowPromise, errorPromise])
    .then(winner => {
        document.write(`Race winner: ${winner}<br>`);
    })
    .catch(error => {
        document.write(`Race error: ${error.message}<br>`);
    });

// 3. Promise.allSettled() - waits for all to settle (ES2020)
document.write("<br>3. Promise.allSettled() - all settle (success or failure):<br>");

const settledPromise1 = Promise.resolve("Success");
const settledPromise2 = Promise.reject(new Error("Failure"));

Promise.allSettled([settledPromise1, settledPromise2])
    .then(results => {
        document.write("Promise.allSettled() results:<br>");
        results.forEach((result, index) => {
            document.write(`  Promise ${index}: ${result.status} - ${result.value || result.reason.message}<br>`);
        });
    });

// 4. Promise.any() - first to fulfill (ES2021)
document.write("<br>4. Promise.any() - first to succeed:<br>");

const rejectFast = new Promise((resolve, reject) => 
    setTimeout(() => reject(new Error("Fast fail")), 100)
);
const succeedSlow = new Promise(resolve => 
    setTimeout(() => resolve("Slow success"), 300)
);

Promise.any([rejectFast, succeedSlow])
    .then(result => {
        document.write(`Promise.any() succeeded: ${result}<br>`);
    })
    .catch(error => {
        document.write(`Promise.any() all failed: ${error.errors.length} errors<br>`);
    });

// 5. Promise.resolve() and Promise.reject()
document.write("<br>5. Promise.resolve() and Promise.reject():<br>");

const resolved = Promise.resolve("Immediate resolution");
const rejected = Promise.reject(new Error("Immediate rejection"));

resolved.then(value => document.write(`Resolved: ${value}<br>`));
rejected.catch(error => document.write(`Rejected: ${error.message}<br>`));

// ========== ASYNC/AWAIT SYNTAX ==========

document.write("<br><strong>Async/Await Syntax:</strong><br>");

// async function always returns a promise
async function fetchData() {
    return "Data from async function";
}

// Using async function
fetchData().then(result => {
    document.write(`Async function result: ${result}<br>`);
});

// await pauses execution until promise settles
async function getUserData() {
    try {
        document.write("Fetching user data with async/await...<br>");
        
        // await can only be used inside async functions
        const user = await getUser(456);
        document.write(`User: ${user.name}<br>`);
        
        const posts = await getPosts(user.id);
        document.write(`Posts: ${posts.length}<br>`);
        
        const comments = await getComments(posts[0].id);
        document.write(`Comments: ${comments.length}<br>`);
        
        return { user, posts, comments };
    } catch (error) {
        document.write(`Error in async/await: ${error.message}<br>`);
        throw error; // Re-throw if needed
    }
}

// Call the async function
getUserData().then(data => {
    document.write("Async/await chain completed!<br>");
});

// Async function expression
const fetchWithDelay = async (delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Waited ${delay}ms`;
};

fetchWithDelay(200).then(result => {
    document.write(`Async expression: ${result}<br>`);
});

// ========== ERROR HANDLING WITH ASYNC/AWAIT ==========

document.write("<br><strong>Error Handling with Async/Await:</strong><br>");

async function exampleWithErrors() {
    try {
        // This will throw an error
        const result = await Promise.reject(new Error("Intentional error"));
        document.write("This won't run<br>");
        return result;
    } catch (error) {
        document.write(`Caught error: ${error.message}<br>`);
        return "Fallback value";
    } finally {
        document.write("Finally block executed<br>");
    }
}

exampleWithErrors().then(result => {
    document.write(`Function returned: ${result}<br>`);
});

// Error handling without try-catch (returning rejected promise)
async function exampleWithoutTryCatch() {
    const result = await Promise.reject(new Error("Unhandled error"));
    return result; // This never runs
}

exampleWithoutTryCatch().catch(error => {
    document.write(`Caught outside: ${error.message}<br>`);
});

// ========== ADVANCED PROMISE PATTERNS ==========

document.write("<br><strong>Advanced Promise Patterns:</strong><br>");

// 1. Promise cancellation pattern
function cancellablePromise(executor) {
    let cancel;
    const promise = new Promise((resolve, reject) => {
        cancel = (reason) => reject(new Error(reason || "Cancelled"));
        executor(resolve, reject);
    });
    
    return { promise, cancel };
}

document.write("1. Cancellable promise pattern:<br>");
const { promise: longPromise, cancel: cancelLong } = cancellablePromise((resolve) => {
    setTimeout(() => resolve("Long operation"), 1000);
});

longPromise
    .then(result => document.write(`Long operation: ${result}<br>`))
    .catch(error => document.write(`Cancelled: ${error.message}<br>`));

// Cancel after 300ms
setTimeout(() => {
    cancelLong("User cancelled");
}, 300);

// 2. Promise timeout pattern
function promiseWithTimeout(promise, timeout, timeoutMessage = "Timeout") {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeout);
    });
    
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
    });
}

document.write("<br>2. Promise with timeout:<br>");
const slowOperation = new Promise(resolve => {
    setTimeout(() => resolve("Slow result"), 1000);
});

promiseWithTimeout(slowOperation, 500, "Operation timed out")
    .then(result => document.write(`Result: ${result}<br>`))
    .catch(error => document.write(`Error: ${error.message}<br>`));

// 3. Promise retry pattern
function retryOperation(operation, retries = 3, delay = 100) {
    return new Promise((resolve, reject) => {
        function attempt(remainingRetries) {
            operation()
                .then(resolve)
                .catch(error => {
                    if (remainingRetries === 0) {
                        reject(error);
                    } else {
                        document.write(`Retry ${4 - remainingRetries}/3...<br>`);
                        setTimeout(() => attempt(remainingRetries - 1), delay);
                    }
                });
        }
        
        attempt(retries);
    });
}

document.write("<br>3. Promise retry pattern:<br>");
let attempts = 0;
const unreliableOperation = () => {
    attempts++;
    return new Promise((resolve, reject) => {
        if (attempts >= 3) {
            resolve("Succeeded on attempt " + attempts);
        } else {
            reject(new Error("Failed on attempt " + attempts));
        }
    });
};

retryOperation(unreliableOperation, 3, 200)
    .then(result => document.write(`Final: ${result}<br>`))
    .catch(error => document.write(`Failed after retries: ${error.message}<br>`));

// ========== PROMISE AND ASYNC BEST PRACTICES ==========

document.write("<br><strong>Promise and Async Best Practices:</strong><br>");

// 1. Always return promises from then() handlers
document.write("1. Always return from then() handlers:<br>");
Promise.resolve(10)
    .then(value => {
        document.write(`Value: ${value}<br>`);
        return value * 2; // Important to return!
    })
    .then(value => {
        document.write(`Doubled: ${value}<br>`);
    });

// 2. Avoid promise anti-patterns
document.write("<br>2. Avoid promise anti-patterns:<br>");

// Anti-pattern: Creating promises unnecessarily
// BAD: new Promise(resolve => resolve(someValue))
// GOOD: Promise.resolve(someValue)

// Anti-pattern: Nested promises (promise hell)
// BAD: promise.then(x => { promise2.then(y => { ... }) })
// GOOD: promise.then(x => promise2).then(y => ...)

// 3. Handle errors at appropriate levels
document.write("<br>3. Handle errors appropriately:<br>");

async function exampleErrorHandling() {
    try {
        const result = await Promise.reject(new Error("Step 1 failed"));
        return result;
    } catch (error) {
        // Local recovery
        document.write(`Recovered locally: ${error.message}<br>`);
        return "fallback";
    }
}

exampleErrorHandling().then(result => {
    document.write(`Final result: ${result}<br>`);
});

// 4. Use Promise.all() for parallel operations
document.write("<br>4. Use Promise.all() for parallel operations:<br>");

async function parallelOperations() {
    const [user, settings, notifications] = await Promise.all([
        getUser(1),
        Promise.resolve({ theme: "dark" }),
        Promise.resolve([{ id: 1, text: "Hello" }])
    ]);
    
    document.write(`Parallel: ${user.name}, ${settings.theme}, ${notifications.length} notifications<br>`);
}

parallelOperations();

// 5. Avoid mixing async/await and .then/.catch unnecessarily
document.write("<br>5. Prefer consistent style (all async/await or all promises):<br>");

// Mixed (not ideal):
// async function mixedStyle() {
//     const user = await getUser(1);
//     return user.then(u => u.name);
// }

// Consistent async/await (better):
async function consistentAsync() {
    const user = await getUser(1);
    const name = user.name;
    return name;
}

// Consistent promises (also good):
function consistentPromises() {
    return getUser(1).then(user => user.name);
}

// ========== REAL-WORLD EXAMPLE ==========

document.write("<br><strong>Real-World Example: API Integration:</strong><br>");

// Simulate API functions
const api = {
    login: (credentials) => 
        new Promise(resolve => setTimeout(() => 
            resolve({ token: "abc123", user: { id: 1, name: "John" } }), 300)),
    
    getUserProfile: (token) => 
        new Promise(resolve => setTimeout(() => 
            resolve({ email: "john@example.com", role: "admin" }), 200)),
    
    getUserOrders: (userId) => 
        new Promise(resolve => setTimeout(() => 
            resolve([{ id: 1, total: 100 }, { id: 2, total: 200 }]), 400))
};

// Complete workflow using async/await
async function userWorkflow(credentials) {
    try {
        // 1. Login
        document.write("Logging in...<br>");
        const loginResult = await api.login(credentials);
        document.write(`Logged in as: ${loginResult.user.name}<br>`);
        
        // 2. Get profile (parallel with orders)
        document.write("Fetching profile and orders...<br>");
        const [profile, orders] = await Promise.all([
            api.getUserProfile(loginResult.token),
            api.getUserOrders(loginResult.user.id)
        ]);
        
        document.write(`Email: ${profile.email}<br>`);
        document.write(`Orders: ${orders.length} (Total: $${orders.reduce((sum, o) => sum + o.total, 0)})<br>`);
        
        return { user: loginResult.user, profile, orders };
    } catch (error) {
        document.write(`Workflow error: ${error.message}<br>`);
        throw error;
    }
}

// Execute the workflow
setTimeout(() => {
    document.write("<br>Starting user workflow...<br>");
    userWorkflow({ username: "john", password: "secret" })
        .then(data => {
            document.write("Workflow completed successfully!<br>");
        })
        .catch(() => {
            document.write("Workflow failed<br>");
        });
}, 1000);