/**
 * ARRAYS IN JAVASCRIPT
 * 
 * Arrays are ordered collections of values (elements).
 * JavaScript arrays are:
 * - Zero-indexed
 * - Dynamic (can grow/shrink)
 * - Can contain mixed types
 * - Are actually objects with special array features
 * 
 * Covered topics:
 * - Array creation
 * - Accessing and modifying elements
 * - Array methods
 * - Multidimensional arrays
 * - Array destructuring
 * - Array-like objects
 */

document.write("<h3>7. Arrays</h3>");

// ========== ARRAY CREATION ==========

document.write("<strong>Creating Arrays:</strong><br>");

// Array literal (most common)
const fruits = ["apple", "banana", "orange"];
document.write("Array literal: " + fruits + "<br>");

// Array constructor
const numbers = new Array(1, 2, 3, 4, 5);
document.write("Array constructor: " + numbers + "<br>");

// Array of a specific length
const emptyArray = new Array(5); // Creates array with 5 empty slots
document.write("Empty array (length 5): " + emptyArray + "<br>");

// Array.from() - creates from array-like or iterable
const fromString = Array.from("Hello");
document.write("Array.from('Hello'): " + fromString + "<br>");

// Array.of() - creates from arguments
const arrayOf = Array.of(1, 2, 3, 4, 5);
document.write("Array.of(1,2,3,4,5): " + arrayOf + "<br>");

// Mixed type array
const mixed = [1, "hello", true, {name: "John"}, [1, 2, 3]];
document.write("Mixed array: " + mixed + " (objects show as [object Object])<br>");

// ========== ACCESSING AND MODIFYING ELEMENTS ==========

document.write("<br><strong>Accessing and Modifying Elements:</strong><br>");

const colors = ["red", "green", "blue", "yellow", "purple"];

// Access by index
document.write("colors[0]: " + colors[0] + "<br>");
document.write("colors[2]: " + colors[2] + "<br>");

// Last element
document.write("Last element (colors[colors.length - 1]): " + colors[colors.length - 1] + "<br>");

// Modify elements
colors[1] = "emerald";
document.write("After colors[1] = 'emerald': " + colors + "<br>");

// Add new element at the end
colors.push("cyan");
document.write("After push('cyan'): " + colors + "<br>");

// Remove last element
const lastColor = colors.pop();
document.write("After pop(): " + colors + " (removed: " + lastColor + ")<br>");

// Add element at the beginning
colors.unshift("magenta");
document.write("After unshift('magenta'): " + colors + "<br>");

// Remove first element
const firstColor = colors.shift();
document.write("After shift(): " + colors + " (removed: " + firstColor + ")<br>");

// ========== ARRAY LENGTH ==========

document.write("<br><strong>Array Length:</strong><br>");

document.write("colors.length: " + colors.length + "<br>");

// Length is writable - can truncate array
colors.length = 2;
document.write("After colors.length = 2: " + colors + "<br>");

// Can also extend array
colors.length = 5;
document.write("After colors.length = 5: " + colors + " (empty slots added)<br>");

// ========== ARRAY METHODS ==========

document.write("<br><strong>Array Methods:</strong><br>");

const nums = [1, 2, 3, 4, 5];

// 1. Mutating methods (change original array)

// splice() - add/remove elements at any position
const removed = nums.splice(2, 2, 10, 11); // Remove 2 elements at index 2, insert 10, 11
document.write("After splice(2, 2, 10, 11): " + nums + " (removed: " + removed + ")<br>");

// reverse() - reverse array order
nums.reverse();
document.write("After reverse(): " + nums + "<br>");

// sort() - sort array elements
nums.sort((a, b) => a - b); // Numeric sort
document.write("After sort(): " + nums + "<br>");

// 2. Non-mutating methods (return new array)

// slice() - extract portion of array
const sliced = nums.slice(1, 4); // Elements at index 1, 2, 3
document.write("slice(1, 4): " + sliced + " (original unchanged: " + nums + ")<br>");

// concat() - merge arrays
const moreNums = [6, 7, 8];
const combined = nums.concat(moreNums);
document.write("concat([6,7,8]): " + combined + "<br>");

// ========== ITERATION METHODS ==========

document.write("<br><strong>Iteration Methods:</strong><br>");

const items = ["apple", "banana", "cherry", "date"];

// forEach() - execute function for each element
document.write("forEach(): ");
items.forEach(item => document.write(item + " "));
document.write("<br>");

// map() - transform each element
const upperItems = items.map(item => item.toUpperCase());
document.write("map(toUpperCase): " + upperItems + "<br>");

// filter() - select elements based on condition
const longItems = items.filter(item => item.length > 5);
document.write("filter(length > 5): " + longItems + "<br>");

// reduce() - accumulate values
const totalLength = items.reduce((total, item) => total + item.length, 0);
document.write("reduce(total length): " + totalLength + "<br>");

// find() and findIndex()
const found = items.find(item => item.startsWith("b"));
document.write("find(startsWith 'b'): " + found + "<br>");

