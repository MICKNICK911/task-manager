/**
 * OPERATORS IN JAVASCRIPT
 * 
 * Operators perform operations on variables and values.
 * Categories:
 * 1. Arithmetic operators
 * 2. Assignment operators
 * 3. Comparison operators
 * 4. Logical operators
 * 5. Bitwise operators
 * 6. String operators
 * 7. Conditional (ternary) operator
 * 8. Type operators
 * 9. Comma operator
 * 10. Unary operators
 * 11. Relational operators
 */

document.write("<h3>3. Operators</h3>");

// ========== ARITHMETIC OPERATORS ==========

document.write("<strong>Arithmetic Operators:</strong><br>");

let a = 10, b = 3;

document.write("Addition (10 + 3): " + (a + b) + "<br>");
document.write("Subtraction (10 - 3): " + (a - b) + "<br>");
document.write("Multiplication (10 * 3): " + (a * b) + "<br>");
document.write("Division (10 / 3): " + (a / b) + "<br>");
document.write("Modulus/Remainder (10 % 3): " + (a % b) + "<br>");
document.write("Exponentiation (10 ** 3): " + (a ** b) + "<br>");
document.write("Increment (a++): " + (a++) + " (now a = " + a + ")<br>");
document.write("Decrement (b--): " + (b--) + " (now b = " + b + ")<br>");

// Reset values
a = 10; b = 3;

// Prefix vs postfix increment
document.write("<br><strong>Prefix vs Postfix:</strong><br>");
let prefix = ++a; // Increment first, then assign
let postfix = b++; // Assign first, then increment
document.write("Prefix (++a): " + prefix + ", a is now: " + a + "<br>");
document.write("Postfix (b++): " + postfix + ", b is now: " + b + "<br>");

// ========== ASSIGNMENT OPERATORS ==========

document.write("<br><strong>Assignment Operators:</strong><br>");

let x = 5;
document.write("x = 5: " + x + "<br>");
x += 3; // x = x + 3
document.write("x += 3: " + x + "<br>");
x -= 2; // x = x - 2
document.write("x -= 2: " + x + "<br>");
x *= 4; // x = x * 4
document.write("x *= 4: " + x + "<br>");
x /= 2; // x = x / 2
document.write("x /= 2: " + x + "<br>");
x %= 5; // x = x % 5
document.write("x %= 5: " + x + "<br>");
x **= 3; // x = x ** 3
document.write("x **= 3: " + x + "<br>");

// ========== COMPARISON OPERATORS ==========

document.write("<br><strong>Comparison Operators:</strong><br>");

let num1 = 5, num2 = 10, str1 = "5";

document.write("Equal (5 == '5'): " + (num1 == str1) + " (type coercion)<br>");
document.write("Strict equal (5 === '5'): " + (num1 === str1) + " (no coercion)<br>");
document.write("Not equal (5 != '5'): " + (num1 != str1) + "<br>");
document.write("Strict not equal (5 !== '5'): " + (num1 !== str1) + "<br>");
document.write("Greater than (5 > 10): " + (num1 > num2) + "<br>");
document.write("Less than (5 < 10): " + (num1 < num2) + "<br>");
document.write("Greater than or equal (5 >= 5): " + (num1 >= num1) + "<br>");
document.write("Less than or equal (10 <= 5): " + (num2 <= num1) + "<br>");

// Special cases with null and undefined
document.write("<br><strong>Special Comparisons:</strong><br>");
document.write("null == undefined: " + (null == undefined) + "<br>");
document.write("null === undefined: " + (null === undefined) + "<br>");
document.write("null == 0: " + (null == 0) + "<br>");
document.write("null > 0: " + (null > 0) + "<br>");
document.write("null >= 0: " + (null >= 0) + "<br>");
document.write("undefined > 0: " + (undefined > 0) + "<br>");

// ========== LOGICAL OPERATORS ==========

document.write("<br><strong>Logical Operators:</strong><br>");

let isLoggedIn = true;
let hasPermission = false;
let age = 25;

