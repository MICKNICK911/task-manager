/**
 * CLASSES IN JAVASCRIPT
 * 
 * Classes are a template for creating objects in JavaScript (ES6+).
 * They provide a cleaner, more familiar syntax for object-oriented programming.
 * 
 * Topics covered:
 * - Class declarations and expressions
 * - Constructors
 * - Methods (static, instance, getters, setters)
 * - Inheritance (extends, super)
 * - Private fields and methods (ES2022)
 * - Mixins and composition
 * - Class vs prototype-based inheritance
 */

document.write("<h3>14. Classes</h3>");

// ========== CLASS DECLARATIONS ==========

document.write("<strong>Class Declarations:</strong><br>");

// Basic class declaration
class Person {
    // Constructor - called when creating new instance
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    // Instance method
    greet() {
        return `Hello, my name is ${this.name} and I'm ${this.age} years old.`;
    }
    
    // Another instance method
    haveBirthday() {
        this.age++;
        return `Happy Birthday! Now I'm ${this.age}.`;
    }
}

// Creating instances
const alice = new Person("Alice", 30);
const bob = new Person("Bob", 25);

document.write(alice.greet() + "<br>");
document.write(bob.greet() + "<br>");
document.write(alice.haveBirthday() + "<br>");

// ========== CLASS EXPRESSIONS ==========

document.write("<br><strong>Class Expressions:</strong><br>");

// Named class expression
const Animal = class AnimalClass {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return `${this.name} makes a sound.`;
    }
};

// Anonymous class expression
const Plant = class {
    constructor(name) {
        this.name = name;
    }
    
    grow() {
        return `${this.name} is growing.`;
    }
};

const dog = new Animal("Dog");
const rose = new Plant("Rose");

document.write(dog.speak() + "<br>");
document.write(rose.grow() + "<br>");

// ========== GETTERS AND SETTERS ==========

document.write("<br><strong>Getters and Setters:</strong><br>");

class Rectangle {
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }
    
    // Getter for area (computed property)
    get area() {
        return this._width * this._height;
    }
    
    // Getter for perimeter
    get perimeter() {
        return 2 * (this._width + this._height);
    }
    
    // Getter for width with validation
    get width() {
        return this._width;
    }
    
    // Setter for width with validation
    set width(value) {
        if (value <= 0) {
            throw new Error("Width must be positive");
        }
        this._width = value;
    }
    
    // Getter for height
    get height() {
        return this._height;
    }
    
    // Setter for height
    set height(value) {
        if (value <= 0) {
            throw new Error("Height must be positive");
        }
        this._height = value;
    }
}

const rect = new Rectangle(10, 5);
document.write(`Rectangle area: ${rect.area}<br>`);
document.write(`Rectangle perimeter: ${rect.perimeter}<br>`);

rect.width = 15;
document.write(`After width change: area = ${rect.area}<br>`);

// ========== STATIC METHODS AND PROPERTIES ==========

document.write("<br><strong>Static Methods and Properties:</strong><br>");

class MathHelper {
    // Static property
    static PI = 3.14159;
    
    // Static method
    static add(a, b) {
        return a + b;
    }
    
    // Another static method
    static circleArea(radius) {
        return this.PI * radius * radius;
    }
    
    // Instance method
    instanceMethod() {
        return "This is an instance method";
    }
}

// Static members are accessed on the class itself
document.write(`MathHelper.PI: ${MathHelper.PI}<br>`);
document.write(`MathHelper.add(5, 3): ${MathHelper.add(5, 3)}<br>`);
document.write(`MathHelper.circleArea(5): ${MathHelper.circleArea(5)}<br>`);

// Cannot access static members from instance
const helper = new MathHelper();
document.write(`helper.instanceMethod(): ${helper.instanceMethod()}<br>`);
// helper.add(1, 2); // Error: add is not a function

// Static initialization block (ES2022)
class Database {
    static connection;
    
    static {
        // This runs when the class is loaded
        document.write("Static initialization block executed<br>");
        this.connection = "Connected to database";
    }
    
    static getConnection() {
        return this.connection;
    }
}

