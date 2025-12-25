/**
 * VARIABLES & SCOPE IN JAVASCRIPT
 * 
 * JavaScript has three ways to declare variables:
 * 1. var - Function scoped, can be redeclared and updated
 * 2. let - Block scoped, can be updated but not redeclared
 * 3. const - Block scoped, cannot be updated or redeclared
 * 
 * Scope determines the accessibility of variables:
 * - Global scope: Accessible everywhere
 * - Function scope: Accessible only within the function
 * - Block scope: Accessible only within the block {}
 */

document.write("<h3>1. Variables and Scope</h3>");

// ========== VARIABLE DECLARATIONS ==========

// Using var (function-scoped, can be redeclared)
document.write("<strong>var declarations:</strong><br>");
var firstName = "John";  // Global scope
var firstName = "Jane";  // Can be redeclared (unique to var)
document.write("firstName (var): " + firstName + "<br>");

// Using let (block-scoped, cannot be redeclared)
document.write("<br><strong>let declarations:</strong><br>");
let age = 25;
// let age = 30; // This would cause an error (cannot redeclare)
age = 30; // But can be reassigned
document.write("Age (let): " + age + "<br>");

// Using const (block-scoped, cannot be reassigned)
document.write("<br><strong>const declarations:</strong><br>");
const birthYear = 1995;
// birthYear = 2000; // This would cause an error (cannot reassign)
document.write("Birth Year (const): " + birthYear + "<br>");

// const with objects - the object itself can be modified
const person = { name: "Alice", age: 28 };
person.age = 29; // This is allowed - we're modifying the object, not reassigning the variable
document.write("Person object (const modified): " + JSON.stringify(person) + "<br>");

// ========== SCOPE EXAMPLES ==========

document.write("<br><strong>Scope Examples:</strong><br>");

// Global scope example
var globalVar = "I'm global";

function testScope() {
    // Function scope - variables declared inside function
    var functionVar = "I'm in function scope";
    let blockScopedLet = "I'm let in function";
    
    if (true) {
        // Block scope - variables declared inside {}
        let blockLet = "I'm block scoped (let)";
        var blockVar = "I'm function scoped (var)"; // var is function scoped, not block scoped!
        
        document.write("Inside block: " + blockLet + "<br>");
        document.write("Inside block (var): " + blockVar + "<br>");
    }
    
    // blockLet is not accessible here (block scoped)
    document.write("Outside block (var still accessible): " + blockVar + "<br>");
    
    // Global variable is accessible everywhere
    document.write("Global var inside function: " + globalVar + "<br>");
}

testScope();

// ========== HOISTING ==========

document.write("<br><strong>Hoisting Examples:</strong><br>");

// Variables declared with var are hoisted (declaration moved to top, initialization stays)
document.write("Hoisted var (before declaration): " + hoistedVar + "<br>");
var hoistedVar = "I was hoisted";
document.write("Hoisted var (after declaration): " + hoistedVar + "<br>");

// Variables declared with let/const are hoisted but not initialized (Temporal Dead Zone)
// This would cause an error if uncommented:
// document.write("Hoisted let: " + hoistedLet); // ReferenceError
let hoistedLet = "I'm let";

// ========== BEST PRACTICES ==========

document.write("<br><strong>Best Practices:</strong><br>");
document.write("1. Use const by default<br>");
document.write("2. Use let when you need to reassign values<br>");
document.write("3. Avoid var in modern JavaScript (use let/const instead)<br>");
document.write("4. Declare variables at the top of their scope<br>");
document.write("5. Use meaningful variable names<br>");