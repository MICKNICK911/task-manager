/**
 * DOM MANIPULATION IN JAVASCRIPT
 * 
 * The Document Object Model (DOM) is a programming interface for HTML/XML documents.
 * It represents the structure of a document as a tree of objects.
 * 
 * Topics covered:
 * - Selecting DOM elements
 * - Traversing the DOM
 * - Manipulating elements
 * - Creating and removing elements
 * - Working with attributes and classes
 * - Styles and CSS
 * - DOM events (covered in events.js)
 */

document.write("<h3>10. DOM Manipulation</h3>");

// ========== SELECTING DOM ELEMENTS ==========

document.write("<strong>Selecting DOM Elements:</strong><br>");

// Since we're using document.write, we can't select existing elements from this page.
// Instead, we'll demonstrate the concepts and show what the code would do.

document.write("Common DOM selection methods:<br>");

// 1. getElementById - selects single element by ID
document.write("document.getElementById('id') - selects by ID<br>");

// 2. getElementsByClassName - returns live HTMLCollection
document.write("document.getElementsByClassName('class') - selects by class<br>");

// 3. getElementsByTagName - returns live HTMLCollection
document.write("document.getElementsByTagName('div') - selects by tag name<br>");

// 4. querySelector - returns first matching element
document.write("document.querySelector('.class') - CSS selector (first match)<br>");

// 5. querySelectorAll - returns static NodeList
document.write("document.querySelectorAll('div.class') - CSS selector (all matches)<br>");

// Creating a demo element to work with
const demoDiv = document.createElement('div');
demoDiv.id = 'demo-element';
demoDiv.innerHTML = '<p class="demo-paragraph">Paragraph 1</p><p class="demo-paragraph">Paragraph 2</p><span>Span element</span>';
document.body.appendChild(demoDiv);

// ========== ELEMENT PROPERTIES AND METHODS ==========

document.write("<br><strong>Element Properties and Methods:</strong><br>");

// Accessing element properties
document.write("Element properties example:<br>");
document.write("demoDiv.id: " + demoDiv.id + "<br>");
document.write("demoDiv.tagName: " + demoDiv.tagName + "<br>");
document.write("demoDiv.className: " + demoDiv.className + "<br>");
document.write("demoDiv.innerHTML: " + demoDiv.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "<br>");
document.write("demoDiv.textContent: " + demoDiv.textContent + "<br>");
document.write("demoDiv.outerHTML: " + demoDiv.outerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 100) + "...<br>");

// ========== TRAVERSING THE DOM ==========

document.write("<br><strong>Traversing the DOM:</strong><br>");

// Parent navigation
document.write("Parent navigation:<br>");
document.write("demoDiv.parentNode: " + (demoDiv.parentNode ? demoDiv.parentNode.tagName : "null") + "<br>");
document.write("demoDiv.parentElement: " + (demoDiv.parentElement ? demoDiv.parentElement.tagName : "null") + "<br>");

// Child navigation
document.write("<br>Child navigation:<br>");
document.write("demoDiv.children: " + demoDiv.children.length + " child elements<br>");
document.write("demoDiv.childNodes: " + demoDiv.childNodes.length + " child nodes (includes text nodes)<br>");
document.write("demoDiv.firstChild: " + demoDiv.firstChild.nodeName + "<br>");
document.write("demoDiv.firstElementChild: " + demoDiv.firstElementChild.tagName + "<br>");
document.write("demoDiv.lastElementChild: " + demoDiv.lastElementChild.tagName + "<br>");

// Sibling navigation
document.write("<br>Sibling navigation:<br>");
const firstPara = demoDiv.firstElementChild;
document.write("firstPara.nextSibling: " + firstPara.nextSibling.nodeName + "<br>");
document.write("firstPara.nextElementSibling: " + firstPara.nextElementSibling.tagName + "<br>");
document.write("firstPara.previousElementSibling: " + (firstPara.previousElementSibling ? firstPara.previousElementSibling.tagName : "null") + "<br>");

// ========== MANIPULATING ELEMENTS ==========

document.write("<br><strong>Manipulating Elements:</strong><br>");

// Changing content
demoDiv.firstElementChild.textContent = "Updated paragraph text";
document.write("Changed textContent of first paragraph<br>");

// Creating new elements
const newParagraph = document.createElement('p');
newParagraph.textContent = "This is a new paragraph created with JavaScript";
demoDiv.appendChild(newParagraph);
document.write("Appended new paragraph to demoDiv<br>");