document.write("AND (true && false): " + (isLoggedIn && hasPermission) + "<br>");
document.write("OR (true || false): " + (isLoggedIn || hasPermission) + "<br>");
document.write("NOT (!true): " + (!isLoggedIn) + "<br>");

// Short-circuit evaluation
document.write("<br><strong>Short-circuit Evaluation:</strong><br>");
let result1 = false && someFunction(); // someFunction never called
let result2 = true || someFunction(); // someFunction never called
document.write("false && someFunction(): " + result1 + "<br>");
document.write("true || someFunction(): " + result2 + "<br>");

function someFunction() {
    document.write("This function was called<br>");
    return true;
}

// Nullish coalescing operator (??) - ES2020
document.write("<br><strong>Nullish Coalescing Operator (??):</strong><br>");
let value1 = null ?? "default value";
let value2 = 0 ?? "default value";
let value3 = "" ?? "default value";
document.write("null ?? 'default': " + value1 + "<br>");
document.write("0 ?? 'default': " + value2 + " (0 is not nullish)<br>");
document.write("'' ?? 'default': " + value3 + " (empty string is not nullish)<br>");

// Optional chaining operator (?.) - ES2020
document.write("<br><strong>Optional Chaining Operator (?.):</strong><br>");
let user = {
    profile: {
        name: "John"
    }
};
document.write("user.profile?.name: " + user.profile?.name + "<br>");
document.write("user.address?.city: " + user.address?.city + " (no error)<br>");

// ========== BITWISE OPERATORS ==========

document.write("<br><strong>Bitwise Operators:</strong><br>");

let bit1 = 5;  // 0101 in binary
let bit2 = 3;  // 0011 in binary

document.write("AND (5 & 3): " + (bit1 & bit2) + " (0101 & 0011 = 0001 = 1)<br>");
document.write("OR (5 | 3): " + (bit1 | bit2) + " (0101 | 0011 = 0111 = 7)<br>");
document.write("XOR (5 ^ 3): " + (bit1 ^ bit2) + " (0101 ^ 0011 = 0110 = 6)<br>");
document.write("NOT (~5): " + (~bit1) + " (~0101 = 1010 = -6 in two's complement)<br>");
document.write("Left shift (5 << 1): " + (bit1 << 1) + " (0101 << 1 = 1010 = 10)<br>");
document.write("Right shift (5 >> 1): " + (bit1 >> 1) + " (0101 >> 1 = 0010 = 2)<br>");
document.write("Zero-fill right shift (5 >>> 1): " + (bit1 >>> 1) + "<br>");

// ========== TERNARY OPERATOR ==========

document.write("<br><strong>Ternary (Conditional) Operator:</strong><br>");

let userAge = 20;
let canVote = (userAge >= 18) ? "Yes, can vote" : "No, cannot vote";
document.write("Age: " + userAge + " - " + canVote + "<br>");

// Nested ternary
let score = 85;
let grade = (score >= 90) ? "A" : 
            (score >= 80) ? "B" : 
            (score >= 70) ? "C" : 
            (score >= 60) ? "D" : "F";
document.write("Score: " + score + " - Grade: " + grade + "<br>");

// ========== TYPE OPERATORS ==========

document.write("<br><strong>Type and Instance Operators:</strong><br>");

document.write("typeof 'hello': " + (typeof 'hello') + "<br>");
document.write("typeof 42: " + (typeof 42) + "<br>");
document.write("[] instanceof Array: " + ([] instanceof Array) + "<br>");
document.write("[] instanceof Object: " + ([] instanceof Object) + "<br>");

// ========== OPERATOR PRECEDENCE ==========

document.write("<br><strong>Operator Precedence Examples:</strong><br>");

document.write("2 + 3 * 4: " + (2 + 3 * 4) + " (multiplication first)<br>");
document.write("(2 + 3) * 4: " + ((2 + 3) * 4) + " (parentheses first)<br>");
document.write("!true && false: " + (!true && false) + " (NOT before AND)<br>");
document.write("!(true && false): " + (!(true && false)) + " (parentheses change order)<br>");