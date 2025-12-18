/**
 * LOOPS IN JAVASCRIPT
 * 
 * Loops allow executing a block of code multiple times.
 * 
 * Types of loops:
 * 1. for - loops through a block of code a number of times
 * 2. while - loops through a block while condition is true
 * 3. do-while - loops once, then repeats while condition is true
 * 4. for...in - loops through object properties
 * 5. for...of - loops through iterable values
 * 6. Array iteration methods (forEach, map, filter, etc.)
 */

document.write("<h3>5. Loops</h3>");

// ========== FOR LOOP ==========

document.write("<strong>for Loop:</strong><br>");

document.write("Counting 1 to 5: ");
for (let i = 1; i <= 5; i++) {
    document.write(i + " ");
}
document.write("<br>");

document.write("Counting down 5 to 1: ");
for (let i = 5; i >= 1; i--) {
    document.write(i + " ");
}
document.write("<br>");

document.write("Even numbers 0 to 10: ");
for (let i = 0; i <= 10; i += 2) {
    document.write(i + " ");
}
document.write("<br>");

// Multiple variables in for loop
document.write("Multiple variables: ");
for (let i = 0, j = 10; i <= j; i++, j--) {
    document.write("[" + i + "," + j + "] ");
}
document.write("<br>");

// Infinite loop (commented out for safety)
// for (;;) {
//     document.write("This would run forever<br>");
// }

// ========== WHILE LOOP ==========

document.write("<br><strong>while Loop:</strong><br>");

document.write("Count to 5 with while: ");
let count = 1;
while (count <= 5) {
    document.write(count + " ");
    count++;
}
document.write("<br>");

// while loop with condition check at start
let attempts = 0;
const maxAttempts = 3;
document.write("Login attempts: ");
while (attempts < maxAttempts) {
    attempts++;
    document.write("Attempt " + attempts + " ");
}
document.write("<br>");

// while with break
let randomNumber;
document.write("Finding random number > 0.8: ");
while (true) {
    randomNumber = Math.random();
    if (randomNumber > 0.8) {
        document.write("Found: " + randomNumber.toFixed(2));
        break;
    }
}
document.write("<br>");

// ========== DO-WHILE LOOP ==========

document.write("<br><strong>do-while Loop:</strong><br>");

// do-while always executes at least once
let userInput;
let validInput = false;
document.write("Input validation (do-while): ");

do {
    // Simulating getting user input
    userInput = Math.random(); // Random number 0-1
    document.write("Trying: " + userInput.toFixed(2) + " ");
    
    if (userInput > 0.5) {
        validInput = true;
        document.write("(Valid!) ");
    }
} while (!validInput);
document.write("<br>");

// Another example
let counter = 10;
document.write("Countdown with do-while: ");
do {
    document.write(counter + " ");
    counter--;
} while (counter > 0);
document.write("<br>");

// ========== FOR...IN LOOP ==========

document.write("<br><strong>for...in Loop (for objects):</strong><br>");

const person = {
    name: "Alice",
    age: 30,
    occupation: "Developer",
    city: "New York"
};

document.write("Person object properties: ");
for (let key in person) {
    document.write(key + ": " + person[key] + " | ");
}
document.write("<br>");

// for...in with arrays (not recommended - use for...of instead)
const colors = ["red", "green", "blue"];
document.write("Array indices with for...in: ");
for (let index in colors) {
    document.write(index + ":" + colors[index] + " ");
}
document.write("<br>");

// Checking if property belongs to object (not inherited)
document.write("Own properties only: ");
for (let key in person) {
    if (person.hasOwnProperty(key)) {
        document.write(key + " ");
    }
}
document.write("<br>");

// ========== FOR...OF LOOP ==========

document.write("<br><strong>for...of Loop (for iterables):</strong><br>");

