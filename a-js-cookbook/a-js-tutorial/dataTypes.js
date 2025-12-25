/**
 * DATA TYPES IN JAVASCRIPT
 * 
 * JavaScript has dynamic types - the same variable can hold different data types.
 * 
 * Two main categories:
 * 1. Primitive (immutable) types:
 *    - String, Number, Boolean, Undefined, Null, Symbol, BigInt
 * 2. Reference (mutable) types:
 *    - Objects, Arrays, Functions
 * 
 * Type coercion is automatic type conversion in JavaScript.
 */

document.write("<h3>2. Data Types</h3>");

// ========== PRIMITIVE DATA TYPES ==========

document.write("<strong>Primitive Data Types:</strong><br>");

// 1. String - textual data
let stringExample = "Hello World";
let stringSingle = 'Single quotes work too';
let stringBackticks = `Template literals ${stringExample}`;
document.write("String: " + stringExample + "<br>");
document.write("Template literal: " + stringBackticks + "<br>");

// 2. Number - integer or floating point
let integer = 42;
let float = 3.14159;
let scientific = 5e3; // 5000
let infinity = Infinity;
let notANumber = NaN;
document.write("Number (integer): " + integer + "<br>");
document.write("Number (float): " + float + "<br>");
document.write("Infinity: " + infinity + "<br>");
document.write("NaN: " + notANumber + "<br>");

// 3. BigInt - for very large integers (beyond Number limit)
let bigInt = 9007199254740991n; // n suffix creates BigInt
document.write("BigInt: " + bigInt + "<br>");

// 4. Boolean - true/false
let isTrue = true;
let isFalse = false;
document.write("Boolean (true): " + isTrue + "<br>");
document.write("Boolean (false): " + isFalse + "<br>");

// 5. Undefined - declared but not assigned
let undefinedVar;
document.write("Undefined: " + undefinedVar + "<br>");

// 6. Null - intentional absence of value
let nullVar = null;
document.write("Null: " + nullVar + "<br>");

// 7. Symbol - unique and immutable primitive
let symbol1 = Symbol("id");
let symbol2 = Symbol("id");
document.write("Symbol 1: " + symbol1.toString() + "<br>");
document.write("Symbol 2: " + symbol2.toString() + "<br>");
document.write("Are symbols equal? " + (symbol1 === symbol2) + "<br>");

// ========== REFERENCE DATA TYPES ==========

document.write("<br><strong>Reference Data Types:</strong><br>");

// 1. Object - collection of key-value pairs
let person = {
    name: "Alice",
    age: 30,
    isStudent: false,
    greet: function() {
        return "Hello!";
    }
};
document.write("Object: " + JSON.stringify(person) + "<br>");

// 2. Array - ordered list of values
let colors = ["red", "green", "blue"];
document.write("Array: " + colors + "<br>");

// 3. Function - callable object
function multiply(a, b) {
    return a * b;
}
document.write("Function: " + multiply(5, 3) + "<br>");

// ========== TYPE CHECKING ==========

document.write("<br><strong>Type Checking:</strong><br>");

// typeof operator
document.write("typeof 'hello': " + typeof "hello" + "<br>");
document.write("typeof 42: " + typeof 42 + "<br>");
document.write("typeof true: " + typeof true + "<br>");
document.write("typeof undefined: " + typeof undefined + "<br>");
document.write("typeof null: " + typeof null + "<br>"); // Returns 'object' (historical bug)
document.write("typeof {}: " + typeof {} + "<br>");
document.write("typeof []: " + typeof [] + "<br>"); // Returns 'object'
document.write("typeof function(){}: " + typeof function(){} + "<br>");

// instanceof operator
document.write("<br>[] instanceof Array: " + ([] instanceof Array) + "<br>");
document.write("[] instanceof Object: " + ([] instanceof Object) + "<br>");

// Array.isArray() for checking arrays
document.write("Array.isArray([]): " + Array.isArray([]) + "<br>");
document.write("Array.isArray({}): " + Array.isArray({}) + "<br>");

// ========== TYPE CONVERSION ==========

document.write("<br><strong>Type Conversion (Coercion):</strong><br>");

// Implicit conversion
document.write("'5' + 2: " + ('5' + 2) + "<br>"); // String concatenation
document.write("'5' - 2: " + ('5' - 2) + "<br>"); // Numeric subtraction
document.write("'5' * '2': " + ('5' * '2') + "<br>"); // Numeric multiplication
document.write("5 + true: " + (5 + true) + "<br>"); // true becomes 1
document.write("5 + false: " + (5 + false) + "<br>"); // false becomes 0
document.write("5 + null: " + (5 + null) + "<br>"); // null becomes 0
document.write("'5' + null: " + ('5' + null) + "<br>"); // String concatenation

// Explicit conversion
document.write("<br><strong>Explicit Conversion:</strong><br>");
document.write("String(123): " + String(123) + "<br>");
document.write("Number('123'): " + Number('123') + "<br>");
document.write("Number('hello'): " + Number('hello') + "<br>"); // NaN
document.write("Boolean(1): " + Boolean(1) + "<br>"); // true
document.write("Boolean(0): " + Boolean(0) + "<br>"); // false
document.write("Boolean(''): " + Boolean('') + "<br>"); // false
document.write("Boolean('hello'): " + Boolean('hello') + "<br>"); // true

// ParseInt and ParseFloat
document.write("<br>parseInt('10px'): " + parseInt('10px') + "<br>");
document.write("parseFloat('12.5em'): " + parseFloat('12.5em') + "<br>");
document.write("parseInt('0xff'): " + parseInt('0xff') + "<br>"); // Hexadecimal

// ========== TRUTHY AND FALSY VALUES ==========

document.write("<br><strong>Truthy and Falsy Values:</strong><br>");
document.write("Falsy values (convert to false):<br>");
document.write("- false: " + Boolean(false) + "<br>");
document.write("- 0: " + Boolean(0) + "<br>");
document.write("- '' (empty string): " + Boolean('') + "<br>");
document.write("- null: " + Boolean(null) + "<br>");
document.write("- undefined: " + Boolean(undefined) + "<br>");
document.write("- NaN: " + Boolean(NaN) + "<br>");

document.write("<br>Everything else is truthy, including:<br>");
document.write("- '0': " + Boolean('0') + "<br>");
document.write("- 'false': " + Boolean('false') + "<br>");
document.write("- [] (empty array): " + Boolean([]) + "<br>");
document.write("- {} (empty object): " + Boolean({}) + "<br>");