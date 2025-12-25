/**
 * FUNCTIONS IN JAVASCRIPT
 * 
 * Functions are reusable blocks of code that perform specific tasks.
 * 
 * Types of function definitions:
 * 1. Function declarations
 * 2. Function expressions
 * 3. Arrow functions (ES6)
 * 4. Constructor functions
 * 5. Generator functions
 * 6. Async functions
 * 
 * Concepts covered:
 * - Parameters and arguments
 * - Return values
 * - Function scope
 * - Closures
 * - Higher-order functions
 * - Recursion
 * - IIFE (Immediately Invoked Function Expressions)
 */

document.write("<h3>6. Functions</h3>");

// ========== FUNCTION DECLARATIONS ==========

document.write("<strong>Function Declarations:</strong><br>");

// Basic function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

document.write(greet("Alice") + "<br>");

// Function with multiple parameters
function add(a, b) {
    return a + b;
}

document.write("5 + 3 = " + add(5, 3) + "<br>");

// Function with default parameters (ES6)
function multiply(a, b = 1) {
    return a * b;
}

document.write("5 * undefined = " + multiply(5) + " (b defaults to 1)<br>");
document.write("5 * 3 = " + multiply(5, 3) + "<br>");

// Function declarations are hoisted
document.write(hoistedFunction() + "<br>"); // Works even though function is defined later

function hoistedFunction() {
    return "This function was hoisted!";
}

// ========== FUNCTION EXPRESSIONS ==========

document.write("<br><strong>Function Expressions:</strong><br>");

// Named function expression
const square = function squareNumber(x) {
    return x * x;
};

document.write("Square of 4: " + square(4) + "<br>");

// Anonymous function expression
const cube = function(x) {
    return x * x * x;
};

document.write("Cube of 3: " + cube(3) + "<br>");

// Function expressions are NOT hoisted
// notHoisted(); // This would cause an error

const notHoisted = function() {
    return "I am not hoisted";
};

document.write(notHoisted() + "<br>");

// ========== ARROW FUNCTIONS (ES6) ==========

document.write("<br><strong>Arrow Functions:</strong><br>");

// Basic arrow function
const greetArrow = (name) => {
    return "Hello, " + name + "!";
};

document.write(greetArrow("Bob") + "<br>");

// Arrow function with implicit return (single expression)
const double = x => x * 2;
document.write("Double 7: " + double(7) + "<br>");

// Arrow function with multiple parameters
const sum = (a, b) => a + b;
document.write("Sum 10 + 15: " + sum(10, 15) + "<br>");

// Arrow function with no parameters
const sayHi = () => "Hi there!";
document.write(sayHi() + "<br>");

// Arrow functions don't have their own 'this'
const person = {
    name: "Charlie",
    regularFunction: function() {
        return "Regular: " + this.name;
    },
    arrowFunction: () => {
        return "Arrow: " + this.name; // 'this' refers to global/window, not person
    }
};

document.write(person.regularFunction() + "<br>");
document.write(person.arrowFunction() + " (this.name is undefined)<br>");

// ========== PARAMETERS AND ARGUMENTS ==========

document.write("<br><strong>Parameters and Arguments:</strong><br>");

// Rest parameters (...)
function sumAll(...numbers) {
    let total = 0;
    for (let num of numbers) {
        total += num;
    }
    return total;
}

document.write("sumAll(1, 2, 3, 4): " + sumAll(1, 2, 3, 4) + "<br>");

// Default parameters
function createUser(name, age = 18, isAdmin = false) {
    return {
        name: name,
        age: age,
        isAdmin: isAdmin
    };
}

document.write("createUser('Dave'): " + JSON.stringify(createUser("Dave")) + "<br>");

// Arguments object (available in regular functions)
function showArguments() {
    document.write("Number of arguments: " + arguments.length + "<br>");
    document.write("Arguments: " + Array.from(arguments) + "<br>");
}

showArguments(1, 2, 3, "hello", true);

// Arrow functions don't have arguments object
const showArgsArrow = (...args) => {
    document.write("Arrow args: " + args + "<br>");
};
showArgsArrow(1, 2, 3);

// ========== HIGHER-ORDER FUNCTIONS ==========

document.write("<br><strong>Higher-Order Functions:</strong><br>");

// Functions that return functions
function createMultiplier(multiplier) {
    return function(x) {
        return x * multiplier;
    };
}

const doubleFunc = createMultiplier(2);
const tripleFunc = createMultiplier(3);

