/**
 * OBJECTS IN JAVASCRIPT
 * 
 * Objects are collections of key-value pairs (properties).
 * In JavaScript, almost everything is an object:
 * - Arrays, Functions, Dates, RegEx, etc. are objects
 * - Even primitive types have object wrappers
 * 
 * Covered topics:
 * - Object creation
 * - Properties and methods
 * - Object methods (Object.keys, values, entries)
 * - Prototypes and inheritance
 * - Getters and setters
 * - Object destructuring
 * - Object references vs values
 */

document.write("<h3>8. Objects</h3>");

// ========== OBJECT CREATION ==========

document.write("<strong>Creating Objects:</strong><br>");

// 1. Object literal (most common)
const person = {
    firstName: "John",
    lastName: "Doe",
    age: 30,
    isEmployed: true,
    address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001"
    },
    hobbies: ["reading", "coding", "hiking"],
    greet: function() {
        return `Hello, I'm ${this.firstName}`;
    }
};

document.write("Object literal: " + JSON.stringify(person) + "<br>");

// 2. Object constructor (less common)
const car = new Object();
car.brand = "Toyota";
car.model = "Camry";
car.year = 2022;

document.write("Object constructor: " + JSON.stringify(car) + "<br>");

// 3. Constructor function
function Product(name, price) {
    this.name = name;
    this.price = price;
    this.getPriceWithTax = function() {
        return this.price * 1.08;
    };
}

const laptop = new Product("Laptop", 999);
document.write("Constructor function: " + JSON.stringify(laptop) + "<br>");

// 4. Object.create() - creates with specified prototype
const animal = {
    type: "animal",
    makeSound: function() {
        return "Some sound";
    }
};

const dog = Object.create(animal);
dog.breed = "Golden Retriever";
dog.name = "Buddy";

document.write("Object.create(): " + JSON.stringify(dog) + "<br>");

// 5. Class syntax (ES6) - covered in classes.js
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}

const user = new User("Alice", "alice@example.com");
document.write("Class instance: " + JSON.stringify(user) + "<br>");

// ========== ACCESSING PROPERTIES ==========

document.write("<br><strong>Accessing Properties:</strong><br>");

// Dot notation
document.write("Dot notation - person.firstName: " + person.firstName + "<br>");

// Bracket notation (useful for dynamic property names)
const propertyName = "lastName";
document.write("Bracket notation - person['lastName']: " + person[propertyName] + "<br>");

// Nested properties
document.write("Nested - person.address.city: " + person.address.city + "<br>");

// Methods
document.write("Method call - person.greet(): " + person.greet() + "<br>");

// Optional chaining (ES2020)
document.write("Optional chaining - person.spouse?.name: " + (person.spouse?.name || "undefined") + "<br>");

// ========== MODIFYING OBJECTS ==========

document.write("<br><strong>Modifying Objects:</strong><br>");

// Adding properties
person.middleName = "William";
person["nationality"] = "American";
document.write("After adding properties: " + JSON.stringify(person) + "<br>");

// Modifying properties
person.age = 31;
document.write("After person.age = 31: " + person.age + "<br>");

// Deleting properties
delete person.middleName;
document.write("After delete person.middleName: " + ("middleName" in person ? "Exists" : "Deleted") + "<br>");

// Computed property names (ES6)
const propKey = "dynamicKey";
const objWithComputed = {
    [propKey + "Suffix"]: "computed value",
    [`${propKey}Another`]: "another value"
};
document.write("Computed property names: " + JSON.stringify(objWithComputed) + "<br>");

// ========== OBJECT METHODS ==========

document.write("<br><strong>Object Methods:</strong><br>");

// Object.keys() - get all property names
const keys = Object.keys(person);
document.write("Object.keys(person): " + keys + "<br>");

// Object.values() - get all property values
const values = Object.values(person);
document.write("Object.values(person) (first few): " + values.slice(0, 3) + "...<br>");

// Object.entries() - get key-value pairs
const entries = Object.entries(person);
document.write("Object.entries(person) (first 2): ");
for (let i = 0; i < 2 && i < entries.length; i++) {
    document.write("[" + entries[i][0] + ", " + entries[i][1] + "] ");
}
document.write("<br>");

// Object.assign() - copy properties from one object to another
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };
const assigned = Object.assign(target, source);
document.write("Object.assign(): " + JSON.stringify(assigned) + "<br>");

