/**
 * ADVANCED JAVASCRIPT CONCEPTS
 * 
 * This file covers advanced JavaScript concepts that separate
 * intermediate developers from experts.
 * 
 * Topics covered:
 * - Closures and lexical scope
 * - Currying and partial application
 * - Function composition
 * - Memoization
 * - Debouncing and throttling
 * - Prototypal inheritance deep dive
 * - Proxy and Reflect
 * - WeakMap and WeakSet
 * - Generators and Iterators
 * - Metaprogramming
 * - Design patterns in JavaScript
 * - Performance optimization
 */

document.write("<h3>17. Advanced JavaScript Concepts</h3>");

// ========== CLOSURES DEEP DIVE ==========

document.write("<strong>Closures and Lexical Scope:</strong><br>");

// 1. Basic closure
function outerFunction(outerVar) {
    return function innerFunction(innerVar) {
        document.write(`outerVar: ${outerVar}, innerVar: ${innerVar}<br>`);
        return outerVar + innerVar;
    };
}

const closureExample = outerFunction(10);
document.write(`Closure result: ${closureExample(5)}<br>`);

// 2. Closure with private state
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
        },
        reset: function() {
            count = 0;
            return count;
        }
    };
}

const counter = createCounter();
document.write(`Counter: ${counter.getCount()}<br>`);
counter.increment();
counter.increment();
document.write(`Counter after 2 increments: ${counter.getCount()}<br>`);

// 3. Closure in loops (common pitfall)
document.write("<br>Closure in loops (the problem):<br>");
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        document.write(`var i = ${i} (all show 3)<br>`);
    }, 10);
}

// Solution 1: Use let (block scope)
document.write("<br>Solution 1: Using let:<br>");
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        document.write(`let i = ${i}<br>`);
    }, 20);
}

// Solution 2: IIFE (before let was available)
document.write("<br>Solution 2: Using IIFE:<br>");
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(function() {
            document.write(`IIFE i = ${j}<br>`);
        }, 30);
    })(i);
}

// 4. Module pattern with closure
const Module = (function() {
    let privateVar = "I'm private";
    let privateCounter = 0;
    
    function privateMethod() {
        privateCounter++;
        return `Private method called ${privateCounter} times`;
    }
    
    return {
        publicMethod: function() {
            return privateMethod() + `, privateVar: ${privateVar.substring(0, 5)}...`;
        },
        
        anotherPublicMethod: function() {
            return `Public method accessing: ${privateVar.substring(0, 5)}...`;
        }
    };
})();

document.write(`<br>Module pattern: ${Module.publicMethod()}<br>`);

// ========== CURRYING AND PARTIAL APPLICATION ==========

document.write("<br><strong>Currying and Partial Application:</strong><br>");

// 1. Currying: Transforming a function with multiple arguments
// into a sequence of functions each with a single argument
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...args2) {
                return curried.apply(this, args.concat(args2));
            };
        }
    };
}

// Example function to curry
function multiplyThree(a, b, c) {
    return a * b * c;
}

const curriedMultiply = curry(multiplyThree);
document.write(`Curried multiply: ${curriedMultiply(2)(3)(4)}<br>`);
document.write(`Curried multiply (partial): ${curriedMultiply(2, 3)(4)}<br>`);

// 2. Practical currying example
function discount(price, discount) {
    return price * discount;
}

const curriedDiscount = curry(discount);
const tenPercentDiscount = curriedDiscount(0.1);
const twentyPercentDiscount = curriedDiscount(0.2);

document.write(`10% discount on $100: $${tenPercentDiscount(100)}<br>`);
document.write(`20% discount on $100: $${twentyPercentDiscount(100)}<br>`);

// 3. Partial application (similar but different)
function partial(fn, ...presetArgs) {
    return function(...laterArgs) {
        return fn.apply(this, presetArgs.concat(laterArgs));
    };
}

function greet(greeting, name, punctuation) {
    return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, "Hello");
const sayHelloToJohn = partial(greet, "Hello", "John");

document.write(`Partial application: ${sayHello("Alice", "!")}<br>`);
document.write(`More partial: ${sayHelloToJohn("?")}<br>`);

// ========== FUNCTION COMPOSITION ==========

document.write("<br><strong>Function Composition:</strong><br>");

// 1. Basic composition
function compose(...fns) {
    return function(x) {
        return fns.reduceRight((acc, fn) => fn(acc), x);
    };
}

function double(x) { return x * 2; }
function square(x) { return x * x; }
function addFive(x) { return x + 5; }

const composedFunction = compose(addFive, square, double);
document.write(`Compose(double → square → addFive)(3): ${composedFunction(3)}<br>`);