document.write(`Database connection: ${Database.getConnection()}<br>`);

// ========== INHERITANCE (EXTENDS) ==========

document.write("<br><strong>Inheritance (extends):</strong><br>");

// Parent class
class Vehicle {
    constructor(make, model, year) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.speed = 0;
    }
    
    accelerate(amount) {
        this.speed += amount;
        return `Accelerating to ${this.speed} mph`;
    }
    
    brake(amount) {
        this.speed = Math.max(0, this.speed - amount);
        return `Slowing down to ${this.speed} mph`;
    }
    
    getDescription() {
        return `${this.year} ${this.make} ${this.model}`;
    }
}

// Child class
class Car extends Vehicle {
    constructor(make, model, year, doors) {
        // Call parent constructor with super()
        super(make, model, year);
        this.doors = doors;
    }
    
    // Override parent method
    getDescription() {
        return `${super.getDescription()} with ${this.doors} doors`;
    }
    
    // Add new method
    honk() {
        return "Beep beep!";
    }
}

// Another child class
class Truck extends Vehicle {
    constructor(make, model, year, payload) {
        super(make, model, year);
        this.payload = payload; // in tons
    }
    
    // Override with different implementation
    accelerate(amount) {
        // Trucks accelerate slower
        this.speed += amount * 0.5;
        return `Truck accelerating to ${this.speed} mph`;
    }
    
    // Add new method
    loadCargo(weight) {
        if (weight > this.payload) {
            return `Cannot load ${weight} tons (max: ${this.payload})`;
        }
        return `Loaded ${weight} tons of cargo`;
    }
}

const myCar = new Car("Toyota", "Camry", 2022, 4);
const myTruck = new Truck("Ford", "F-150", 2021, 2.5);

document.write(myCar.getDescription() + "<br>");
document.write(myCar.honk() + "<br>");
document.write(myCar.accelerate(20) + "<br>");

document.write(myTruck.getDescription() + "<br>");
document.write(myTruck.accelerate(20) + "<br>");
document.write(myTruck.loadCargo(1.5) + "<br>");

// ========== SUPER KEYWORD ==========

document.write("<br><strong>super Keyword:</strong><br>");

class Parent {
    constructor(name) {
        this.name = name;
    }
    
    sayHello() {
        return `Hello from Parent, ${this.name}`;
    }
}

class Child extends Parent {
    constructor(name, age) {
        super(name); // Must call super() before using 'this'
        this.age = age;
    }
    
    sayHello() {
        // Call parent method
        const parentGreeting = super.sayHello();
        return `${parentGreeting}. I'm ${this.age} years old.`;
    }
    
    // Using super in static methods
    static createChild(name, age) {
        // In static methods, super refers to parent class
        const instance = new this(name, age);
        return instance;
    }
}

const child = new Child("Emma", 10);
document.write(child.sayHello() + "<br>");

const child2 = Child.createChild("Liam", 8);
document.write(child2.sayHello() + "<br>");

// ========== PRIVATE FIELDS AND METHODS (ES2022) ==========

document.write("<br><strong>Private Fields and Methods (ES2022):</strong><br>");

class BankAccount {
    // Private fields (start with #)
    #balance = 0;
    #accountNumber;
    #transactionHistory = [];
    
    constructor(accountNumber, initialBalance = 0) {
        this.#accountNumber = accountNumber;
        this.#balance = initialBalance;
        this.#addTransaction("Account opened", initialBalance);
    }
    
    // Private method
    #addTransaction(description, amount) {
        this.#transactionHistory.push({
            date: new Date(),
            description,
            amount,
            balance: this.#balance
        });
    }
    
    // Public methods to interact with private fields
    deposit(amount) {
        if (amount <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        this.#balance += amount;
        this.#addTransaction("Deposit", amount);
        return this.#balance;
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be positive");
        }
        if (amount > this.#balance) {
            throw new Error("Insufficient funds");
        }
        this.#balance -= amount;
        this.#addTransaction("Withdrawal", -amount);
        return this.#balance;
    }
    
    // Public getter for balance (private field access)
    get balance() {
        return this.#balance;
    }
    
    // Public getter for account number
    get accountNumber() {
        return "****" + this.#accountNumber.slice(-4);
    }
    
    // Public method to get transaction history (read-only)
    getTransactionHistory() {
        // Return a copy to prevent modification
        return [...this.#transactionHistory];
    }
}

