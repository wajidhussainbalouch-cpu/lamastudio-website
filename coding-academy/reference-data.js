/* Original LAMA Coding Academy quick-reference learning content.
 * Inspired by user-supplied screenshots; definitions reviewed against MDN/HTML Standard.
 * No scraped third-party images or copyrighted question bank content.
 */
(function(root){
"use strict";
const symbols=[
 {
  "id": "symbol-01",
  "level": 1,
  "token": "{ }",
  "name": "Curly braces",
  "meaning": "Group JavaScript code blocks and CSS declarations.",
  "language": "JavaScript / CSS",
  "example": "if (ready) { show(); }",
  "tip": "Braces are not used to start Python code blocks."
 },
 {
  "id": "symbol-02",
  "level": 1,
  "token": "( )",
  "name": "Parentheses",
  "meaning": "Hold function arguments and group expressions.",
  "language": "JavaScript / Python",
  "example": "print('Hello')",
  "tip": "In JavaScript and Python, call a function with parentheses."
 },
 {
  "id": "symbol-03",
  "level": 1,
  "token": "[ ]",
  "name": "Square brackets",
  "meaning": "Create lists or arrays, or access values by position.",
  "language": "JavaScript / Python",
  "example": "const colors = ['red', 'blue'];",
  "tip": "The first array position is usually index 0."
 },
 {
  "id": "symbol-04",
  "level": 1,
  "token": "< >",
  "name": "Angle brackets",
  "meaning": "Surround HTML tags; each character is also a comparison symbol in code.",
  "language": "HTML / JavaScript",
  "example": "<p>Welcome</p>",
  "tip": "In HTML, ordinary text should go inside real elements."
 },
 {
  "id": "symbol-05",
  "level": 1,
  "token": ";",
  "name": "Semicolon",
  "meaning": "Separates statements in JavaScript and CSS declarations.",
  "language": "JavaScript / CSS",
  "example": "let age = 12;",
  "tip": "Many JavaScript semicolons are optional, but useful for clarity."
 },
 {
  "id": "symbol-06",
  "level": 1,
  "token": ":",
  "name": "Colon",
  "meaning": "Separates a CSS property from a value; ends Python if/loop headers.",
  "language": "CSS / Python",
  "example": "color: blue;",
  "tip": "A colon plays different roles in different languages."
 },
 {
  "id": "symbol-07",
  "level": 1,
  "token": ",",
  "name": "Comma",
  "meaning": "Separates items or arguments.",
  "language": "JavaScript / Python",
  "example": "const values = [2, 4, 6];",
  "tip": "Commas have different meanings inside strings."
 },
 {
  "id": "symbol-08",
  "level": 1,
  "token": ".",
  "name": "Dot",
  "meaning": "Accesses a property of an object.",
  "language": "JavaScript / Python",
  "example": "student.name",
  "tip": "A dot can also be used in decimal numbers."
 },
 {
  "id": "symbol-09",
  "level": 1,
  "token": "...",
  "name": "Ellipsis / spread",
  "meaning": "Expands or collects values in JavaScript.",
  "language": "JavaScript",
  "example": "const copy = [...items];",
  "tip": "The three-dot syntax is context-dependent."
 },
 {
  "id": "symbol-10",
  "level": 1,
  "token": "=",
  "name": "Assignment",
  "meaning": "Stores a value in a variable.",
  "language": "JavaScript",
  "example": "let score = 10;",
  "tip": "In JavaScript, = is not a comparison operator."
 },
 {
  "id": "symbol-11",
  "level": 2,
  "token": "==",
  "name": "Loose equality",
  "meaning": "Compares values with JavaScript type coercion.",
  "language": "JavaScript",
  "example": "5 == '5' // true",
  "tip": "Beginners should usually prefer ===."
 },
 {
  "id": "symbol-12",
  "level": 2,
  "token": "===",
  "name": "Strict equality",
  "meaning": "Compares value and type without coercion.",
  "language": "JavaScript",
  "example": "5 === '5' // false",
  "tip": "Python does not have ===."
 },
 {
  "id": "symbol-13",
  "level": 2,
  "token": "!=",
  "name": "Loose inequality",
  "meaning": "Tests whether values differ after coercion.",
  "language": "JavaScript",
  "example": "5 != '5' // false",
  "tip": "Prefer !== when checking strict inequality in JavaScript."
 },
 {
  "id": "symbol-14",
  "level": 2,
  "token": "!==",
  "name": "Strict inequality",
  "meaning": "Tests value/type inequality without coercion.",
  "language": "JavaScript",
  "example": "5 !== '5' // true",
  "tip": "This operator is not used in Python."
 },
 {
  "id": "symbol-15",
  "level": 2,
  "token": ">",
  "name": "Greater than",
  "meaning": "Checks whether the left value is larger.",
  "language": "JavaScript / Python",
  "example": "8 > 3 // true",
  "tip": "In HTML it can also close an opening tag."
 },
 {
  "id": "symbol-16",
  "level": 2,
  "token": "<",
  "name": "Less than",
  "meaning": "Checks whether the left value is smaller.",
  "language": "JavaScript / Python",
  "example": "2 < 8 // true",
  "tip": "In HTML it can also start a tag."
 },
 {
  "id": "symbol-17",
  "level": 2,
  "token": ">=",
  "name": "Greater or equal",
  "meaning": "Checks whether the left value is at least the right value.",
  "language": "JavaScript / Python",
  "example": "marks >= 40",
  "tip": "Useful for minimum marks or age rules."
 },
 {
  "id": "symbol-18",
  "level": 2,
  "token": "<=",
  "name": "Less or equal",
  "meaning": "Checks whether the left value does not exceed the right value.",
  "language": "JavaScript / Python",
  "example": "age <= 12",
  "tip": "Useful for ranges and upper limits."
 },
 {
  "id": "symbol-19",
  "level": 2,
  "token": "+",
  "name": "Addition",
  "meaning": "Adds numbers, or joins strings in JavaScript.",
  "language": "JavaScript / Python",
  "example": "3 + 4 // 7",
  "tip": "A string and number can behave differently in JavaScript."
 },
 {
  "id": "symbol-20",
  "level": 2,
  "token": "-",
  "name": "Subtraction",
  "meaning": "Subtracts a number from another.",
  "language": "JavaScript / Python",
  "example": "10 - 3 // 7",
  "tip": "Can also denote a negative number."
 },
 {
  "id": "symbol-21",
  "level": 3,
  "token": "*",
  "name": "Multiplication",
  "meaning": "Multiplies two numeric values to find their product.",
  "language": "JavaScript / Python",
  "example": "6 * 5 // 30",
  "tip": "In SQL, SELECT * means all columns, not multiplication."
 },
 {
  "id": "symbol-22",
  "level": 3,
  "token": "/",
  "name": "Division",
  "meaning": "Divides one number by another.",
  "language": "JavaScript / Python",
  "example": "12 / 3 // 4",
  "tip": "Division by zero needs special handling."
 },
 {
  "id": "symbol-23",
  "level": 3,
  "token": "%",
  "name": "Remainder / modulo",
  "meaning": "Returns a remainder after division in common coding expressions.",
  "language": "JavaScript / Python",
  "example": "10 % 3 // 1",
  "tip": "Negative operands differ between languages."
 },
 {
  "id": "symbol-24",
  "level": 3,
  "token": "**",
  "name": "Exponent",
  "meaning": "Raises a value to a power.",
  "language": "JavaScript / Python",
  "example": "2 ** 3 // 8",
  "tip": "This operator is not supported in all languages."
 },
 {
  "id": "symbol-25",
  "level": 3,
  "token": "++",
  "name": "Increment",
  "meaning": "Adds one using JavaScript's increment operator.",
  "language": "JavaScript",
  "example": "count++",
  "tip": "Python does not support ++ as an increment operator."
 },
 {
  "id": "symbol-26",
  "level": 3,
  "token": "--",
  "name": "Decrement",
  "meaning": "Subtracts one using JavaScript's decrement operator.",
  "language": "JavaScript",
  "example": "count--",
  "tip": "Python does not support -- as a decrement operator."
 },
 {
  "id": "symbol-27",
  "level": 3,
  "token": "&&",
  "name": "Logical AND",
  "meaning": "Checks that both JavaScript conditions are truthy.",
  "language": "JavaScript",
  "example": "age >= 18 && hasID",
  "tip": "Python uses the word and instead."
 },
 {
  "id": "symbol-28",
  "level": 3,
  "token": "||",
  "name": "Logical OR",
  "meaning": "Checks whether at least one JavaScript condition is truthy.",
  "language": "JavaScript",
  "example": "isAdmin || isTeacher",
  "tip": "Python uses the word or instead."
 },
 {
  "id": "symbol-29",
  "level": 3,
  "token": "!",
  "name": "Logical NOT",
  "meaning": "Reverses a JavaScript truthy/falsy test.",
  "language": "JavaScript",
  "example": "!isAbsent",
  "tip": "Python uses the word not instead."
 },
 {
  "id": "symbol-30",
  "level": 3,
  "token": "? :",
  "name": "Ternary condition",
  "meaning": "Chooses one of two values using a short conditional expression.",
  "language": "JavaScript",
  "example": "score >= 50 ? 'Pass' : 'Try again'",
  "tip": "Python uses 'valueIfTrue if test else valueIfFalse'."
 }
];
const inputs=[
 {
  "id": "input-text",
  "type": "text",
  "name": "Text",
  "meaning": "Enter ordinary short text.",
  "code": "<input type=\"text\" placeholder=\"Your first name\">",
  "tip": "Use for names; always pair a label with the field."
 },
 {
  "id": "input-password",
  "type": "password",
  "name": "Password",
  "meaning": "Enter concealed characters.",
  "code": "<input type=\"password\" autocomplete=\"off\">",
  "tip": "A password field only masks the display; it does not encrypt data by itself."
 },
 {
  "id": "input-email",
  "type": "email",
  "name": "Email",
  "meaning": "Enter an email address with built-in format checks.",
  "code": "<input type=\"email\" placeholder=\"name@example.com\">",
  "tip": "Browsers may display an email-friendly keyboard on phones."
 },
 {
  "id": "input-number",
  "type": "number",
  "name": "Number",
  "meaning": "Enter a numeric quantity.",
  "code": "<input type=\"number\" min=\"0\" max=\"100\">",
  "tip": "Use type=tel for phone numbers to preserve leading zeroes."
 },
 {
  "id": "input-tel",
  "type": "tel",
  "name": "Telephone",
  "meaning": "Enter a telephone number as text.",
  "code": "<input type=\"tel\" placeholder=\"0300...\">",
  "tip": "Telephone input does not automatically validate every country's phone format."
 },
 {
  "id": "input-url",
  "type": "url",
  "name": "Website URL",
  "meaning": "Enter a web address with basic URL validation.",
  "code": "<input type=\"url\" placeholder=\"https://example.org\">",
  "tip": "Browsers can show a URL-oriented phone keyboard."
 },
 {
  "id": "input-search",
  "type": "search",
  "name": "Search",
  "meaning": "Enter a search query.",
  "code": "<input type=\"search\" placeholder=\"Search lessons\">",
  "tip": "This does not search anything until you write the search logic."
 },
 {
  "id": "input-date",
  "type": "date",
  "name": "Date",
  "meaning": "Choose a calendar date.",
  "code": "<input type=\"date\">",
  "tip": "The date-picker appearance depends on the browser."
 },
 {
  "id": "input-time",
  "type": "time",
  "name": "Time",
  "meaning": "Choose a time of day.",
  "code": "<input type=\"time\">",
  "tip": "Time values do not automatically include a time zone."
 },
 {
  "id": "input-datetime-local",
  "type": "datetime-local",
  "name": "Local date and time",
  "meaning": "Choose a date plus local clock time.",
  "code": "<input type=\"datetime-local\">",
  "tip": "This does not include time-zone information."
 },
 {
  "id": "input-month",
  "type": "month",
  "name": "Month",
  "meaning": "Choose a month and year.",
  "code": "<input type=\"month\">",
  "tip": "Some older browsers may show a text fallback."
 },
 {
  "id": "input-week",
  "type": "week",
  "name": "Week",
  "meaning": "Choose an ISO calendar week and year.",
  "code": "<input type=\"week\">",
  "tip": "Support varies by browser; some show a plain text field."
 },
 {
  "id": "input-color",
  "type": "color",
  "name": "Color",
  "meaning": "Choose a color.",
  "code": "<input type=\"color\" value=\"#316afa\">",
  "tip": "Returns a color value; browsers may use different picker designs."
 },
 {
  "id": "input-range",
  "type": "range",
  "name": "Slider",
  "meaning": "Slide between a minimum and maximum number.",
  "code": "<input type=\"range\" min=\"0\" max=\"100\" value=\"40\">",
  "tip": "A slider is suited to approximate quantities."
 },
 {
  "id": "input-checkbox",
  "type": "checkbox",
  "name": "Checkbox",
  "meaning": "Choose yes/no or multiple independent options.",
  "code": "<input type=\"checkbox\">",
  "tip": "More than one checkbox may be selected."
 },
 {
  "id": "input-radio",
  "type": "radio",
  "name": "Radio",
  "meaning": "Choose exactly one option from a named group.",
  "code": "<input type=\"radio\" name=\"choice\" value=\"yes\">",
  "tip": "Same-name radio inputs form one group."
 },
 {
  "id": "input-file",
  "type": "file",
  "name": "File picker",
  "meaning": "Choose a file from the device.",
  "code": "<input type=\"file\">",
  "tip": "This lab never uploads or reads your selected file."
 },
 {
  "id": "input-hidden",
  "type": "hidden",
  "name": "Hidden field",
  "meaning": "Store a form value that is not visible to visitors.",
  "code": "<input type=\"hidden\" value=\"demo\">",
  "tip": "Hidden data is NOT secret; anyone can inspect the page source."
 },
 {
  "id": "input-button",
  "type": "button",
  "name": "Button",
  "meaning": "Run a script when tapped.",
  "code": "<input type=\"button\" value=\"Tap me\">",
  "tip": "A button does not submit a form by default."
 },
 {
  "id": "input-submit",
  "type": "submit",
  "name": "Submit",
  "meaning": "Ask the form to submit.",
  "code": "<input type=\"submit\" value=\"Submit demo\">",
  "tip": "Here submission is intercepted; nothing is sent."
 },
 {
  "id": "input-reset",
  "type": "reset",
  "name": "Reset",
  "meaning": "Restore other controls in the same form to their defaults.",
  "code": "<input type=\"reset\" value=\"Reset demo\">",
  "tip": "Reset clears local form changes, not saved app progress."
 },
 {
  "id": "input-image",
  "type": "image",
  "name": "Image submit",
  "meaning": "Use an image as a form submit control.",
  "code": "<input type=\"image\" src=\"icon.svg\" alt=\"Submit demo\">",
  "tip": "In a real form this submits; the lab prevents any submission."
 }
];
root.LAMA_REFERENCE_DATA=Object.freeze({symbols,inputs});
})(typeof window!=="undefined"?window:globalThis);
