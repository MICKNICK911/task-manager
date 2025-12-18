/**
 * ES6 MODULES IN JAVASCRIPT
 * 
 * ES6 modules provide a standardized way to organize JavaScript code into reusable pieces.
 * Modules have their own scope and can export/import functionality.
 * 
 * Topics covered:
 * - Export declarations (named, default)
 * - Import statements
 * - Module patterns
 * - Dynamic imports
 * - Module bundlers (concept)
 * - CommonJS vs ES6 modules
 */

document.write("<h3>15. Modules</h3>");

// Note: Since we're working in a single file, we'll simulate module behavior.
// In real projects, you'd have separate .js files.

// ========== NAMED EXPORTS ==========

document.write("<strong>Named Exports:</strong><br>");

// Simulating a module that would normally be in a separate file
// In a real module file (e.g., mathUtils.js):
// export const PI = 3.14159;
// export function add(a, b) { return a + b; }
// export function multiply(a, b) { return a * b; }

// Creating objects to simulate exports
const mathUtils = {
    PI: 3.14159,
    add: function(a, b) { return a + b; },
    multiply: function(a, b) { return a * b; },
    subtract: function(a, b) { return a - b; },
    divide: function(a, b) { return a / b; }
};

document.write("Simulating named exports from mathUtils module:<br>");
document.write(`PI = ${mathUtils.PI}<br>`);
document.write(`add(5, 3) = ${mathUtils.add(5, 3)}<br>`);
document.write(`multiply(4, 7) = ${mathUtils.multiply(4, 7)}<br>`);

// ========== DEFAULT EXPORTS ==========

document.write("<br><strong>Default Exports:</strong><br>");

// Simulating a module with default export (e.g., Logger.js)
// In a real module file:
// class Logger {
//   log(message) { console.log(message); }
// }
// export default Logger;

class Logger {
    constructor(name) {
        this.name = name;
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        return `[${this.name}] ${timestamp}: ${message}`;
    }
}

// Simulating default export
const defaultExport = Logger;

document.write("Simulating default export (Logger class):<br>");
const myLogger = new defaultExport("App");
document.write(myLogger.log("Hello from module!") + "<br>");

// ========== IMPORT STATEMENTS ==========

document.write("<br><strong>Import Statements:</strong><br>");

// Simulating different import styles

// 1. Importing named exports
// In a real file: import { PI, add } from './mathUtils.js';
document.write("1. Importing named exports:<br>");
document.write(`import { PI, add } from './mathUtils.js'<br>`);
document.write(`Would give access to: PI=${mathUtils.PI}, add(2,3)=${mathUtils.add(2, 3)}<br>`);

// 2. Importing with aliases
// import { multiply as mul, divide as div } from './mathUtils.js';
document.write("<br>2. Importing with aliases:<br>");
document.write("import { multiply as mul, divide as div } from './mathUtils.js'<br>");
document.write(`Would allow: mul(3, 4)=${mathUtils.multiply(3, 4)}<br>`);

// 3. Importing all named exports as an object
// import * as Math from './mathUtils.js';
document.write("<br>3. Importing all as namespace:<br>");
document.write("import * as Math from './mathUtils.js'<br>");
document.write(`Would allow: Math.PI=${mathUtils.PI}, Math.add(1,2)=${mathUtils.add(1, 2)}<br>`);

// 4. Importing default export
// import Logger from './Logger.js';
document.write("<br>4. Importing default export:<br>");
document.write("import Logger from './Logger.js'<br>");
document.write("import MyLogger from './Logger.js' (any name works for default)<br>");

// 5. Mixed imports
// import Logger, { PI, add } from './combined.js';
document.write("<br>5. Mixed imports (default and named):<br>");
document.write("import Logger, { PI, add } from './combined.js'<br>");

// ========== EXPORT VARIATIONS ==========

document.write("<br><strong>Export Variations:</strong><br>");

