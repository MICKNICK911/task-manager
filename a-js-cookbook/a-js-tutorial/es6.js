/**
 * ES6+ MODERN JAVASCRIPT FEATURES
 * 
 * ECMAScript 2015 (ES6) and later versions introduced many new features.
 * This file covers the most important ES6+ features.
 * 
 * Topics:
 * - let and const
 * - Arrow functions
 * - Template literals
 * - Destructuring
 * - Spread and rest operators
 * - Default parameters
 * - Enhanced object literals
 * - Promises
 * - Classes
 * - Modules
 * - Symbols
 * - Iterators and generators
 * - New built-in methods
 * - Optional chaining
 * - Nullish coalescing
 * - BigInt
 * - Dynamic import
 */

document.write("<h3>9. ES6+ Features</h3>");

// ========== LET AND CONST ==========

document.write("<strong>let and const:</strong><br>");

// Block-scoped variables
{
    let blockScoped = "I'm block scoped";
    const constantValue = "I cannot be reassigned";
    document.write("Inside block: " + blockScoped + "<br>");
}

// blockScoped is not accessible here (outside block)
document.write("Outside block: blockScoped is " + (typeof blockScoped === "undefined" ? "undefined" : "defined") + "<br>");

// Temporal Dead Zone
// console.log(tdzVariable); // Would throw ReferenceError
let tdzVariable = "I'm in TDZ until declared";
document.write("TDZ example: Variable declared after TDZ<br>");

// ========== ARROW FUNCTIONS ==========

document.write("<br><strong>Arrow Functions:</strong><br>");

// Basic syntax
const add = (a, b) => a + b;
document.write("Arrow function: 5 + 3 = " + add(5, 3) + "<br>");

// Single parameter (parentheses optional)
const square = x => x * x;
document.write("Square of 4: " + square(4) + "<br>");

// No parameters
const getPi = () => Math.PI;
document.write("Value of PI: " + getPi() + "<br>");

// Multiple statements (need curly braces and return)
const max = (a, b) => {
    if (a > b) return a;
    return b;
};
document.write("Max of 10 and 20: " + max(10, 20) + "<br>");

// Lexical 'this' binding
function TraditionalClass() {
    this.value = 42;
    
    this.delayedLog = function() {
        setTimeout(function() {
            // 'this' refers to window/global, not TraditionalClass instance
            document.write("Traditional function 'this': " + this.value + " (undefined)<br>");
        }, 10);
    };
    
    this.delayedLogArrow = function() {
        setTimeout(() => {
            // Arrow function inherits 'this' from surrounding scope
            document.write("Arrow function 'this': " + this.value + " (42)<br>");
        }, 10);
    };
}

const instance = new TraditionalClass();
instance.delayedLog();
setTimeout(() => instance.delayedLogArrow(), 20);

// ========== TEMPLATE LITERALS ==========

document.write("<br><strong>Template Literals:</strong><br>");

// Basic interpolation
const userName = "Alice";
const userAge = 30;
const greeting = `Hello, ${userName}! You are ${userAge} years old.`;
document.write(greeting + "<br>");

// Multi-line strings
const multiLine = `
  This is a
  multi-line
  string.
`;
document.write(multiLine + "<br>");

// Expression evaluation
const a = 5, b = 10;
document.write(`Five plus ten is ${a + b}, not ${2 * a + b}.<br>`);

// Tagged templates
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) => {
        const value = values[i] ? `<strong>${values[i]}</strong>` : '';
        return result + str + value;
    }, '');
}

const name = "John";
const age = 25;
const taggedResult = highlight`Hello, ${name}! You are ${age} years old.`;
document.write("Tagged template: " + taggedResult + "<br>");

// ========== DESTRUCTURING ==========

document.write("<br><strong>Destructuring:</strong><br>");

// Array destructuring
const colors = ["red", "green", "blue", "yellow"];
const [firstColor, secondColor, ...restColors] = colors;
document.write(`Array destructuring: ${firstColor}, ${secondColor}, rest: ${restColors}<br>`);

// Object destructuring
const person = { 
    name: "Bob", 
    age: 35, 
    city: "London",
    address: {
        street: "123 Main St",
        zip: "SW1A 1AA"
    }
};
const { name: personName, age: personAge, country = "UK" } = person;
document.write(`Object destructuring: ${personName}, ${personAge}, ${country}<br>`);

// Nested destructuring
const { address: { street, zip } } = person;
document.write(`Nested destructuring: ${street}, ${zip}<br>`);

// Function parameter destructuring
function printUser({ name, age, city = "Unknown" }) {
    document.write(`Function destructuring: ${name}, ${age}, ${city}<br>`);
}
printUser(person);

// ========== SPREAD AND REST OPERATORS ==========

document.write("<br><strong>Spread and Rest Operators:</strong><br>");

// Spread operator for arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
document.write(`Spread arrays: ${combined}<br>`);

// Spread operator for objects (ES2018)
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 }; // b from obj1 will be overwritten
const merged = { ...obj1, ...obj2, d: 5 };
document.write(`Spread objects: ${JSON.stringify(merged)}<br>`);