// 2. Pipe (left-to-right composition)
function pipe(...fns) {
    return function(x) {
        return fns.reduce((acc, fn) => fn(acc), x);
    };
}

const pipedFunction = pipe(double, square, addFive);
document.write(`Pipe(double → square → addFive)(3): ${pipedFunction(3)}<br>`);

// 3. Practical composition example
function getUser(id) {
    return { id, name: `User ${id}`, age: 25 + id };
}

function getAge(user) {
    return user.age;
}

function isAdult(age) {
    return age >= 18;
}

const isUserAdult = pipe(getUser, getAge, isAdult);
document.write(`Is user 1 an adult? ${isUserAdult(1)}<br>`);
document.write(`Is user -5 an adult? ${isUserAdult(-5)}<br>`);

// ========== MEMOIZATION ==========

document.write("<br><strong>Memoization:</strong><br>");

// 1. Simple memoization
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            document.write(`Cache hit for args: ${args}<br>`);
            return cache.get(key);
        }
        
        document.write(`Cache miss for args: ${args}<br>`);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Expensive function to memoize
function expensiveCalculation(n) {
    document.write(`Calculating for ${n}...<br>`);
    let result = 0;
    for (let i = 0; i < n * 1000000; i++) {
        result += Math.sqrt(i);
    }
    return result;
}

const memoizedCalculation = memoize(expensiveCalculation);

// First call (computes)
setTimeout(() => {
    document.write(`Result 1: ${memoizedCalculation(5).toFixed(2)}<br>`);
    
    // Second call with same args (cache hit)
    document.write(`Result 2: ${memoizedCalculation(5).toFixed(2)}<br>`);
    
    // Third call with different args (cache miss)
    document.write(`Result 3: ${memoizedCalculation(10).toFixed(2)}<br>`);
}, 10);

