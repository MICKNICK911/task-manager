/**
 * ERROR HANDLING IN JAVASCRIPT
 * 
 * Proper error handling is crucial for building robust applications.
 * JavaScript provides several mechanisms for handling errors.
 * 
 * Topics covered:
 * - Error types and creation
 * - try/catch/finally blocks
 * - throw statement
 * - Custom error classes
 * - Error handling in promises/async
 * - Global error handling
 * - Debugging techniques
 * - Best practices
 */

document.write("<h3>16. Error Handling</h3>");

// ========== ERROR TYPES ==========

document.write("<strong>Built-in Error Types:</strong><br>");

// Creating different types of errors
try {
    // 1. Error (generic)
    throw new Error("Generic error message");
} catch (err) {
    document.write(`1. Error: ${err.name} - ${err.message}<br>`);
}

try {
    // 2. SyntaxError
    eval("alert('Hello"); // Missing closing quote and parenthesis
} catch (err) {
    document.write(`2. SyntaxError: ${err.name}<br>`);
}

try {
    // 3. TypeError
    null.someProperty;
} catch (err) {
    document.write(`3. TypeError: ${err.name} - ${err.message}<br>`);
}

try {
    // 4. ReferenceError
    console.log(undefinedVariable);
} catch (err) {
    document.write(`4. ReferenceError: ${err.name} - ${err.message}<br>`);
}

try {
    // 5. RangeError
    const arr = new Array(-1);
} catch (err) {
    document.write(`5. RangeError: ${err.name} - ${err.message}<br>`);
}

try {
    // 6. URIError
    decodeURIComponent('%');
} catch (err) {
    document.write(`6. URIError: ${err.name} - ${err.message}<br>`);
}

try {
    // 7. EvalError (rarely used nowadays)
    throw new EvalError("Eval error");
} catch (err) {
    document.write(`7. EvalError: ${err.name}<br>`);
}

// ========== TRY/CATCH/FINALLY ==========

document.write("<br><strong>try/catch/finally Blocks:</strong><br>");

// Basic try-catch
document.write("1. Basic try-catch:<br>");
try {
    const result = riskyOperation();
    document.write(`Result: ${result}<br>`);
} catch (error) {
    document.write(`Caught error: ${error.message}<br>`);
}

function riskyOperation() {
    if (Math.random() > 0.5) {
        throw new Error("Operation failed randomly");
    }
    return "Success!";
}

// try-catch-finally
document.write("<br>2. try-catch-finally:<br>");
let counter = 0;
try {
    counter++;
    document.write(`Try block: counter = ${counter}<br>`);
    throw new Error("Forced error");
} catch (error) {
    counter++;
    document.write(`Catch block: counter = ${counter}, error: ${error.message}<br>`);
} finally {
    counter++;
    document.write(`Finally block: counter = ${counter} (always executes)<br>`);
}