// Inserting elements
const insertedParagraph = document.createElement('p');
insertedParagraph.textContent = "Inserted paragraph";
demoDiv.insertBefore(insertedParagraph, demoDiv.firstElementChild);
document.write("Inserted paragraph before first child<br>");

// Replacing elements
const replacementParagraph = document.createElement('p');
replacementParagraph.textContent = "Replacement paragraph";
demoDiv.replaceChild(replacementParagraph, demoDiv.children[1]);
document.write("Replaced second child element<br>");

// Removing elements
demoDiv.removeChild(demoDiv.children[2]);
document.write("Removed third child element<br>");

// Clone elements
const clonedElement = demoDiv.cloneNode(true);
clonedElement.id = 'cloned-demo';
document.body.appendChild(clonedElement);
document.write("Cloned demoDiv (deep clone)<br>");

// ========== WORKING WITH ATTRIBUTES ==========

document.write("<br><strong>Working with Attributes:</strong><br>");

// Setting attributes
demoDiv.setAttribute('data-custom', 'custom-value');
demoDiv.setAttribute('title', 'Demo element tooltip');

// Getting attributes
document.write("demoDiv.getAttribute('data-custom'): " + demoDiv.getAttribute('data-custom') + "<br>");
document.write("demoDiv.getAttribute('title'): " + demoDiv.getAttribute('title') + "<br>");

// Checking attributes
document.write("demoDiv.hasAttribute('data-custom'): " + demoDiv.hasAttribute('data-custom') + "<br>");
document.write("demoDiv.hasAttribute('non-existent'): " + demoDiv.hasAttribute('non-existent') + "<br>");

// Removing attributes
demoDiv.removeAttribute('title');
document.write("After removeAttribute('title'): " + demoDiv.hasAttribute('title') + "<br>");

// Dataset API (data-* attributes)
demoDiv.dataset.userId = '12345';
demoDiv.dataset.userRole = 'admin';
document.write("demoDiv.dataset.userId: " + demoDiv.dataset.userId + "<br>");
document.write("demoDiv.dataset.userRole: " + demoDiv.dataset.userRole + "<br>");

// ========== WORKING WITH CLASSES ==========

document.write("<br><strong>Working with Classes:</strong><br>");

// Using className
demoDiv.className = 'container primary';
document.write("demoDiv.className: " + demoDiv.className + "<br>");

// Using classList API (modern approach)
demoDiv.classList.add('highlight', 'padded');
demoDiv.classList.remove('primary');
demoDiv.classList.toggle('active'); // Adds 'active'
demoDiv.classList.toggle('active'); // Removes 'active'

document.write("demoDiv.classList contains 'highlight': " + demoDiv.classList.contains('highlight') + "<br>");
document.write("demoDiv.classList contains 'primary': " + demoDiv.classList.contains('primary') + "<br>");

// Iterating through classes
document.write("Classes: ");
demoDiv.classList.forEach(className => {
    document.write(className + " ");
});
document.write("<br>");

// ========== MANIPULATING STYLES ==========

document.write("<br><strong>Manipulating Styles:</strong><br>");

// Inline styles
demoDiv.style.backgroundColor = '#f0f0f0';
demoDiv.style.padding = '20px';
demoDiv.style.border = '2px solid #3498db';
demoDiv.style.borderRadius = '10px';
demoDiv.style.fontFamily = 'Arial, sans-serif';

document.write("Set inline styles on demoDiv:<br>");
document.write("- Background color<br>");
document.write("- Padding<br>");
document.write("- Border<br>");
document.write("- Border radius<br>");
document.write("- Font family<br>");

// Getting computed styles
const computedStyles = window.getComputedStyle(demoDiv);
document.write("Computed background color: " + computedStyles.backgroundColor + "<br>");
document.write("Computed padding: " + computedStyles.padding + "<br>");

// CSS custom properties (CSS variables)
demoDiv.style.setProperty('--custom-color', '#e74c3c');
demoDiv.style.setProperty('--custom-size', '16px');

// ========== WORKING WITH FORMS ==========

document.write("<br><strong>Working with Form Elements:</strong><br>");

// Create a form for demonstration
const form = document.createElement('form');
form.id = 'demo-form';

const input = document.createElement('input');
input.type = 'text';
input.id = 'username';
input.name = 'username';
input.value = 'John Doe';
input.placeholder = 'Enter username';

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.id = 'subscribe';
checkbox.name = 'subscribe';
checkbox.checked = true;

const select = document.createElement('select');
select.id = 'country';
const option1 = document.createElement('option');
option1.value = 'us';
option1.textContent = 'United States';
const option2 = document.createElement('option');
option2.value = 'uk';
option2.textContent = 'United Kingdom';
select.appendChild(option1);
select.appendChild(option2);