// With arrays
const fruits = ["apple", "banana", "orange"];
document.write("Fruits: ");
for (let fruit of fruits) {
    document.write(fruit + " ");
}
document.write("<br>");

// With strings
const message = "Hello";
document.write("Characters in 'Hello': ");
for (let char of message) {
    document.write(char + " ");
}
document.write("<br>");

// With Map
const scores = new Map([
    ["John", 85],
    ["Sarah", 92],
    ["Mike", 78]
]);
document.write("Map entries: ");
for (let [name, score] of scores) {
    document.write(name + "=" + score + " ");
}
document.write("<br>");

// With Set
const uniqueNumbers = new Set([1, 2, 2, 3, 4, 4, 5]);
document.write("Set values: ");
for (let num of uniqueNumbers) {
    document.write(num + " ");
}
document.write("<br>");

// ========== LOOP CONTROL: BREAK AND CONTINUE ==========

document.write("<br><strong>Loop Control with break and continue:</strong><br>");

// break example
document.write("Break at 5: ");
for (let i = 1; i <= 10; i++) {
    if (i === 6) break;
    document.write(i + " ");
}
document.write("<br>");

// continue example
document.write("Skip multiples of 3: ");
for (let i = 1; i <= 10; i++) {
    if (i % 3 === 0) continue;
    document.write(i + " ");
}
document.write("<br>");

// Labeled break
document.write("Labeled break example: ");
outer: for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
        if (i === 2 && j === 2) {
            document.write("[break outer] ");
            break outer;
        }
        document.write("(" + i + "," + j + ") ");
    }
}
document.write("<br>");

// ========== ARRAY ITERATION METHODS ==========

document.write("<br><strong>Array Iteration Methods:</strong><br>");

const numbers = [1, 2, 3, 4, 5];

// forEach
document.write("forEach (doubled): ");
numbers.forEach(num => {
    document.write(num * 2 + " ");
});
document.write("<br>");

// map (creates new array)
document.write("map (squared): " + numbers.map(n => n * n) + "<br>");

// filter
document.write("filter (even numbers): " + numbers.filter(n => n % 2 === 0) + "<br>");

// reduce
document.write("reduce (sum): " + numbers.reduce((sum, n) => sum + n, 0) + "<br>");

// find
document.write("find (first > 3): " + numbers.find(n => n > 3) + "<br>");

// some and every
document.write("some (> 3): " + numbers.some(n => n > 3) + "<br>");
document.write("every (> 0): " + numbers.every(n => n > 0) + "<br>");

// ========== ITERATING OVER OBJECTS ==========

document.write("<br><strong>Iterating Over Objects:</strong><br>");

const car = {
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    color: "blue"
};

// Object.keys()
document.write("Object.keys(): " + Object.keys(car) + "<br>");

// Object.values()
document.write("Object.values(): " + Object.values(car) + "<br>");

// Object.entries()
document.write("Object.entries(): ");
for (let [key, value] of Object.entries(car)) {
    document.write(key + "=" + value + " ");
}
document.write("<br>");

// ========== PERFORMANCE CONSIDERATIONS ==========

document.write("<br><strong>Performance Tips:</strong><br>");

document.write("1. Cache array length in for loops:<br>");
const largeArray = Array(1000).fill(0);
let startTime = performance.now();

// Standard for loop
let sum = 0;
for (let i = 0; i < largeArray.length; i++) {
    sum += largeArray[i];
}
let time1 = performance.now() - startTime;
document.write("Standard for loop: " + time1.toFixed(2) + "ms<br>");

// Cached length
startTime = performance.now();
sum = 0;
for (let i = 0, len = largeArray.length; i < len; i++) {
    sum += largeArray[i];
}
let time2 = performance.now() - startTime;
document.write("Cached length: " + time2.toFixed(2) + "ms<br>");

document.write("2. Use for loops for performance, forEach/map for readability<br>");
document.write("3. Avoid for...in for arrays - use for...of or standard for<br>");