// Object.freeze() - prevent modifications
const frozenObj = { value: 42 };
Object.freeze(frozenObj);
// frozenObj.value = 100; // This would fail silently in non-strict mode
document.write("Object.isFrozen(frozenObj): " + Object.isFrozen(frozenObj) + "<br>");

// Object.seal() - prevent adding/removing properties but allow modifications
const sealedObj = { value: 42 };
Object.seal(sealedObj);
sealedObj.value = 100; // This works
// sealedObj.newProp = "test"; // This would fail
document.write("Object.isSealed(sealedObj): " + Object.isSealed(sealedObj) + "<br>");

// ========== PROPERTY DESCRIPTORS ==========

document.write("<br><strong>Property Descriptors:</strong><br>");

const obj = {};

// Define property with descriptor
Object.defineProperty(obj, "readOnlyProp", {
    value: "Cannot change",
    writable: false,
    enumerable: true,
    configurable: false
});

document.write("Read-only property: " + obj.readOnlyProp + "<br>");
// obj.readOnlyProp = "Try to change"; // This would fail

// Get property descriptor
const descriptor = Object.getOwnPropertyDescriptor(obj, "readOnlyProp");
document.write("Property descriptor: " + JSON.stringify(descriptor) + "<br>");

// Define multiple properties
Object.defineProperties(obj, {
    propA: {
        value: "A",
        writable: true
    },
    propB: {
        value: "B",
        writable: false
    }
});

document.write("Multiple defined properties: " + Object.keys(obj) + "<br>");

// ========== GETTERS AND SETTERS ==========

document.write("<br><strong>Getters and Setters:</strong><br>");

const account = {
    _balance: 1000, // Convention: underscore means "private"
    
    // Getter
    get balance() {
        return this._balance;
    },
    
    // Setter with validation
    set balance(amount) {
        if (amount < 0) {
            throw new Error("Balance cannot be negative");
        }
        this._balance = amount;
    },
    
    // Regular method
    deposit(amount) {
        this.balance += amount;
        return this.balance;
    },
    
    withdraw(amount) {
        if (amount > this.balance) {
            throw new Error("Insufficient funds");
        }
        this.balance -= amount;
        return this.balance;
    }
};

document.write("Account balance (getter): " + account.balance + "<br>");
account.deposit(500);
document.write("After deposit 500: " + account.balance + "<br>");

// Using getter/setter with defineProperty
const rectangle = {
    _width: 10,
    _height: 5
};

Object.defineProperty(rectangle, "area", {
    get: function() {
        return this._width * this._height;
    },
    enumerable: true,
    configurable: true
});

document.write("Rectangle area (computed getter): " + rectangle.area + "<br>");

// ========== PROTOTYPES AND INHERITANCE ==========

document.write("<br><strong>Prototypes and Inheritance:</strong><br>");

// Every object has a prototype (accessed via __proto__ or Object.getPrototypeOf())
const parent = {
    species: "mammal",
    breathe: function() {
        return "Breathing...";
    }
};

const child = Object.create(parent);
child.name = "Baby";
child.age = 1;

document.write("Child inherits from parent: " + child.species + "<br>");
document.write("Child's own property: " + child.name + "<br>");
document.write("Child's prototype: " + (Object.getPrototypeOf(child) === parent) + "<br>");

// Constructor function prototype
function Animal(name) {
    this.name = name;
}

Animal.prototype.eat = function() {
    return `${this.name} is eating`;
};

Animal.prototype.sleep = function() {
    return `${this.name} is sleeping`;
};

const lion = new Animal("Lion");
document.write("Constructor prototype method: " + lion.eat() + "<br>");

// Prototype chain
document.write("Prototype chain:<br>");
document.write("lion instanceof Animal: " + (lion instanceof Animal) + "<br>");
document.write("lion.__proto__ === Animal.prototype: " + (lion.__proto__ === Animal.prototype) + "<br>");

// ========== OBJECT DESTRUCTURING ==========

document.write("<br><strong>Object Destructuring (ES6):</strong><br>");

const employee = {
    id: 101,
    name: "Jane Smith",
    department: "Engineering",
    salary: 85000,
    contact: {
        email: "jane@company.com",
        phone: "555-1234"
    }
};

// Basic destructuring
const { name, department } = employee;
document.write("Destructuring: name=" + name + ", department=" + department + "<br>");