// Rest operator in function parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}
document.write(`Rest parameters: sum(1,2,3,4,5) = ${sum(1, 2, 3, 4, 5)}<br>`);

// Rest operator in destructuring
const [first, ...others] = [1, 2, 3, 4, 5];
document.write(`Rest in destructuring: first=${first}, others=${others}<br>`);

// ========== DEFAULT PARAMETERS ==========

document.write("<br><strong>Default Parameters:</strong><br>");

function greet(name = "Guest", greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

document.write(`Default params: ${greet()}<br>`);
document.write(`Default params: ${greet("Alice")}<br>`);
document.write(`Default params: ${greet("Bob", "Hi")}<br>`);

// Default parameters can be expressions
function createUser(name, id = Date.now()) {
    return { name, id };
}
document.write(`Expression default: ${JSON.stringify(createUser("Charlie"))}<br>`);

// ========== ENHANCED OBJECT LITERALS ==========

document.write("<br><strong>Enhanced Object Literals:</strong><br>");

// Property value shorthand
const x = 10, y = 20;
const point = { x, y }; // Instead of { x: x, y: y }
document.write(`Property shorthand: ${JSON.stringify(point)}<br>`);

// Method shorthand
const calculator = {
    add(a, b) {  // Instead of add: function(a, b) {...}
        return a + b;
    },
    multiply(a, b) {
        return a * b;
    }
};
document.write(`Method shorthand: 3 * 4 = ${calculator.multiply(3, 4)}<br>`);

// Computed property names
const propName = "dynamicProperty";
const dynamicObj = {
    [propName]: "This is dynamic",
    [`${propName}2`]: "This is also dynamic"
};
document.write(`Computed property: ${dynamicObj.dynamicProperty}<br>`);

// ========== SYMBOLS ==========

document.write("<br><strong>Symbols:</strong><br>");

// Creating symbols
const sym1 = Symbol();
const sym2 = Symbol("description");
const sym3 = Symbol("description"); // Different from sym2 even with same description

document.write(`Symbol: ${sym1.toString()}<br>`);
document.write(`Symbol with description: ${sym2.toString()}<br>`);
document.write(`sym2 === sym3: ${sym2 === sym3} (unique)<br>`);

// Symbols as object properties
const mySymbol = Symbol("id");
const objWithSymbol = {
    [mySymbol]: 123,
    regularProp: "Hello"
};

document.write(`Symbol property: ${objWithSymbol[mySymbol]}<br>`);
document.write(`Symbols in Object.keys(): ${Object.keys(objWithSymbol)} (not enumerable)<br>`);

// Well-known symbols
const iterableObj = {
    [Symbol.iterator]: function*() {
        yield 1;
        yield 2;
        yield 3;
    }
};
document.write(`Symbol.iterator: ${[...iterableObj]}<br>`);

// ========== ITERATORS AND GENERATORS ==========

document.write("<br><strong>Iterators and Generators:</strong><br>");

// Iterators
const myIterable = {
    from: 1,
    to: 5,
    
    [Symbol.iterator]() {
        return {
            current: this.from,
            last: this.to,
            
            next() {
                if (this.current <= this.last) {
                    return { done: false, value: this.current++ };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

document.write("Custom iterator: ");
for (let value of myIterable) {
    document.write(value + " ");
}
document.write("<br>");

// Generators
function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
document.write(`Generator: ${gen.next().value}, ${gen.next().value}, ${gen.next().value}<br>`);

// Infinite generator
function* idGenerator() {
    let id = 1;
    while (true) {
        yield id++;
    }
}

const idGen = idGenerator();
document.write(`ID Generator: ${idGen.next().value}, ${idGen.next().value}, ${idGen.next().value}<br>`);

// ========== NEW BUILT-IN METHODS ==========

document.write("<br><strong>New Built-in Methods:</strong><br>");

// Array methods
const numbers = [1, 2, 3, 4, 5];
document.write(`Array.find(): ${numbers.find(n => n > 3)}<br>`);
document.write(`Array.findIndex(): ${numbers.findIndex(n => n > 3)}<br>`);
document.write(`Array.includes(): ${numbers.includes(3)}<br>`);

// String methods
const str = "Hello World";
document.write(`String.startsWith(): ${str.startsWith("Hello")}<br>`);
document.write(`String.endsWith(): ${str.endsWith("World")}<br>`);
document.write(`String.includes(): ${str.includes("lo W")}<br>`);
document.write(`String.repeat(): ${"Ha".repeat(3)}<br>`);

// Number methods
document.write(`Number.isFinite(): ${Number.isFinite(42)}<br>`);
document.write(`Number.isNaN(): ${Number.isNaN(NaN)}<br>`);
document.write(`Number.isInteger(): ${Number.isInteger(42.0)}<br>`);

// Object methods
const target = {};
Object.assign(target, { a: 1 }, { b: 2 });
document.write(`Object.assign(): ${JSON.stringify(target)}<br>`);

// ========== OPTIONAL CHAINING (ES2020) ==========

document.write("<br><strong>Optional Chaining (?.) (ES2020):</strong><br>");

const user = {
    profile: {
        name: "John",
        address: {
            city: "New York"
        }
    }
};

// Without optional chaining
const city = user && user.profile && user.profile.address && user.profile.address.city;
document.write(`Without optional chaining: ${city}<br>`);

// With optional chaining
const cityEasy = user?.profile?.address?.city;
document.write(`With optional chaining: ${cityEasy}<br>`);

// Optional chaining with function calls
const admin = {
    getName() {
        return "Admin User";
    }
};
document.write(`Optional function call: ${admin.getName?.()}<br>`);
document.write(`Optional function call (non-existent): ${admin.getAge?.() || "Function doesn't exist"}<br>`);

// Optional chaining with array access
const arr = [1, 2, 3];
document.write(`Optional array access: ${arr?.[0]}<br>`);
document.write(`Optional array access (non-existent): ${nonExistentArray?.[0] || "Array doesn't exist"}<br>`);

// ========== NULLISH COALESCING (ES2020) ==========

document.write("<br><strong>Nullish Coalescing (??) (ES2020):</strong><br>");

// Difference between || and ??
const value1 = 0;
const value2 = "";
const value3 = null;
const value4 = undefined;

document.write(`0 || 'default': ${value1 || 'default'}<br>`);
document.write(`0 ?? 'default': ${value1 ?? 'default'}<br>`);

document.write(`"" || 'default': ${value2 || 'default'}<br>`);
document.write(`"" ?? 'default': ${value2 ?? 'default'}<br>`);

document.write(`null || 'default': ${value3 || 'default'}<br>`);
document.write(`null ?? 'default': ${value3 ?? 'default'}<br>`);

// Practical example
const config = {
    timeout: 0, // 0 is a valid timeout value
    retries: null // null means use default
};

const timeout = config.timeout ?? 3000; // 0 (not null/undefined, so keeps 0)
const retries = config.retries ?? 3; // 3 (null, so uses default)
document.write(`Config: timeout=${timeout}, retries=${retries}<br>`);

// ========== BIGINT (ES2020) ==========

document.write("<br><strong>BigInt (ES2020):</strong><br>");

// Creating BigInt
const bigNumber = 9007199254740991n; // n suffix
const bigFromConstructor = BigInt("9007199254740991");
const bigFromNumber = BigInt(Number.MAX_SAFE_INTEGER);

document.write(`BigInt: ${bigNumber}<br>`);
document.write(`BigInt from string: ${bigFromConstructor}<br>`);
document.write(`Max safe integer as BigInt: ${bigFromNumber}<br>`);

// Operations with BigInt
const aBig = 123456789012345678901234567890n;
const bBig = 987654321098765432109876543210n;
document.write(`BigInt addition: ${aBig + bBig}<br>`);

// Cannot mix BigInt and Number
// const mixed = 1n + 2; // TypeError

// ========== DYNAMIC IMPORT ==========

document.write("<br><strong>Dynamic Import:</strong><br>");

// Dynamic import returns a promise
document.write("Dynamic import syntax: import('./module.js')<br>");
document.write("Useful for code splitting and lazy loading<br>");

// Example (commented out since we can't actually import here)
/*
async function loadModule() {
    const module = await import('./someModule.js');
    module.doSomething();
}
*/

// ========== GLOBAL THIS ==========

document.write("<br><strong>globalThis (ES2020):</strong><br>");

// Consistent way to access global object across environments
document.write(`globalThis: ${typeof globalThis}<br>`);
document.write(`In browser: globalThis === window: ${globalThis === window}<br>`);

// ========== PROMISE.ALLSETTLED (ES2020) ==========

document.write("<br><strong>Promise.allSettled() (ES2020):</strong><br>");

// Unlike Promise.all(), allSettled() waits for all promises to settle
const promises = [
    Promise.resolve("Success 1"),
    Promise.reject("Error"),
    Promise.resolve("Success 2")
];

Promise.allSettled(promises).then(results => {
    document.write("Promise.allSettled results:<br>");
    results.forEach((result, index) => {
        document.write(`  Promise ${index}: ${result.status} - ${result.value || result.reason}<br>`);
    });
});

// ========== PRIVATE CLASS FIELDS (ES2022) ==========

document.write("<br><strong>Private Class Fields (ES2022):</strong><br>");

class Counter {
    #count = 0; // Private field
    
    increment() {
        this.#count++;
    }
    
    getCount() {
        return this.#count;
    }
}

const counter = new Counter();
counter.increment();
counter.increment();
document.write(`Private field counter: ${counter.getCount()}<br>`);
// counter.#count = 10; // SyntaxError: Private field

// ========== TOP-LEVEL AWAIT (ES2022) ==========

document.write("<br><strong>Top-level await (ES2022):</strong><br>");
document.write("Allows await at module top level, not just inside async functions<br>");
/*
// Example in module:
const response = await fetch('/api/data');
const data = await response.json();
*/