// Nested try-catch
document.write("<br>3. Nested try-catch:<br>");
try {
    document.write("Outer try block<br>");
    
    try {
        document.write("Inner try block<br>");
        throw new Error("Inner error");
    } catch (innerError) {
        document.write(`Caught inner error: ${innerError.message}<br>`);
        throw new Error("Rethrowing from inner catch");
    } finally {
        document.write("Inner finally block<br>");
    }
    
} catch (outerError) {
    document.write(`Caught outer error: ${outerError.message}<br>");
} finally {
    document.write("Outer finally block<br>");
}

// ========== THROW STATEMENT ==========

document.write("<br><strong>throw Statement:</strong><br>");

// Throwing different types
function validateNumber(num) {
    if (typeof num !== 'number') {
        throw new TypeError("Input must be a number");
    }
    
    if (num < 0) {
        throw new RangeError("Number must be non-negative");
    }
    
    if (num === 0) {
        throw new Error("Zero is not allowed");
    }
    
    return num * 2;
}

// Test validation function
document.write("Testing validateNumber():<br>");
const testCases = [5, -3, 0, "text"];

testCases.forEach(input => {
    try {
        const result = validateNumber(input);
        document.write(`validateNumber(${input}) = ${result}<br>`);
    } catch (error) {
        document.write(`validateNumber(${input}) threw ${error.name}: ${error.message}<br>`);
    }
});

// Throwing non-Error objects (not recommended but possible)
document.write("<br>Throwing non-Error objects (not recommended):<br>");
try {
    throw "String error"; // Not an Error object
} catch (err) {
    document.write(`Caught: ${err} (type: ${typeof err})<br>`);
}

try {
    throw { code: 500, message: "Custom object error" };
} catch (err) {
    document.write(`Caught object: ${err.code} - ${err.message}<br>`);
}

// ========== CUSTOM ERROR CLASSES ==========

document.write("<br><strong>Custom Error Classes:</strong><br>");

// Basic custom error
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
        this.timestamp = new Date();
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            field: this.field,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }
}

// More specific custom errors
class RequiredFieldError extends ValidationError {
    constructor(field) {
        super(`Field '${field}' is required`, field);
        this.name = "RequiredFieldError";
    }
}

class InvalidFormatError extends ValidationError {
    constructor(field, format) {
        super(`Field '${field}' must match format: ${format}`, field);
        this.name = "InvalidFormatError";
        this.format = format;
    }
}

// Using custom errors
function validateUser(user) {
    if (!user.name) {
        throw new RequiredFieldError("name");
    }
    
    if (!user.email || !user.email.includes("@")) {
        throw new InvalidFormatError("email", "valid email address");
    }
    
    if (user.age && (user.age < 0 || user.age > 150)) {
        throw new ValidationError("Age must be between 0 and 150", "age");
    }
    
    return true;
}

// Test custom errors
document.write("Testing custom error classes:<br>");
const testUsers = [
    {},
    { name: "Alice" },
    { name: "Bob", email: "invalid-email" },
    { name: "Charlie", email: "charlie@example.com", age: 200 }
];

testUsers.forEach((user, index) => {
    try {
        validateUser(user);
        document.write(`User ${index}: Valid<br>`);
    } catch (error) {
        if (error instanceof ValidationError) {
            document.write(`User ${index}: ${error.name} - ${error.message}<br>`);
        } else {
            document.write(`User ${index}: Unexpected error - ${error.message}<br>`);
        }
    }
});

// ========== ERROR HANDLING IN PROMISES ==========

document.write("<br><strong>Error Handling in Promises:</strong><br>");

// Promise.catch()
document.write("1. Promise.catch():<br>");
const promiseWithError = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error("Promise rejected"));
    }, 100);
});

promiseWithError
    .then(result => document.write(`Success: ${result}<br>`))
    .catch(error => document.write(`Caught: ${error.message}<br>`));

// Async/await with try-catch
document.write("<br>2. Async/await with try-catch:<br>");

async function fetchData() {
    try {
        // Simulate API call
        const response = await new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 
                    ? resolve({ data: "Sample data" })
                    : reject(new Error("API request failed"));
            }, 200);
        });
        
        document.write(`Data fetched: ${response.data}<br>`);
        return response.data;
    } catch (error) {
        document.write(`Fetch error: ${error.message}<br>`);
        throw error; // Re-throw to let caller handle it
    }
}

// Call async function
setTimeout(() => {
    fetchData().catch(() => {
        document.write("Async function call also caught the error<br>");
    });
}, 300);

// Promise.all() error handling
document.write("<br>3. Promise.all() error handling:<br>");
const promises = [
    Promise.resolve("Task 1"),
    Promise.reject(new Error("Task 2 failed")),
    Promise.resolve("Task 3")
];

Promise.all(promises)
    .then(results => {
        document.write(`All succeeded: ${results}<br>`);
    })
    .catch(error => {
        document.write(`Promise.all caught: ${error.message} (fails fast)<br>`);
    });

// Promise.allSettled() - doesn't fail fast
document.write("<br>4. Promise.allSettled() (ES2020):<br>");
Promise.allSettled(promises)
    .then(results => {
        document.write("Promise.allSettled results:<br>");
        results.forEach((result, i) => {
            document.write(`  Task ${i}: ${result.status} - ${result.value || result.reason.message}<br>`);
        });
    });

// ========== GLOBAL ERROR HANDLING ==========

document.write("<br><strong>Global Error Handling:</strong><br>");

// Global error handler (browser)
window.onerror = function(message, source, lineno, colno, error) {
    document.write(`Global error: ${message} at ${source}:${lineno}:${colno}<br>`);
    if (error) {
        document.write(`Error stack: ${error.stack.substring(0, 100)}...<br>`);
    }
    return true; // Prevent default browser error handling
};

// Unhandled promise rejection handler
window.onunhandledrejection = function(event) {
    document.write(`Unhandled promise rejection: ${event.reason.message}<br>`);
    event.preventDefault(); // Prevent browser warning
};

// Test global handlers
setTimeout(() => {
    document.write("<br>Testing global error handlers:<br>");
    
    // This will trigger window.onerror
    // setTimeout(() => { undefinedVariable; }, 10);
    
    // This will trigger onunhandledrejection
    const unhandledPromise = new Promise((resolve, reject) => {
        reject(new Error("Unhandled promise rejection"));
    });
    // Note: Not catching the promise rejection
}, 500);

// ========== ERROR OBJECT PROPERTIES ==========

document.write("<br><strong>Error Object Properties:</strong><br>");

// Create an error and examine its properties
const sampleError = new Error("Sample error for demonstration");
sampleError.code = "CUSTOM_CODE";
sampleError.details = { userId: 123, action: "login" };

document.write("Error properties:<br>");
document.write(`- name: ${sampleError.name}<br>`);
document.write(`- message: ${sampleError.message}<br>`);
document.write(`- stack: ${sampleError.stack ? "Exists (length: " + sampleError.stack.length + ")" : "None"}<br>`);
document.write(`- custom code: ${sampleError.code}<br>`);
document.write(`- custom details: ${JSON.stringify(sampleError.details)}<br>`);

// Stack trace example
function functionA() {
    functionB();
}

function functionB() {
    functionC();
}

function functionC() {
    const error = new Error("Stack trace example");
    document.write("<br>Stack trace example (first 2 lines):<br>");
    const stackLines = error.stack.split('\n').slice(0, 3);
    stackLines.forEach(line => {
        document.write(line + "<br>");
    });
}

functionA();

// ========== DEBUGGING TECHNIQUES ==========

document.write("<br><strong>Debugging Techniques:</strong><br>");

// 1. console methods
document.write("1. Console debugging methods:<br>");
document.write("console.log(), console.error(), console.warn()<br>");
document.write("console.table(), console.group(), console.trace()<br>");

// Create sample data for console.table
const users = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
    { id: 3, name: "Charlie", age: 35 }
];

// In real browser console, this would show a table
document.write("console.table(users) would display a table in console<br>");

// 2. Debugger statement
document.write("<br>2. debugger statement:<br>");
document.write("// Execution pauses here if DevTools is open<br>");
document.write("debugger;<br>");
// debugger; // Uncomment to test

// 3. Performance timing
document.write("<br>3. Performance timing:<br>");
console.time("operation");
// Simulate some work
for (let i = 0; i < 1000000; i++) {
    Math.sqrt(i);
}
console.timeEnd("operation");
document.write("Check console for timing results<br>");

// 4. Assertions
document.write("<br>4. Assertions:<br>");
function divide(a, b) {
    console.assert(b !== 0, "Division by zero attempted");
    return a / b;
}

divide(10, 2); // OK
divide(10, 0); // Will show assertion error in console

// ========== ERROR RECOVERY STRATEGIES ==========

document.write("<br><strong>Error Recovery Strategies:</strong><br>");

// 1. Retry pattern
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            document.write(`Attempt ${i + 1}/${retries}...<br>`);
            // Simulate fetch
            const response = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    Math.random() > 0.7 
                        ? resolve({ data: "Success!" })
                        : reject(new Error("Network error"));
                }, 100);
            });
            
            return response.data;
        } catch (error) {
            if (i === retries - 1) throw error;
            // Wait before retry (exponential backoff)
            await new Promise(r => setTimeout(r, 100 * Math.pow(2, i)));
        }
    }
}

setTimeout(async () => {
    try {
        const result = await fetchWithRetry("/api/data", 3);
        document.write(`Fetch succeeded: ${result}<br>`);
    } catch (error) {
        document.write(`All retries failed: ${error.message}<br>`);
    }
}, 600);

// 2. Fallback values
document.write("<br>2. Fallback values:<br>");
function getConfigValue(key, fallback) {
    try {
        // Simulate config access that might fail
        if (Math.random() > 0.5) {
            throw new Error("Config not found");
        }
        return "actual-value";
    } catch (error) {
        document.write(`Using fallback for ${key}: ${fallback}<br>`);
        return fallback;
    }
}

const timeout = getConfigValue("timeout", 5000);
document.write(`Timeout value: ${timeout}<br>`);

// 3. Graceful degradation
document.write("<br>3. Graceful degradation:<br>");
function advancedFeature() {
    try {
        // Check if feature is supported
        if (!window.AdvancedAPI) {
            throw new Error("Advanced API not supported");
        }
        
        // Use advanced feature
        return "Advanced feature used";
    } catch (error) {
        // Fall back to basic implementation
        document.write(`Advanced feature not available: ${error.message}<br>`);
        return "Basic feature used";
    }
}

document.write(advancedFeature() + "<br>");

// ========== ERROR LOGGING ==========

document.write("<br><strong>Error Logging:</strong><br>");

// Simple logging function
const errorLogger = {
    logs: [],
    
    log(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            userAgent: navigator.userAgent
        };
        
        this.logs.push(logEntry);
        document.write(`Error logged: ${error.name} - ${error.message}<br>`);
        
        // In real app, send to server
        // this.sendToServer(logEntry);
    },
    
    sendToServer(logEntry) {
        // Simulate sending to server
        document.write(`[Simulated] Sending error to server: ${logEntry.error.name}<br>`);
    },
    
    getRecentLogs(limit = 5) {
        return this.logs.slice(-limit);
    }
};

// Test logging
try {
    throw new ValidationError("Test validation error", "email");
} catch (error) {
    errorLogger.log(error, { userId: 123, action: "login" });
}

// ========== ERROR HANDLING BEST PRACTICES ==========

document.write("<br><strong>Error Handling Best Practices:</strong><br>");

document.write("1. Always use Error objects (not strings or other types)<br>");
document.write("2. Create custom error classes for different error types<br>");
document.write("3. Don't swallow errors silently (unless intentional)<br>");
document.write("4. Use try-catch for synchronous code, .catch() for promises<br>");
document.write("5. Handle errors at the appropriate level (not too low, not too high)<br>");
document.write("6. Include context in error messages<br>");
document.write("7. Log errors for debugging but show user-friendly messages<br>");
document.write("8. Use finally blocks for cleanup code<br>");
document.write("9. Validate input early to prevent errors<br>");
document.write("10. Implement retry logic for transient errors (network, timeouts)<br>");
document.write("11. Set up global error handlers for uncaught exceptions<br>");
document.write("12. Test error scenarios as part of your test suite<br>");

// Example of good error handling pattern
document.write("<br><strong>Example: Good error handling pattern</strong><br>");

async function processOrder(orderId) {
    try {
        // Validate input
        if (!orderId || typeof orderId !== 'string') {
            throw new ValidationError("Invalid order ID", "orderId");
        }
        
        // Business logic with proper error handling
        const order = await fetchOrder(orderId);
        const payment = await processPayment(order);
        const confirmation = await sendConfirmation(order, payment);
        
        return confirmation;
        
    } catch (error) {
        // Log error with context
        errorLogger.log(error, { orderId, step: "processOrder" });
        
        // Re-throw with more context if needed
        if (error instanceof ValidationError) {
            throw error; // Already has good context
        }
        
        // Transform technical errors to user-friendly ones
        if (error.message.includes("network")) {
            throw new Error("Unable to process order. Please check your connection.");
        }
        
        if (error.message.includes("timeout")) {
            throw new Error("Request timed out. Please try again.");
        }
        
        // Generic fallback
        throw new Error("An error occurred while processing your order.");
    }
}

// Mock functions
async function fetchOrder(id) {
    return { id, amount: 100 };
}

async function processPayment(order) {
    return { success: true, transactionId: "txn_123" };
}

async function sendConfirmation(order, payment) {
    return { sent: true, orderId: order.id };
}

// Test the pattern
setTimeout(async () => {
    try {
        const result = await processOrder("order-123");
        document.write(`Order processed: ${JSON.stringify(result)}<br>`);
    } catch (error) {
        document.write(`Order processing failed: ${error.message}<br>`);
    }
}, 700);