// With different variable names
const { name: employeeName, salary: employeeSalary } = employee;
document.write("With renaming: employeeName=" + employeeName + ", employeeSalary=" + employeeSalary + "<br>");

// Default values
const { name: empName, manager = "John Doe" } = employee;
document.write("With default: empName=" + empName + ", manager=" + manager + "<br>");

// Nested destructuring
const { contact: { email, phone } } = employee;
document.write("Nested: email=" + email + ", phone=" + phone + "<br>");

// Rest operator with destructuring
const { id, ...employeeInfo } = employee;
document.write("With rest: id=" + id + ", employeeInfo keys: " + Object.keys(employeeInfo) + "<br>");

// ========== OBJECT SPREAD OPERATOR ==========

document.write("<br><strong>Object Spread Operator (ES2018):</strong><br>");

// Copying objects
const originalObj = { a: 1, b: 2 };
const copyObj = { ...originalObj };
document.write("Copy with spread: " + JSON.stringify(copyObj) + "<br>");

// Merging objects
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 }; // b will be overwritten
const mergedObj = { ...obj1, ...obj2 };
document.write("Merged: " + JSON.stringify(mergedObj) + "<br>");

// Adding properties
const withExtraProps = { ...obj1, d: 5, e: 6 };
document.write("With extra properties: " + JSON.stringify(withExtraProps) + "<br>");

// Override properties
const overridden = { ...obj1, b: 99 };
document.write("Overridden property: " + JSON.stringify(overridden) + "<br>");

// ========== OBJECT REFERENCES VS VALUES ==========

document.write("<br><strong>Object References vs Values:</strong><br>");

// Primitives are copied by value
let primitive1 = 10;
let primitive2 = primitive1;
primitive2 = 20;
document.write("Primitive copy: primitive1=" + primitive1 + ", primitive2=" + primitive2 + "<br>");

// Objects are copied by reference
let objRef1 = { value: 10 };
let objRef2 = objRef1;
objRef2.value = 20;
document.write("Object reference: objRef1.value=" + objRef1.value + ", objRef2.value=" + objRef2.value + "<br>");

// Deep copy methods
const shallowCopy = { ...objRef1 }; // Shallow copy
const deepCopy = JSON.parse(JSON.stringify(objRef1)); // Deep copy (with limitations)

shallowCopy.value = 30;
document.write("After shallow copy modification: original=" + objRef1.value + ", shallowCopy=" + shallowCopy.value + "<br>");

// ========== BUILT-IN OBJECT METHODS ==========

document.write("<br><strong>Built-in Object Methods:</strong><br>");

const testObj = { a: 1, b: 2, c: 3 };

// hasOwnProperty() - check if property exists on object itself (not prototype)
document.write("hasOwnProperty('a'): " + testObj.hasOwnProperty('a') + "<br>");
document.write("hasOwnProperty('toString'): " + testObj.hasOwnProperty('toString') + " (inherited)<br>");

// propertyIsEnumerable() - check if property is enumerable
document.write("propertyIsEnumerable('a'): " + testObj.propertyIsEnumerable('a') + "<br>");

// isPrototypeOf() - check if object is in prototype chain
document.write("parent.isPrototypeOf(child): " + parent.isPrototypeOf(child) + "<br>");

// toString() and valueOf()
document.write("obj.toString(): " + testObj.toString() + "<br>");
document.write("obj.valueOf() === obj: " + (testObj.valueOf() === testObj) + "<br>");

// ========== OBJECT ITERATION ==========

document.write("<br><strong>Object Iteration:</strong><br>");

const userData = {
    name: "Alex",
    age: 28,
    email: "alex@example.com",
    role: "developer"
};

// for...in loop (iterates over enumerable properties, including inherited)
document.write("for...in loop: ");
for (let key in userData) {
    if (userData.hasOwnProperty(key)) {
        document.write(key + "=" + userData[key] + " ");
    }
}
document.write("<br>");

// Object.keys() with forEach
document.write("Object.keys() with forEach: ");
Object.keys(userData).forEach(key => {
    document.write(key + " ");
});
document.write("<br>");

// Object.entries() with for...of
document.write("Object.entries() with for...of: ");
for (let [key, value] of Object.entries(userData)) {
    document.write(key + ":" + value + " ");
}
document.write("<br>");