form.appendChild(input);
form.appendChild(checkbox);
form.appendChild(select);
document.body.appendChild(form);

// Accessing form values
document.write("input.value: " + input.value + "<br>");
document.write("checkbox.checked: " + checkbox.checked + "<br>");
document.write("select.value: " + select.value + "<br>");

// Form validation properties
input.required = true;
document.write("input.required: " + input.required + "<br>");
document.write("input.validity.valid: " + input.validity.valid + "<br>");

// ========== DOM CONTENT MANIPULATION ==========

document.write("<br><strong>DOM Content Manipulation:</strong><br>");

// innerHTML vs textContent vs innerText
const contentDemo = document.createElement('div');
contentDemo.innerHTML = '<p>First line<br>Second line</p>';
document.body.appendChild(contentDemo);

document.write("innerHTML: " + contentDemo.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "<br>");
document.write("textContent: " + contentDemo.textContent + "<br>");
document.write("innerText: " + contentDemo.innerText + "<br>");

// Differences:
// - innerHTML: Gets/sets HTML content
// - textContent: Gets/sets text content (faster, ignores styling)
// - innerText: Gets/sets visible text (respects CSS, slower)

// insertAdjacentHTML
const insertDemo = document.createElement('div');
insertDemo.id = 'insert-demo';
insertDemo.innerHTML = '<p>Original content</p>';
document.body.appendChild(insertDemo);

insertDemo.insertAdjacentHTML('beforebegin', '<p>Before begin</p>');
insertDemo.insertAdjacentHTML('afterbegin', '<p>After begin</p>');
insertDemo.insertAdjacentHTML('beforeend', '<p>Before end</p>');
insertDemo.insertAdjacentHTML('afterend', '<p>After end</p>');

document.write("Used insertAdjacentHTML with all four positions<br>");

// ========== ELEMENT DIMENSIONS AND POSITION ==========

document.write("<br><strong>Element Dimensions and Position:</strong><br>");

const box = document.createElement('div');
box.style.width = '200px';
box.style.height = '100px';
box.style.padding = '20px';
box.style.border = '5px solid black';
box.style.margin = '30px';
box.style.backgroundColor = '#e0e0e0';
box.textContent = 'Test box for dimensions';
document.body.appendChild(box);

// Different size properties
document.write("box.clientWidth: " + box.clientWidth + "px (width + padding)<br>");
document.write("box.clientHeight: " + box.clientHeight + "px (height + padding)<br>");
document.write("box.offsetWidth: " + box.offsetWidth + "px (width + padding + border)<br>");
document.write("box.offsetHeight: " + box.offsetHeight + "px (height + padding + border)<br>");
document.write("box.scrollWidth: " + box.scrollWidth + "px<br>");
document.write("box.scrollHeight: " + box.scrollHeight + "px<br>");

// Position properties
document.write("box.offsetTop: " + box.offsetTop + "px<br>");
document.write("box.offsetLeft: " + box.offsetLeft + "px<br>");

// getBoundingClientRect()
const rect = box.getBoundingClientRect();
document.write("getBoundingClientRect():<br>");
document.write("  top: " + rect.top + "px, left: " + rect.left + "px<br>");
document.write("  width: " + rect.width + "px, height: " + rect.height + "px<br>");

// ========== DOM MANIPULATION BEST PRACTICES ==========

document.write("<br><strong>DOM Manipulation Best Practices:</strong><br>");
document.write("1. Cache DOM references when reusing elements<br>");
document.write("2. Use documentFragment for multiple DOM operations<br>");
document.write("3. Batch DOM changes to minimize reflows<br>");
document.write("4. Use classList instead of className for class manipulation<br>");
document.write("5. Prefer textContent over innerHTML for plain text<br>");
document.write("6. Remove event listeners when elements are removed<br>");
document.write("7. Use data-* attributes for custom data<br>");
document.write("8. Check element existence before manipulation<br>");

// DocumentFragment example
document.write("<br>DocumentFragment example:<br>");
const fragment = document.createDocumentFragment();

for (let i = 1; i <= 5; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}

const list = document.createElement('ul');
list.appendChild(fragment);
document.body.appendChild(list);
document.write("Created list with DocumentFragment (single reflow)<br>");

// Clean up demo elements
setTimeout(() => {
    demoDiv.remove();
    clonedElement.remove();
    form.remove();
    contentDemo.remove();
    insertDemo.remove();
    box.remove();
    list.remove();
}, 100);