// Simulating different export styles in a module

// 1. Inline exports (as shown earlier)
document.write("1. Inline exports:<br>");
document.write("export const version = '1.0.0';<br>");
document.write("export function greet() { return 'Hello'; }<br>");

// 2. Export list
// const version = '1.0.0';
// function greet() { return 'Hello'; }
// export { version, greet };
document.write("<br>2. Export list:<br>");
document.write("const version = '1.0.0';<br>");
document.write("function greet() { return 'Hello'; }<br>");
document.write("export { version, greet };<br>");

// 3. Export with renaming
// export { version as ver, greet as sayHello };
document.write("<br>3. Export with renaming:<br>");
document.write("export { version as ver, greet as sayHello };<br>");

// 4. Re-exporting (aggregating modules)
// export { PI, add } from './mathUtils.js';
// export { default as Logger } from './Logger.js';
document.write("<br>4. Re-exporting (barrel exports):<br>");
document.write("export { PI, add } from './mathUtils.js';<br>");
document.write("export { default as Logger } from './Logger.js';<br>");

// 5. Default export variations
document.write("<br>5. Default export variations:<br>");
document.write("// Exporting a value directly<br>");
document.write("export default 42;<br><br>");
document.write("// Exporting an expression<br>");
document.write("export default function() { return 'Hello'; }<br><br>");
document.write("// Exporting an existing variable as default<br>");
document.write("const myFunction = () => 'Hello';<br>");
document.write("export { myFunction as default };<br>");

// ========== MODULE SCOPE ==========

document.write("<br><strong>Module Scope:</strong><br>");

// In modules, everything is private by default
// Only exported items are accessible from outside

document.write("In modules, variables are not added to global scope:<br>");

// Simulating module scope
(function() {
    // This simulates module private scope
    const privateVariable = "I'm private";
    let privateCounter = 0;
    
    function privateHelper() {
        privateCounter++;
        return `Helper called ${privateCounter} times`;
    }
    
    // Only these would be accessible if exported
    const publicApi = {
        publicMethod: function() {
            return privateHelper() + " via public method";
        },
        
        getPrivateInfo: function() {
            return `Private variable starts with: ${privateVariable.substring(0, 5)}...`;
        }
    };
    
    // In a real module: export publicApi;
    document.write(publicApi.publicMethod() + "<br>");
    document.write(publicApi.getPrivateInfo() + "<br>");
})();

// privateVariable is not accessible here (would be undefined in real module)
document.write("Private module variables are not in global scope<br>");

// ========== DYNAMIC IMPORTS ==========

document.write("<br><strong>Dynamic Imports:</strong><br>");

// Dynamic imports return a promise
document.write("Dynamic import syntax: import('./module.js')<br>");
document.write("Returns a Promise that resolves to the module<br>");

// Simulating dynamic import
function simulateDynamicImport(moduleName) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate loading different modules
            const modules = {
                'math': mathUtils,
                'logger': defaultExport
            };
            
            resolve(modules[moduleName] || {});
        }, 200);
    });
}

// Using dynamic import
document.write("Simulating dynamic import of 'math' module...<br>");
simulateDynamicImport('math').then(module => {
    document.write(`Dynamic import result: PI = ${module.PI}, add(10, 5) = ${module.add(10, 5)}<br>`);
});

// Dynamic import with async/await
setTimeout(async () => {
    document.write("<br>Simulating dynamic import with async/await...<br>");
    const module = await simulateDynamicImport('math');
    document.write(`Async dynamic import: multiply(6, 7) = ${module.multiply(6, 7)}<br>`);
}, 300);

// ========== COMMONJS VS ES6 MODULES ==========

document.write("<br><strong>CommonJS vs ES6 Modules:</strong><br>");

document.write("<strong>CommonJS (Node.js):</strong><br>");
document.write("// Exporting<br>");
document.write("module.exports = { add, subtract };<br>");
document.write("// or<br>");
document.write("exports.add = add;<br><br>");