document.write("Double 5: " + doubleFunc(5) + "<br>");
document.write("Triple 5: " + tripleFunc(5) + "<br>");

// Functions that accept functions as arguments
function applyOperation(numbers, operation) {
    return numbers.map(operation);
}

const nums = [1, 2, 3, 4, 5];
document.write("Squared: " + applyOperation(nums, x => x * x) + "<br>");
document.write("Incremented: " + applyOperation(nums, x => x + 1) + "<br>");

// ========== CLOSURES ==========

document.write("<br><strong>Closures:</strong><br>");

// Basic closure example
function outerFunction(outerValue) {
    return function innerFunction(innerValue) {
        return outerValue + innerValue;
    };
}

const addFive = outerFunction(5);
document.write("addFive(10): " + addFive(10) + "<br>");

// Practical closure: Counter
function createCounter() {
    let count = 0;
    
    return {
        increment: function() {
            count++;
            return count;
        },
        decrement: function() {
            count--;
            return count;
        },
        getCount: function() {
            return count;
        }
    };
}

const counter = createCounter();
document.write("Counter: " + counter.getCount() + "<br>");
counter.increment();
counter.increment();
document.write("After 2 increments: " + counter.getCount() + "<br>");

// Module pattern with closure
const calculator = (function() {
    let memory = 0;
    
    return {
        add: function(a, b) {
            return a + b;
        },
        subtract: function(a, b) {
            return a - b;
        },
        store: function(value) {
            memory = value;
        },
        recall: function() {
            return memory;
        }
    };
})();

document.write("Calculator add 5+3: " + calculator.add(5, 3) + "<br>");
calculator.store(100);
document.write("Calculator recall: " + calculator.recall() + "<br>");

// ========== RECURSION ==========

document.write("<br><strong>Recursion:</strong><br>");

// Factorial using recursion
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

document.write("Factorial of 5: " + factorial(5) + "<br>");

// Fibonacci sequence
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

document.write("Fibonacci(7): " + fibonacci(7) + "<br>");

// Recursive array flattening
function flattenArray(arr) {
    let result = [];
    
    for (let item of arr) {
        if (Array.isArray(item)) {
            result = result.concat(flattenArray(item));
        } else {
            result.push(item);
        }
    }
    
    return result;
}

const nested = [1, [2, [3, 4], 5], 6];
document.write("Flattened array: " + flattenArray(nested) + "<br>");

// ========== IIFE (IMMEDIATELY INVOKED FUNCTION EXPRESSIONS) ==========

document.write("<br><strong>IIFE (Immediately Invoked Function Expressions):</strong><br>");

// Basic IIFE
(function() {
    const secret = "This is private";
    document.write("IIFE executed: " + secret + "<br>");
})();

// IIFE with parameters
(function(name) {
    document.write("Hello from IIFE, " + name + "!<br>");
})("Emma");

// IIFE that returns a value
const randomNumber = (function() {
    return Math.random();
})();

document.write("Random number from IIFE: " + randomNumber + "<br>");

// IIFE for creating private scope
const module = (function() {
    let privateVar = "I'm private";
    
    function privateMethod() {
        return "Private method called";
    }
    
    return {
        publicMethod: function() {
            return "Public method can access: " + privateVar;
        },
        anotherPublicMethod: function() {
            return privateMethod();
        }
    };
})();

document.write("Module public method: " + module.publicMethod() + "<br>");

// ========== GENERATOR FUNCTIONS ==========

document.write("<br><strong>Generator Functions:</strong><br>");

function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
document.write("Generator: " + gen.next().value + ", " + 
                         gen.next().value + ", " + 
                         gen.next().value + "<br>");

// Infinite generator
function* infiniteSequence() {
    let i = 0;
    while (true) {
        yield i++;
    }
}

const infiniteGen = infiniteSequence();
document.write("Infinite generator (first 5): ");
for (let i = 0; i < 5; i++) {
    document.write(infiniteGen.next().value + " ");
}
document.write("<br>");

// ========== BEST PRACTICES ==========

document.write("<br><strong>Function Best Practices:</strong><br>");
document.write("1. Use descriptive function names<br>");
document.write("2. Keep functions small and focused (Single Responsibility)<br>");
document.write("3. Limit parameters (3 or fewer is ideal)<br>");
document.write("4. Use default parameters instead of conditionals<br>");
document.write("5. Prefer arrow functions for callbacks<br>");
document.write("6. Avoid side effects when possible (pure functions)<br>");
document.write("7. Use rest parameters for variable arguments<br>");