const foundIndex = items.findIndex(item => item.startsWith("c"));
document.write("findIndex(startsWith 'c'): " + foundIndex + "<br>");

// some() and every()
const hasA = items.some(item => item.includes("a"));
document.write("some(contains 'a'): " + hasA + "<br>");

const allHaveA = items.every(item => item.includes("a"));
document.write("every(contains 'a'): " + allHaveA + "<br>");

// ========== SEARCHING ARRAYS ==========

document.write("<br><strong>Searching Arrays:</strong><br>");

const numbersList = [10, 20, 30, 40, 50, 30, 20];

// indexOf() and lastIndexOf()
document.write("indexOf(30): " + numbersList.indexOf(30) + "<br>");
document.write("lastIndexOf(30): " + numbersList.lastIndexOf(30) + "<br>");
document.write("indexOf(100) [not found]: " + numbersList.indexOf(100) + " (returns -1)<br>");

// includes() - ES2016
document.write("includes(40): " + numbersList.includes(40) + "<br>");
document.write("includes(40, 4) [starting at index 4]: " + numbersList.includes(40, 4) + "<br>");

// ========== MULTIDIMENSIONAL ARRAYS ==========

document.write("<br><strong>Multidimensional Arrays:</strong><br>");

// 2D array (matrix)
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

document.write("2D array (matrix):<br>");
matrix.forEach(row => {
    document.write("[ " + row.join(", ") + " ]<br>");
});

// Accessing elements
document.write("matrix[1][2]: " + matrix[1][2] + "<br>");

// Flattening multidimensional array
const flatMatrix = matrix.flat();
document.write("matrix.flat(): " + flatMatrix + "<br>");

// 3D array
const threeD = [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
];
document.write("3D array depth: " + threeD.flat(2) + "<br>");

// ========== ARRAY DESTRUCTURING ==========

document.write("<br><strong>Array Destructuring (ES6):</strong><br>");

const colors2 = ["red", "green", "blue", "yellow"];

// Basic destructuring
const [first, second] = colors2;
document.write("const [first, second] = colors: " + first + ", " + second + "<br>");

// Skipping elements
const [primary, , tertiary] = colors2;
document.write("const [primary, , tertiary] = colors: " + primary + ", " + tertiary + "<br>");

// Rest operator with destructuring
const [mainColor, ...otherColors] = colors2;
document.write("const [mainColor, ...otherColors] = colors: " + mainColor + ", " + otherColors + "<br>");

// Default values
const [color1, color2, color3, color4, color5 = "black"] = colors2;
document.write("With default: " + color1 + ", " + color5 + "<br>");

// Swapping variables
let a = 1, b = 2;
[a, b] = [b, a];
document.write("Swapped: a=" + a + ", b=" + b + "<br>");

// ========== SPREAD OPERATOR WITH ARRAYS ==========

document.write("<br><strong>Spread Operator with Arrays:</strong><br>");

// Copying arrays
const original = [1, 2, 3];
const copy = [...original];
document.write("Copy with spread: " + copy + " (original: " + original + ")<br>");

// Merging arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];
document.write("Merged arrays: " + merged + "<br>");

// Adding elements
const withExtra = [0, ...arr1, 3.5, ...arr2, 7];
document.write("With extra elements: " + withExtra + "<br>");

// Converting string to array
const str = "hello";
const charArray = [...str];
document.write("String to array: " + charArray + "<br>");

// ========== ARRAY-LIKE OBJECTS ==========

document.write("<br><strong>Array-like Objects:</strong><br>");

// Arguments object
function demonstrateArguments() {
    document.write("arguments.length: " + arguments.length + "<br>");
    document.write("arguments[0]: " + arguments[0] + "<br>");
    
    // Convert to real array
    const argsArray = Array.from(arguments);
    document.write("Array.from(arguments): " + argsArray + "<br>");
}
demonstrateArguments(1, 2, 3, "test");

// NodeList (from DOM)
document.write("<br>NodeList (simulated): ");
const nodeList = document.querySelectorAll('div'); // Would get actual NodeList
const nodeArray = Array.from(nodeList || []);
document.write("Array.from(NodeList) length: " + nodeArray.length + "<br>");

// ========== TYPED ARRAYS ==========

document.write("<br><strong>Typed Arrays:</strong><br>");

// Create typed array
const intArray = new Int32Array([1, 2, 3, 4, 5]);
document.write("Int32Array: " + intArray + "<br>");

// Different typed arrays
const floatArray = new Float64Array([1.1, 2.2, 3.3]);
document.write("Float64Array: " + floatArray + "<br>");

// ========== PERFORMANCE TIPS ==========

document.write("<br><strong>Array Performance Tips:</strong><br>");
document.write("1. Use for loops for large arrays when performance is critical<br>");
document.write("2. Prefer push/pop over unshift/shift (O(1) vs O(n))<br>");
document.write("3. Set length = 0 to quickly clear an array<br>");
document.write("4. Use typed arrays for numeric computations<br>");
document.write("5. Consider Set for unique values, Map for key-value pairs<br>");