document.write("// Importing<br>");
document.write("const math = require('./mathUtils');<br>");
document.write("const { add } = require('./mathUtils');<br>");

document.write("<br><strong>ES6 Modules:</strong><br>");
document.write("// Exporting<br>");
document.write("export { add, subtract };<br>");
document.write("export default mathUtils;<br><br>");

document.write("// Importing<br>");
document.write("import { add } from './mathUtils.js';<br>");
document.write("import mathUtils from './mathUtils.js';<br>");

document.write("<br>Key differences:<br>");
document.write("1. CommonJS: require() is synchronous, ES6: import is asynchronous<br>");
document.write("2. CommonJS: module.exports, ES6: export keyword<br>");
document.write("3. CommonJS: runtime resolution, ES6: static resolution (at parse time)<br>");
document.write("4. CommonJS: .js extension optional, ES6: .js extension required<br>");

// ========== MODULE PATTERNS ==========

document.write("<br><strong>Module Patterns:</strong><br>");

// 1. Singleton pattern with module
document.write("1. Singleton pattern:<br>");

const ConfigManager = (function() {
    // Private instance variable
    let instance = null;
    
    // Private configuration
    let config = {
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3
    };
    
    // Private methods
    function validateConfig(newConfig) {
        return typeof newConfig === 'object' && newConfig !== null;
    }
    
    // Public API
    class ConfigManagerClass {
        constructor() {
            if (instance) {
                return instance;
            }
            instance = this;
        }
        
        get(key) {
            return config[key];
        }
        
        set(key, value) {
            config[key] = value;
            return this;
        }
        
        getAll() {
            return { ...config }; // Return copy
        }
        
        update(newConfig) {
            if (validateConfig(newConfig)) {
                config = { ...config, ...newConfig };
            }
            return this;
        }
    }
    
    return ConfigManagerClass;
})();

const config1 = new ConfigManager();
const config2 = new ConfigManager();

document.write(`config1 === config2: ${config1 === config2} (same instance)<br>`);
document.write(`API URL: ${config1.get('apiUrl')}<br>`);

config1.set('timeout', 10000);
document.write(`Updated timeout: ${config2.get('timeout')} (both instances see change)<br>`);

// 2. Factory module
document.write("<br>2. Factory module pattern:<br>");

const UserFactory = (function() {
    // Private counter
    let idCounter = 0;
    
    // Private validation
    function validateEmail(email) {
        return email.includes('@');
    }
    
    // Public API
    return {
        createUser: function(name, email) {
            if (!validateEmail(email)) {
                throw new Error('Invalid email');
            }
            
            idCounter++;
            
            return {
                id: idCounter,
                name,
                email,
                isActive: true,
                
                deactivate: function() {
                    this.isActive = false;
                    return this;
                },
                
                getInfo: function() {
                    return `${this.name} (${this.email}) - ${this.isActive ? 'Active' : 'Inactive'}`;
                }
            };
        },
        
        getCreatedCount: function() {
            return idCounter;
        }
    };
})();

const user1 = UserFactory.createUser("Alice", "alice@example.com");
const user2 = UserFactory.createUser("Bob", "bob@example.com");

document.write(user1.getInfo() + "<br>");
document.write(user2.getInfo() + "<br>");
document.write(`Total users created: ${UserFactory.getCreatedCount()}<br>`);

user1.deactivate();
document.write(`After deactivation: ${user1.getInfo()}<br>`);

// 3. Revealing module pattern
document.write("<br>3. Revealing module pattern:<br>");