const account = new BankAccount("123456789", 1000);
document.write(`Account: ${account.accountNumber}<br>`);
document.write(`Initial balance: $${account.balance}<br>`);

account.deposit(500);
document.write(`After deposit: $${account.balance}<br>`);

account.withdraw(200);
document.write(`After withdrawal: $${account.balance}<br>`);

// Private fields are not accessible from outside
// account.#balance = 1000000; // SyntaxError
// account.#addTransaction("Hack", 1000000); // SyntaxError

const history = account.getTransactionHistory();
document.write(`Transaction count: ${history.length}<br>`);

// ========== MIXINS (MULTIPLE INHERITANCE ALTERNATIVE) ==========

document.write("<br><strong>Mixins (Multiple Inheritance Alternative):</strong><br>");

// Mixin functions
const CanSwim = (Base) => class extends Base {
    swim() {
        return `${this.name} is swimming`;
    }
};

const CanFly = (Base) => class extends Base {
    fly() {
        return `${this.name} is flying`;
    }
};

const CanWalk = (Base) => class extends Base {
    walk() {
        return `${this.name} is walking`;
    }
};

// Base class
class Creature {
    constructor(name) {
        this.name = name;
    }
    
    breathe() {
        return `${this.name} is breathing`;
    }
}

// Apply mixins
class Duck extends CanSwim(CanFly(CanWalk(Creature))) {
    quack() {
        return `${this.name} says quack!`;
    }
}

class Fish extends CanSwim(Creature) {
    constructor(name) {
        super(name);
        this.fins = 2;
    }
}

class Bat extends CanFly(CanWalk(Creature)) {
    constructor(name) {
        super(name);
        this.wings = 2;
    }
}

const donald = new Duck("Donald");
const nemo = new Fish("Nemo");
const batman = new Bat("Batman");

document.write(donald.breathe() + "<br>");
document.write(donald.walk() + "<br>");
document.write(donald.swim() + "<br>");
document.write(donald.fly() + "<br>");
document.write(donald.quack() + "<br>");

document.write(nemo.swim() + "<br>");
// nemo.fly(); // Error - fish can't fly

document.write(batman.fly() + "<br>");

// ========== CLASS VS PROTOTYPE ==========

document.write("<br><strong>Class vs Prototype Inheritance:</strong><br>");

// Class syntax (ES6)
class ES6Class {
    constructor(value) {
        this.value = value;
    }
    
    getValue() {
        return this.value;
    }
}

// Equivalent prototype syntax (pre-ES6)
function PrototypeClass(value) {
    this.value = value;
}

PrototypeClass.prototype.getValue = function() {
    return this.value;
};

const es6Instance = new ES6Class("ES6");
const protoInstance = new PrototypeClass("Prototype");

document.write(`ES6 class: ${es6Instance.getValue()}<br>`);
document.write(`Prototype: ${protoInstance.getValue()}<br>`);

// They work the same way
document.write(`es6Instance instanceof ES6Class: ${es6Instance instanceof ES6Class}<br>`);
document.write(`protoInstance instanceof PrototypeClass: ${protoInstance instanceof PrototypeClass}<br>`);

// Class is syntactic sugar over prototypes
document.write(`ES6Class.prototype.constructor === ES6Class: ${ES6Class.prototype.constructor === ES6Class}<br>`);

// ========== ABSTRACT CLASSES (SIMULATED) ==========

document.write("<br><strong>Abstract Classes (Simulated):</strong><br>");

// JavaScript doesn't have true abstract classes, but we can simulate them
class AbstractShape {
    constructor() {
        if (new.target === AbstractShape) {
            throw new Error("Cannot instantiate abstract class");
        }
    }
    