// 2. Fibonacci with memoization
const fibonacci = memoize(function(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

document.write(`<br>Fibonacci(10) with memoization: ${fibonacci(10)}<br>`);
document.write(`Fibonacci(20) with memoization: ${fibonacci(20)}<br>`);

// ========== DEBOUNCING AND THROTTLING ==========

document.write("<br><strong>Debouncing and Throttling:</strong><br>");

// 1. Debounce: Execute function only after a delay since last call
function debounce(fn, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 2. Throttle: Execute at most once per interval
function throttle(fn, interval) {
    let lastTime = 0;
    let timeoutId;
    
    return function(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastTime;
        const timeUntilNextCall = interval - timeSinceLastCall;
        
        if (timeSinceLastCall >= interval) {
            // Enough time has passed, execute immediately
            lastTime = now;
            fn.apply(this, args);
        } else if (!timeoutId) {
            // Schedule execution for when interval has passed
            timeoutId = setTimeout(() => {
                lastTime = Date.now();
                timeoutId = null;
                fn.apply(this, args);
            }, timeUntilNextCall);
        }
    };
}

// Create demo elements
const demoContainer = document.createElement('div');
demoContainer.innerHTML = `
    <div style="margin: 10px 0;">
        <button id="debounce-btn">Click me (Debounced - 500ms)</button>
        <span id="debounce-count">0</span> clicks counted
    </div>
    <div style="margin: 10px 0;">
        <button id="throttle-btn">Click me (Throttled - 500ms)</button>
        <span id="throttle-count">0</span> clicks counted
    </div>
`;
document.body.appendChild(demoContainer);

let debounceCount = 0;
let throttleCount = 0;

const debounceButton = document.getElementById('debounce-btn');
const throttleButton = document.getElementById('throttle-btn');
const debounceCountDisplay = document.getElementById('debounce-count');
const throttleCountDisplay = document.getElementById('throttle-count');

// Debounced handler
const debouncedHandler = debounce(() => {
    debounceCount++;
    debounceCountDisplay.textContent = debounceCount;
    document.write(`Debounced click #${debounceCount}<br>`);
}, 500);

// Throttled handler
const throttledHandler = throttle(() => {
    throttleCount++;
    throttleCountDisplay.textContent = throttleCount;
    document.write(`Throttled click #${throttleCount}<br>`);
}, 500);

debounceButton.addEventListener('click', debouncedHandler);
throttleButton.addEventListener('click', throttledHandler);

// ========== PROXY AND REFLECT ==========

document.write("<br><strong>Proxy and Reflect:</strong><br>");

// 1. Basic Proxy
const target = {
    name: "John",
    age: 30
};

const handler = {
    get: function(obj, prop) {
        document.write(`Getting property "${prop}"<br>`);
        if (prop in obj) {
            return obj[prop];
        } else {
            return `Property "${prop}" doesn't exist`;
        }
    },
    
    set: function(obj, prop, value) {
        document.write(`Setting property "${prop}" to "${value}"<br>`);
        
        if (prop === 'age' && typeof value !== 'number') {
            throw new Error("Age must be a number");
        }
        
        if (prop === 'age' && (value < 0 || value > 150)) {
            throw new Error("Age must be between 0 and 150");
        }
        
        obj[prop] = value;
        return true; // Indicate success
    },
    
    has: function(obj, prop) {
        document.write(`Checking if property "${prop}" exists<br>`);
        return prop in obj;
    },
    
    deleteProperty: function(obj, prop) {
        document.write(`Deleting property "${prop}"<br>`);
        if (prop in obj) {
            delete obj[prop];
            return true;
        }
        return false;
    }
};

const proxy = new Proxy(target, handler);

document.write(`proxy.name: ${proxy.name}<br>`);
proxy.age = 31;
document.write(`proxy.age after update: ${proxy.age}<br>`);
document.write(`'name' in proxy: ${'name' in proxy}<br>`);
document.write(`'salary' in proxy: ${'salary' in proxy}<br>`);

// 2. Proxy for validation
const validator = {
    set: function(obj, prop, value) {
        if (prop === 'email' && !value.includes('@')) {
            throw new Error('Invalid email address');
        }
        
        if (prop === 'password' && value.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        
        obj[prop] = value;
        return true;
    }
};

const user = new Proxy({}, validator);
try {
    user.email = "valid@example.com";
    document.write(`Valid email set: ${user.email}<br>`);
    
    // This will throw an error
    // user.password = "short";
} catch (error) {
    document.write(`Validation error: ${error.message}<br>`);
}

// 3. Reflect API
document.write("<br>Reflect API examples:<br>");

const obj = { a: 1, b: 2 };
document.write(`Reflect.get(obj, 'a'): ${Reflect.get(obj, 'a')}<br>`);
document.write(`Reflect.set(obj, 'c', 3): ${Reflect.set(obj, 'c', 3)}<br>`);
document.write(`obj.c: ${obj.c}<br>`);
document.write(`Reflect.has(obj, 'b'): ${Reflect.has(obj, 'b')}<br>`);
document.write(`Reflect.deleteProperty(obj, 'a'): ${Reflect.deleteProperty(obj, 'a')}<br>`);
document.write(`obj after delete: ${JSON.stringify(obj)}<br>`);

// ========== WEAKMAP AND WEAKSET ==========

document.write("<br><strong>WeakMap and WeakSet:</strong><br>");

// 1. WeakMap (keys are objects only, weakly referenced)
document.write("WeakMap (keys are objects, garbage collectable):<br>");

let obj1 = { id: 1 };
let obj2 = { id: 2 };
let obj3 = { id: 3 };

const weakMap = new WeakMap();
weakMap.set(obj1, "Data for obj1");
weakMap.set(obj2, "Data for obj2");

document.write(`weakMap.has(obj1): ${weakMap.has(obj1)}<br>`);
document.write(`weakMap.get(obj1): ${weakMap.get(obj1)}<br>`);

// Remove reference to obj1
obj1 = null;
// obj1 is now eligible for garbage collection
// The entry in WeakMap will be automatically removed

// 2. WeakSet (stores objects only, weakly referenced)
document.write("<br>WeakSet (stores objects only):<br>");

const weakSet = new WeakSet();
const item1 = { name: "item1" };
const item2 = { name: "item2" };

weakSet.add(item1);
weakSet.add(item2);

document.write(`weakSet.has(item1): ${weakSet.has(item1)}<br>`);
document.write(`weakSet.has(item2): ${weakSet.has(item2)}<br>`);

weakSet.delete(item1);
document.write(`weakSet.has(item1) after delete: ${weakSet.has(item1)}<br>`);

// 3. Practical use case: Storing private data
const privateData = new WeakMap();

class Person {
    constructor(name, age) {
        // Store private data in WeakMap
        privateData.set(this, {
            name: name,
            age: age,
            ssn: this.generateSSN()
        });
    }
    
    generateSSN() {
        return Math.random().toString(36).substring(2, 11).toUpperCase();
    }
    
    getName() {
        return privateData.get(this).name;
    }
    
    getSSN() {
        return "***-**-" + privateData.get(this).ssn.slice(-4);
    }
    
    getAge() {
        return privateData.get(this).age;
    }
}

const person = new Person("Alice", 30);
document.write(`Person name: ${person.getName()}<br>`);
document.write(`Person SSN (masked): ${person.getSSN()}<br>`);
document.write(`Person age: ${person.getAge()}<br>`);

// Cannot access private data directly
document.write(`person.ssn: ${person.ssn || 'undefined (private)}'<br>`);

// ========== GENERATORS AND ITERATORS ADVANCED ==========

document.write("<br><strong>Generators and Iterators (Advanced):</strong><br>");

// 1. Generator as iterator
function* numberGenerator(limit) {
    for (let i = 1; i <= limit; i++) {
        yield i;
    }
}

document.write("Generator as iterator: ");
const gen = numberGenerator(5);
for (const num of gen) {
    document.write(num + " ");
}
document.write("<br>");

// 2. Two-way communication with generators
function* twoWayGenerator() {
    const name = yield "What is your name?";
    const age = yield `Hello ${name}, how old are you?`;
    return `So you're ${name} and you're ${age} years old.`;
}

const conversation = twoWayGenerator();
document.write(conversation.next().value + "<br>");
document.write(conversation.next("Alice").value + "<br>");
document.write(conversation.next(30).value + "<br>");

// 3. Async generators
async function* asyncNumberGenerator(limit) {
    for (let i = 1; i <= limit; i++) {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));
        yield i;
    }
}

setTimeout(async () => {
    document.write("<br>Async generator: ");
    for await (const num of asyncNumberGenerator(3)) {
        document.write(num + " ");
    }
    document.write("<br>");
}, 100);

// 4. Implementing iterable protocol
class Range {
    constructor(start, end, step = 1) {
        this.start = start;
        this.end = end;
        this.step = step;
    }
    
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        const step = this.step;
        
        return {
            next() {
                if (current <= end) {
                    const value = current;
                    current += step;
                    return { value, done: false };
                }
                return { done: true };
            }
        };
    }
}

document.write("<br>Custom iterable (Range): ");
const range = new Range(1, 5);
for (const num of range) {
    document.write(num + " ");
}
document.write("<br>");

// ========== METAPROGRAMMING ==========

document.write("<br><strong>Metaprogramming:</strong><br>");

// 1. Symbol properties
document.write("1. Symbol properties:<br>");

const sym = Symbol("description");
const objWithSymbol = {
    [sym]: "symbol value",
    regular: "regular value"
};

document.write(`Symbol property: ${objWithSymbol[sym]}<br>`);
document.write(`Symbols in Object.keys(): ${Object.keys(objWithSymbol)}<br>`);
document.write(`Symbols in Object.getOwnPropertySymbols(): ${Object.getOwnPropertySymbols(objWithSymbol).length}<br>`);

// 2. Well-known symbols
class MyCollection {
    constructor(items = []) {
        this.items = items;
    }
    
    [Symbol.iterator]() {
        let index = 0;
        const items = this.items;
        
        return {
            next() {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                return { done: true };
            }
        };
    }
    
    [Symbol.toPrimitive](hint) {
        if (hint === 'string') {
            return `MyCollection with ${this.items.length} items`;
        }
        if (hint === 'number') {
            return this.items.length;
        }
        return true;
    }
    
    [Symbol.toStringTag] = 'MyCollection';
}

const collection = new MyCollection([1, 2, 3]);
document.write(`String coercion: ${String(collection)}<br>`);
document.write(`Number coercion: ${Number(collection)}<br>`);
document.write(`Object toString: ${Object.prototype.toString.call(collection)}<br>`);

// 3. Property descriptors
const metaObj = {};

Object.defineProperty(metaObj, 'readOnlyProp', {
    value: 42,
    writable: false,
    enumerable: true,
    configurable: false
});

Object.defineProperty(metaObj, 'computedProp', {
    get() {
        return this._computed || 0;
    },
    set(value) {
        this._computed = value * 2;
    },
    enumerable: true
});

metaObj.computedProp = 10;
document.write(`Computed property: ${metaObj.computedProp}<br>`);

// ========== DESIGN PATTERNS ==========

document.write("<br><strong>Design Patterns in JavaScript:</strong><br>");

// 1. Observer pattern
class Observable {
    constructor() {
        this.observers = new Set();
    }
    
    subscribe(observer) {
        this.observers.add(observer);
        return () => this.unsubscribe(observer);
    }
    
    unsubscribe(observer) {
        this.observers.delete(observer);
    }
    
    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class Observer {
    constructor(name) {
        this.name = name;
    }
    
    update(data) {
        document.write(`${this.name} received: ${data}<br>`);
    }
}

const observable = new Observable();
const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

const unsubscribe1 = observable.subscribe(observer1);
observable.subscribe(observer2);

observable.notify("Hello observers!");
unsubscribe1();
observable.notify("Second message");

// 2. Factory pattern
class Car {
    constructor(model, year) {
        this.model = model;
        this.year = year;
    }
    
    drive() {
        return `Driving ${this.model} (${this.year})`;
    }
}

class Truck {
    constructor(model, year, payload) {
        this.model = model;
        this.year = year;
        this.payload = payload;
    }
    
    drive() {
        return `Driving truck ${this.model} with ${this.payload} ton payload`;
    }
}

class VehicleFactory {
    static createVehicle(type, ...args) {
        switch(type.toLowerCase()) {
            case 'car':
                return new Car(...args);
            case 'truck':
                return new Truck(...args);
            default:
                throw new Error(`Unknown vehicle type: ${type}`);
        }
    }
}

const myCar = VehicleFactory.createVehicle('car', 'Toyota', 2022);
const myTruck = VehicleFactory.createVehicle('truck', 'Ford', 2021, 2.5);

document.write(`Factory pattern: ${myCar.drive()}<br>`);
document.write(`Factory pattern: ${myTruck.drive()}<br>`);

// 3. Strategy pattern
class PaymentStrategy {
    pay(amount) {
        throw new Error("Method not implemented");
    }
}

class CreditCardPayment extends PaymentStrategy {
    pay(amount) {
        return `Paid $${amount} using Credit Card`;
    }
}

class PayPalPayment extends PaymentStrategy {
    pay(amount) {
        return `Paid $${amount} using PayPal`;
    }
}

class ShoppingCart {
    constructor(paymentStrategy) {
        this.items = [];
        this.paymentStrategy = paymentStrategy;
    }
    
    addItem(item, price) {
        this.items.push({ item, price });
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }
    
    checkout() {
        const total = this.getTotal();
        return this.paymentStrategy.pay(total);
    }
}

const cart1 = new ShoppingCart(new CreditCardPayment());
cart1.addItem("Book", 25);
cart1.addItem("Pen", 5);
document.write(`Strategy pattern: ${cart1.checkout()}<br>`);

const cart2 = new ShoppingCart(new PayPalPayment());
cart2.addItem("Laptop", 999);
document.write(`Strategy pattern: ${cart2.checkout()}<br>`);

// ========== PERFORMANCE OPTIMIZATION ==========

document.write("<br><strong>Performance Optimization:</strong><br>");

// 1. Avoid unnecessary DOM manipulation
document.write("1. Batch DOM updates:<br>");
document.write("- Use documentFragment for multiple inserts<br>");
document.write("- Batch style changes (avoid layout thrashing)<br>");
document.write("- Use requestAnimationFrame for animations<br>");

// 2. Optimize loops
document.write("<br>2. Optimize loops:<br>");

const largeArray = Array(10000).fill(0).map((_, i) => i);

// Slow
document.write("Slow loop (checking length each iteration):<br>");
console.time("slow-loop");
let sum1 = 0;
for (let i = 0; i < largeArray.length; i++) {
    sum1 += largeArray[i];
}
console.timeEnd("slow-loop");

// Fast
document.write("Fast loop (cached length):<br>");
console.time("fast-loop");
let sum2 = 0;
for (let i = 0, len = largeArray.length; i < len; i++) {
    sum2 += largeArray[i];
}
console.timeEnd("fast-loop");

// 3. Use appropriate data structures
document.write("<br>3. Use appropriate data structures:<br>");
document.write("- Set for unique values<br>");
document.write("- Map for key-value pairs (when keys are not strings)<br>");
document.write("- TypedArrays for numeric data<br>");
document.write("- WeakMap/WeakSet for memory-sensitive scenarios<br>");

// 4. Debounce and throttle expensive operations
document.write("<br>4. Debounce/throttle expensive operations:<br>");
document.write("- Resize events<br>");
document.write("- Scroll events<br>");
document.write("- Input events (search suggestions)<br>");
document.write("- Mousemove events<br>");

// 5. Lazy loading
document.write("<br>5. Lazy loading:<br>");
document.write("- Images (loading='lazy' attribute)<br>");
document.write("- Code splitting with dynamic imports<br>");
document.write("- Virtual scrolling for large lists<br>");

// 6. Memory management
document.write("<br>6. Memory management:<br>");
document.write("- Remove event listeners when elements are removed<br>");
document.write("- Clear intervals/timeouts when no longer needed<br>");
document.write("- Use WeakMap/WeakSet for caches<br>");
document.write("- Avoid memory leaks with closures<br>");

// Clean up demo elements
setTimeout(() => {
    demoContainer.remove();
}, 1000);