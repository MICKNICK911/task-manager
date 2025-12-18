/**
 * CONTROL FLOW IN JAVASCRIPT
 * 
 * Control flow determines the order in which statements are executed.
 * 
 * 1. Conditional statements:
 *    - if, else if, else
 *    - switch
 *    - Ternary operator
 * 
 * 2. Looping statements:
 *    - for, while, do-while
 *    - for...in, for...of
 * 
 * 3. Control transfer:
 *    - break, continue, return
 */

document.write("<h3>4. Control Flow</h3>");

// ========== IF STATEMENT ==========

document.write("<strong>if Statement:</strong><br>");

let temperature = 25;

if (temperature > 30) {
    document.write("It's hot outside!<br>");
} else if (temperature > 20) {
    document.write("It's warm outside.<br>");
} else if (temperature > 10) {
    document.write("It's cool outside.<br>");
} else {
    document.write("It's cold outside!<br>");
}

// Without braces (only one statement)
let hour = 14;
if (hour < 12) document.write("Good morning!<br>");
else if (hour < 18) document.write("Good afternoon!<br>");
else document.write("Good evening!<br>");

// ========== SWITCH STATEMENT ==========

document.write("<br><strong>switch Statement:</strong><br>");

let day = 3;
let dayName;

switch (day) {
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    case 3:
        dayName = "Wednesday";
        break;
    case 4:
        dayName = "Thursday";
        break;
    case 5:
        dayName = "Friday";
        break;
    case 6:
        dayName = "Saturday";
        break;
    case 7:
        dayName = "Sunday";
        break;
    default:
        dayName = "Invalid day";
}

document.write("Day " + day + " is " + dayName + "<br>");

// Multiple cases with same code
let fruit = "apple";
let message;

switch (fruit) {
    case "apple":
    case "pear":
    case "banana":
        message = "This is a common fruit";
        break;
    case "dragon fruit":
    case "kiwano":
        message = "This is an exotic fruit";
        break;
    default:
        message = "Unknown fruit";
}

document.write(fruit + ": " + message + "<br>");

// Switch with expressions
let score = 85;
let gradeLevel;

switch (true) {
    case (score >= 90):
        gradeLevel = "A";
        break;
    case (score >= 80):
        gradeLevel = "B";
        break;
    case (score >= 70):
        gradeLevel = "C";
        break;
    case (score >= 60):
        gradeLevel = "D";
        break;
    default:
        gradeLevel = "F";
}

document.write("Score " + score + " = Grade " + gradeLevel + "<br>");

// ========== TERNARY OPERATOR ==========

document.write("<br><strong>Ternary Operator:</strong><br>");

let isRaining = true;
let weatherMessage = isRaining ? "Take an umbrella" : "No umbrella needed";
document.write(weatherMessage + "<br>");

// Nested ternary
let age = 20;
let beverage = age >= 21 ? "Beer" : age >= 18 ? "Wine (in some countries)" : "Juice";
document.write("Age " + age + " can drink: " + beverage + "<br>");

// Ternary for assignment
let user = null;
let displayName = user ? user.name : "Guest";
document.write("User: " + displayName + "<br>");

// ========== CONDITIONAL (SHORT-CIRCUIT) EVALUATION ==========

document.write("<br><strong>Short-circuit Evaluation for Conditions:</strong><br>");

// Using && for conditional execution
let isLoggedIn = true;
isLoggedIn && document.write("User is logged in<br>");

// Using || for default values
let username = "";
let displayUser = username || "Anonymous";
document.write("Username: " + displayUser + "<br>");

// Nullish coalescing for null/undefined only
let count = 0;
let displayCount = count ?? "Not set";
document.write("Count: " + displayCount + " (0 is not nullish)<br>");

// ========== CONTROL TRANSFER STATEMENTS ==========

document.write("<br><strong>Control Transfer Statements:</strong><br>");

// break statement
document.write("Break example (stops at 5): ");
for (let i = 1; i <= 10; i++) {
    if (i === 6) break;
    document.write(i + " ");
}
document.write("<br>");

// continue statement
document.write("Continue example (skips 5): ");
for (let i = 1; i <= 10; i++) {
    if (i === 5) continue;
    document.write(i + " ");
}
document.write("<br>");

// return statement in functions
function checkNumber(num) {
    if (num < 0) return "Negative";
    if (num === 0) return "Zero";
    return "Positive";
}

document.write("checkNumber(-5): " + checkNumber(-5) + "<br>");
document.write("checkNumber(0): " + checkNumber(0) + "<br>");
document.write("checkNumber(10): " + checkNumber(10) + "<br>");

// ========== TRY-CATCH FOR ERROR CONTROL FLOW ==========

document.write("<br><strong>Error Handling with try-catch:</strong><br>");

try {
    // This will throw an error
    let result = undefinedVariable * 2;
    document.write("Result: " + result + "<br>");
} catch (error) {
    document.write("Error caught: " + error.message + "<br>");
} finally {
    document.write("Finally block always executes<br>");
}

// ========== LABELED STATEMENTS ==========

document.write("<br><strong>Labeled Statements:</strong><br>");

outerLoop: for (let i = 1; i <= 3; i++) {
    innerLoop: for (let j = 1; j <= 3; j++) {
        if (i === 2 && j === 2) {
            document.write("Breaking outer loop at i=" + i + ", j=" + j + "<br>");
            break outerLoop;
        }
        document.write("i=" + i + ", j=" + j + "<br>");
    }
}

// ========== CONDITIONAL BEST PRACTICES ==========

document.write("<br><strong>Best Practices:</strong><br>");

// Early return pattern
function processUser(user) {
    if (!user) return "No user provided";
    if (!user.active) return "User is inactive";
    if (user.age < 18) return "User is underage";
    
    return "User processed successfully";
}

document.write("processUser(null): " + processUser(null) + "<br>");

// Avoid deep nesting
function calculateDiscount(price, isMember, hasCoupon) {
    if (!isMember) return price;
    
    let discount = 0.1; // 10% for members
    
    if (hasCoupon) {
        discount += 0.05; // Extra 5% with coupon
    }
    
    return price * (1 - discount);
}

document.write("Discount for member with coupon: $" + calculateDiscount(100, true, true) + "<br>");

// Use guard clauses
function validateInput(input) {
    // Guard clauses at the beginning
    if (typeof input !== 'string') return "Input must be a string";
    if (input.length === 0) return "Input cannot be empty";
    if (input.length > 100) return "Input too long";
    
    // Main logic
    return "Input is valid";
}

document.write("validateInput(''): " + validateInput('') + "<br>");