    // Abstract method (to be implemented by subclasses)
    area() {
        throw new Error("Method 'area()' must be implemented");
    }
    
    // Abstract method
    perimeter() {
        throw new Error("Method 'perimeter()' must be implemented");
    }
    
    // Concrete method (implemented in abstract class)
    describe() {
        return `Shape with area ${this.area()} and perimeter ${this.perimeter()}`;
    }
}

class Circle extends AbstractShape {
    constructor(radius) {
        super();
        this.radius = radius;
    }
    
    area() {
        return Math.PI * this.radius * this.radius;
    }
    
    perimeter() {
        return 2 * Math.PI * this.radius;
    }
}

class Square extends AbstractShape {
    constructor(side) {
        super();
        this.side = side;
    }
    
    area() {
        return this.side * this.side;
    }
    
    perimeter() {
        return 4 * this.side;
    }
}

// const shape = new AbstractShape(); // Error: Cannot instantiate abstract class

const circle = new Circle(5);
const square = new Square(4);

document.write(`Circle: ${circle.describe()}<br>`);
document.write(`Square: ${square.describe()}<br>`);

// ========== CLASS COMPOSITION ==========

document.write("<br><strong>Class Composition:</strong><br>");

// Instead of inheritance, use composition
class Engine {
    constructor(type) {
        this.type = type;
        this.isRunning = false;
    }
    
    start() {
        this.isRunning = true;
        return `Engine (${this.type}) started`;
    }
    
    stop() {
        this.isRunning = false;
        return `Engine (${this.type}) stopped`;
    }
}

class Wheels {
    constructor(count) {
        this.count = count;
        this.tirePressure = 32; // PSI
    }
    
    checkPressure() {
        return `Tire pressure: ${this.tirePressure} PSI`;
    }
    
    inflate(amount) {
        this.tirePressure += amount;
        return `Inflated to ${this.tirePressure} PSI`;
    }
}

// Compose a Car using components
class ComposedCar {
    constructor(model, engineType, wheelCount) {
        this.model = model;
        this.engine = new Engine(engineType);
        this.wheels = new Wheels(wheelCount);
    }
    
    start() {
        return `${this.model}: ${this.engine.start()}`;
    }
    
    checkTires() {
        return `${this.model}: ${this.wheels.checkPressure()}`;
    }
    
    drive() {
        if (!this.engine.isRunning) {
            return "Cannot drive - engine is off";
        }
        return `${this.model} is driving`;
    }
}

const myComposedCar = new ComposedCar("Sedan", "V6", 4);
document.write(myComposedCar.start() + "<br>");
document.write(myComposedCar.checkTires() + "<br>");
document.write(myComposedCar.drive() + "<br>");

// ========== CLASS BEST PRACTICES ==========

document.write("<br><strong>Class Best Practices:</strong><br>");

document.write("1. Use classes for organizing related data and behavior<br>");
document.write("2. Prefer composition over inheritance when possible<br>");
document.write("3. Use private fields (#) for true encapsulation<br>");
document.write("4. Keep classes focused on a single responsibility<br>");
document.write("5. Use getters/setters for computed properties and validation<br>");
document.write("6. Consider factory functions as an alternative to constructors<br>");
document.write("7. Use static methods for utility functions related to the class<br>");
document.write("8. Document public API with JSDoc comments<br>");

// Factory function example (alternative to class)
document.write("<br><strong>Factory Function Example:</strong><br>");

function createUser(name, email) {
    // Private variables (closure)
    let isLoggedIn = false;
    let loginCount = 0;
    
    // Public API
    return {
        name,
        email,
        
        login() {
            isLoggedIn = true;
            loginCount++;
            return `${name} logged in (${loginCount} times)`;
        },
        
        logout() {
            isLoggedIn = false;
            return `${name} logged out`;
        },
        
        isLoggedIn() {
            return isLoggedIn;
        },
        
        getLoginCount() {
            return loginCount;
        }
    };
}

const user = createUser("John", "john@example.com");
document.write(user.login() + "<br>");
document.write(user.login() + "<br>");
document.write(`Login count: ${user.getLoginCount()}<br>`);