const Calculator = (function() {
    // Private implementation details
    function add(a, b) {
        return a + b;
    }
    
    function subtract(a, b) {
        return a - b;
    }
    
    function multiply(a, b) {
        return a * b;
    }
    
    function divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }
    
    // Private helper (not exposed)
    function formatResult(value) {
        return `Result: ${value}`;
    }
    
    // Public API (revealing only what we want)
    return {
        add: function(a, b) {
            return formatResult(add(a, b));
        },
        subtract: function(a, b) {
            return formatResult(subtract(a, b));
        },
        multiply: function(a, b) {
            return formatResult(multiply(a, b));
        },
        divide: function(a, b) {
            return formatResult(divide(a, b));
        }
    };
})();

document.write(Calculator.add(10, 5) + "<br>");
document.write(Calculator.multiply(4, 7) + "<br>");

// ========== MODULE BUNDLERS ==========

document.write("<br><strong>Module Bundlers:</strong><br>");

document.write("Module bundlers combine multiple modules into one or more bundles:<br>");
document.write("1. <strong>Webpack</strong> - Most popular, highly configurable<br>");
document.write("2. <strong>Rollup</strong> - Good for libraries, tree-shaking<br>");
document.write("3. <strong>Parcel</strong> - Zero configuration, fast<br>");
document.write("4. <strong>ESBuild</strong> - Extremely fast, written in Go<br>");
document.write("5. <strong>Vite</strong> - Next generation, uses ES modules natively<br>");

document.write("<br>Key bundler features:<br>");
document.write("- Tree shaking (dead code elimination)<br>");
document.write("- Code splitting<br>");
document.write("- Hot module replacement (HMR)<br>");
document.write("- Transpilation (Babel, TypeScript)<br>");
document.write("- Asset management (CSS, images, fonts)<br>");

// ========== MODULE BEST PRACTICES ==========

document.write("<br><strong>Module Best Practices:</strong><br>");

document.write("1. Use ES6 modules for new projects<br>");
document.write("2. Keep modules focused and small (single responsibility)<br>");
document.write("3. Use default exports for the main functionality of a module<br>");
document.write("4. Use named exports for utilities and helpers<br>");
document.write("5. Avoid circular dependencies<br>");
document.write("6. Use index.js files for barrel exports (re-exporting)<br>");
document.write("7. Consider using absolute imports with path aliases<br>");
document.write("8. Use dynamic imports for code splitting and lazy loading<br>");
document.write("9. Document exported API with JSDoc comments<br>");
document.write("10. Keep module interfaces stable (avoid breaking changes)<br>");

// ========== TREE SHAKING EXAMPLE ==========

document.write("<br><strong>Tree Shaking Example:</strong><br>");

// Tree shaking eliminates unused code during bundling
document.write("With tree shaking, unused exports are removed from the final bundle:<br>");

// Simulating a module that exports multiple functions
const utilsModule = {
    usedFunction: () => "I'm used",
    unusedFunction: () => "I'm not used",
    anotherUsedFunction: () => "I'm also used"
};

document.write("If a module exports 3 functions but only 2 are imported,<br>");
document.write("the unused function won't be included in the bundle.<br>");

// ========== CIRCULAR DEPENDENCIES ==========

document.write("<br><strong>Circular Dependencies:</strong><br>");

document.write("Circular dependencies (A imports B, B imports A) can cause issues:<br>");
document.write("- May work but can lead to undefined values<br>");
document.write("- Harder to reason about<br>");
document.write("- Can cause runtime errors<br>");

document.write("<br>Solutions:<br>");
document.write("1. Refactor to remove circular dependency<br>");
document.write("2. Move shared code to a third module<br>");
document.write("3. Use dependency injection<br>");
document.write("4. Merge modules if they're tightly coupled<br>");

// Simulating problematic circular dependency
document.write("<br>Example of problematic structure:<br>");
document.write("// moduleA.js<br>");
document.write("import { funcB } from './moduleB.js';<br>");
document.write("export function funcA() { return funcB(); }<br><br>");

document.write("// moduleB.js<br>");
document.write("import { funcA } from './moduleA.js';<br>");
document.write("export function funcB() { return funcA(); } // Circular!<br>");