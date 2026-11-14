/* Original LAMA Coding Academy questions.
 * 150 authored items: 5 subjects x 3 levels x 10 items.
 * No proprietary question text or code from other learning applications.
 * One local mini-lesson per item; non-executable tap-to-build and output prediction.
 */
(function(root){
"use strict";
const A=(prompt,options,answer,why,example="",mode="choice")=>({prompt,options,answer,why,example,mode});
const P=(prompt,options,answer,why,example)=>A(prompt,options,answer,why,example,"predict");
const B=(prompt,parts,answer,why,example="")=>({prompt,parts,answer,why,example,mode:"build"});
const groups={
 html:[
 [
 A("What is HTML used for?",["To structure a web page","To charge a phone","To store banking passwords"],0,"HTML describes the meaning and structure of content.","<h1>Welcome</h1>"),
 A("HTML is best described as a ...",["database engine","markup language","photo editor"],1,"HTML is a markup language; JavaScript is a programming language."),
 A("Which tag makes the main heading?",["<h1>","<p>","<small>"],0,"Use one clear main heading to explain what the page is about.","<h1>Our school</h1>"),
 B("Build a paragraph that says Hello.",["Hello","</p>","<p>","<h1>"],[2,0,1],"The opening <p> and closing </p> surround the text.","<p>Hello</p>"),
 A("Where should most visible page content go?",["Inside <head>","Inside <body>","Inside <title>"],1,"The body contains visible headings, text, links and controls."),
 P("What will <h1>News</h1> display?",["A main heading reading News","A download named News","An error only"],0,"The words inside <h1> are visible as a heading.","<h1>News</h1>"),
 A("Which tag adds an ordinary paragraph?",["<p>","<link>","<body-text>"],0,"Text like a student's introduction belongs inside <p>.","<p>I am learning.</p>"),
 B("Complete a strong, important word.",["Important","</strong>","<strong>","<br>"],[2,0,1],"Open and close the strong element correctly.","<strong>Important</strong>"),
 A("A tag written as </h1> usually means ...",["Start a heading","Close an h1 heading","Make text blue"],1,"The slash marks a closing tag."),
 P("What is wrong with <About me> as ordinary text?",["It is treated as tag syntax","It always becomes a picture","It changes the font"],0,"To display words, place them inside a real element.","<p>About me</p>")
 ],
 [
 A("What does the href attribute tell a link?",["Where the link points","How many images are present","The user's password"],0,"An anchor with href defines a destination.","<a href=\"https://example.org\">Read</a>"),
 B("Build a valid link to another page.",["Read more","</a>","<a href=\"about.html\">","<p>"],[2,0,1],"The anchor starts with a destination and ends with </a>.","<a href=\"about.html\">Read more</a>"),
 A("Which HTML element represents site navigation?",["<nav>","<b>","<pre>"],0,"Semantic navigation helps people and assistive technology find menus."),
 A("What does an image's alt text do?",["Describes meaningful images to people who cannot see them","Increases RAM","Runs JavaScript"],0,"Alt text communicates an image's relevant content.","<img src=\"logo.png\" alt=\"School logo\">"),
 P("What should a link labelled Admissions communicate?",["A clear destination or purpose","Only a color","A random file name"],0,"Meaningful link text helps keyboard and screen-reader users."),
 A("Which element groups list items?",["<ul>","<img>","<title>"],0,"An unordered list contains <li> entries.","<ul><li>Science</li></ul>"),
 B("Build one list item.",["Mathematics","<li>","</li>","<p>"],[1,0,2],"A list item begins with <li> and ends with </li>.","<li>Mathematics</li>"),
 A("How do you connect a label to <input id=\"name\">?",["<label for=\"name\">Name</label>","<title>Name</title>","<b name=\"field\">Name</b>"],0,"The label's for value matches the input's id."),
 A("Which tag marks a self-contained article or post?",["<article>","<color>","<hr>"],0,"article describes a meaningful, independently understandable piece of content."),
 P("What does the required attribute on a form input mean?",["The field needs a value before ordinary submission","The browser will translate it","The input becomes hidden"],0,"required enables a basic browser validation check.","<input required>")
 ],
 [
 A("What is the purpose of <main>?",["Identify the page's main content","Draw a line","Repeat the menu"],0,"A clear main region helps navigation, especially with assistive technology."),
 A("Why should buttons in a form often specify type=\"button\"?",["To avoid accidental form submission","To prevent CSS","To make text unreadable"],0,"The default type in forms can submit the form; be deliberate."),
 B("Build an accessible label and input opening.",["<input id=\"email\">","<label for=\"email\">Email</label>","<footer>"],[1,0],"The label refers to the matching input id.","<label for=\"email\">Email</label><input id=\"email\">"),
 P("What happens if an image has alt=\"\"?",["It may be skipped as decorative by screen readers","The image will never load","It automatically adds a caption"],0,"An empty alt can be appropriate for decorative images."),
 A("Why avoid vague text like 'click here'?",["The link purpose is unclear out of context","It makes every link faster","It causes all browsers to crash"],0,"Describe the action, such as View attendance report."),
 A("Which tag reveals content when a user opens it?",["<details> with <summary>","<meta> with <code>","<body> with <title>"],0,"Native details/summary provides an expandable disclosure control."),
 A("What should a form use for an email address?",["<input type=\"email\">","<input type=\"rainbow\">","<input type=\"music\">"],0,"The email input type adds basic email-format validation."),
 B("Build a safe button label in a form.",["Save draft","</button>","<button type=\"button\">","<input>"],[2,0,1],"A non-submit button avoids unintentional form submission.","<button type=\"button\">Save draft</button>"),
 A("What is a good order for headings?",["A sensible outline like h1 then h2","Random heading sizes for decoration","All words wrapped in h1"],0,"Heading levels communicate relationships, not simply font sizes."),
 P("Can HTML alone protect private student records?",["No; access control and server-side security are also required","Yes, by adding <strong>","Yes, if the file is named private.html"],0,"Markup is not a database security system.")
 ]
 ],
 css:[
 [
 A("What does CSS control?",["Appearance and layout","School admission fees by itself","Internet connection"],0,"CSS changes colors, sizes, spacing and positioning."),
 B("Make all paragraphs blue.",["p","{ color: blue; }","h1"],[0,1],"A selector and declaration form a CSS rule.","p { color: blue; }"),
 A("Which property controls text color?",["color","margin","display"],0,"color sets foreground text color.","h1 { color: green; }"),
 P("What does background: yellow; change?",["The element background","The HTML tag name","The web address"],0,"background paints behind the element.","body { background: yellow; }"),
 A("Which selector chooses a class named card?",[".card","#card","card."],0,"A dot selects a class."),
 A("Which selector chooses id=\"notice\"?",["#notice",".notice","notice#."],0,"A hash sign selects a unique id."),
 B("Build a font-size rule for h1.",["{ font-size: 24px; }","h1","<h1>"],[1,0],"font-size controls the size of text.","h1 { font-size: 24px; }"),
 A("What does padding add?",["Space inside an element's border","A new paragraph","A server record"],0,"Padding separates content from its border."),
 A("What does margin add?",["Space outside an element","A JavaScript function","An image description"],0,"Margin separates an element from its surroundings."),
 P("What will p { color: red; } affect?",["All paragraphs matched by p","Only the page URL","Only headings"],0,"An element selector applies to matching elements.")
 ],
 [
 A("What is display:flex commonly used for?",["Arranging items along a flexible axis","Connecting to SQL","Making HTML tags"],0,"Flexbox is useful for rows, columns and simple alignment."),
 B("Build a flex container declaration.",["display","flex;","display:","grid"],[2,1],"CSS uses property: value;.","display: flex;"),
 A("What does gap do in a flex or grid container?",["Creates spacing between items","Changes the password","Deletes a column"],0,"gap avoids extra margins between items."),
 A("Which property centers flex items on the main axis?",["justify-content: center;","font-size: center;","color: center;"],0,"justify-content controls alignment along a flex container's main axis."),
 A("What does display:grid help create?",["Rows and columns","An email account","Python syntax"],0,"CSS Grid makes two-dimensional layouts."),
 P("What does width:100% usually mean?",["Fill the available width of its containing block","Always exactly 100 pixels","Hide the element"],0,"Percentages are often relative to a containing block."),
 A("What does @media (max-width:600px) help with?",["Changing styles on narrow screens","Sending web requests","Creating a database"],0,"Media queries adapt layouts to device conditions."),
 B("Build a two-column grid declaration.",["grid-template-columns:","1fr 1fr;","color:","display: none;"],[0,1],"Each 1fr takes one share of the available grid width.","grid-template-columns: 1fr 1fr;"),
 A("What does box-sizing:border-box do?",["Includes padding and border within declared width","Removes text","Disables all margins"],0,"border-box makes width calculations more predictable."),
 P("What is likely on a phone if a fixed 1000px panel cannot shrink?",["Horizontal scrolling or clipping","Automatic extra RAM","A database error"],0,"Use responsive widths and avoid fixed oversized elements.")
 ],
 [
 A("Which approach supports keyboard users?",[":focus-visible styles","Removing all outlines","Using only hover"],0,"Visible keyboard focus helps users know where they are."),
 A("Which feature supports people who prefer less animation?",["@media (prefers-reduced-motion: reduce)","display: none everywhere","Only blinking effects"],0,"Respect reduced-motion preferences."),
 B("Build a CSS custom property reference.",["color:","var(--accent);","@accent","<style>"],[0,1],"var(--accent) retrieves a declared CSS custom property.","color: var(--accent);"),
 A("What is minmax(0,1fr) useful for in a grid?",["Allowing a track to shrink without unwanted overflow","Running Python","Fetching data"],0,"The zero minimum can help grid items fit narrower screens."),
 P("Why can color: #aaa on white be hard to read?",["Low text contrast","JavaScript cannot run","The browser is offline"],0,"Text needs enough contrast against its background."),
 A("Why is overflow-wrap:anywhere useful?",["It helps long strings wrap inside narrow cards","It creates a server","It makes code compile"],0,"Long URLs and tokens should not force page overflow."),
 A("What is the best use of !important?",["Sparingly, when genuinely necessary","On every CSS line","To replace HTML"],0,"Overuse makes styles difficult to maintain."),
 B("Build a mobile width media query beginning.",["@media (max-width: 600px)","{","<media>","</style>"],[0,1],"A media query wraps CSS rules inside braces.","@media (max-width: 600px) { ... }"),
 A("Which CSS property limits an item's width?",["max-width","content-order","server-width"],0,"max-width helps prevent huge content blocks."),
 P("Can CSS securely hide confidential information from users?",["No; hidden content can still be in the document","Yes, display:none encrypts it","Yes, a hidden div is secure"],0,"Do not include confidential data in a page the user can read.")
 ]
 ],
 javascript:[
 [
 A("What is JavaScript most often used for in a web page?",["Interactivity and behavior","Changing the battery","Printing a paper without code"],0,"JavaScript responds to events and updates content."),
 B("Build a variable declaration.",["let","age = 12;","<p>","select"],[0,1],"let creates a variable whose value can later change.","let age = 12;"),
 P("What is 2 + 3 in JavaScript?",["5","23","undefined"],0,"Addition with two numbers produces 5.","2 + 3"),
 A("What type of value is \"Hello\"?",["String","Boolean","Array only"],0,"Text inside quotes is a string."),
 A("What does true mean?",["A Boolean value","A number","A button"],0,"true and false represent Boolean values."),
 P("What is the value after let x=4; x=x+1;?",["5","4","41"],0,"The second assignment adds one to the old value."),
 A("What is console.log commonly used for?",["Displaying information to developers","Creating an HTML list","Encrypting a database"],0,"Developers log values while checking code."),
 B("Build a strict equality comparison.",["score","===","10","="],[0,1,2],"=== compares both value and type.","score === 10"),
 A("What is an array?",["An ordered collection of values","A CSS color","An HTML tag"],0,"Arrays hold a sequence of items.","let scores = [3,4,5];"),
 P("What is the first array index in JavaScript?",["0","1","-1"],0,"JavaScript arrays start at index zero.","['a','b'][0] // 'a'")
 ],
 [
 A("What does a function help with?",["Reuse logic","Change the phone SIM","Hide an image"],0,"A function groups instructions that can be called multiple times."),
 B("Build a simple function call.",["sayHello","(",")","let"],[0,1,2],"Call the function using its name and parentheses.","sayHello()"),
 P("What does [1,2,3].length return?",["3","2","4"],0,"length counts the elements in an array."),
 A("What does addEventListener('click',...) do?",["Runs a handler when an element is clicked","Adds a database column","Makes an image larger"],0,"Events connect user actions to code."),
 A("What does document.getElementById('total') find?",["A page element with id=total","A SQL row","An Android activity"],0,"getElementById retrieves a DOM element."),
 B("Build a useful text update.",["element.textContent","=","'Done';","document."],[0,1,2],"textContent safely sets visible text.","element.textContent = 'Done';"),
 A("What is a JavaScript object?",["A group of named properties","Only a picture","A CSS selector"],0,"Objects store related facts such as student.name."),
 P("What is let price=10; let quantity=2; price*quantity;?",["20","12","102"],0,"Multiplication uses the * operator."),
 A("What does if (score >= 50) check?",["Whether score is at least fifty","Whether score equals zero","Whether the page is online"],0,"A condition chooses which instructions should run."),
 P("What happens if code references a variable that was never defined?",["It may throw a ReferenceError","It always becomes zero","It starts a new HTML tag"],0,"Names must be declared in the right scope.")
 ],
 [
 A("Which pattern is safer for displaying untrusted text?",["element.textContent = value","element.innerHTML = value","eval(value)"],0,"textContent treats the value as text instead of HTML markup."),
 B("Build a try/catch opening pair.",["try {","} catch (error) {","<try>","return"],[0,1],"try/catch lets code handle many runtime errors.","try { ... } catch (error) { ... }"),
 P("What does [2,3,4].map(x=>x*2) return?",["[4,6,8]","[2,3,4]","8"],0,"map transforms every array item."),
 A("What is a Promise?",["An object representing an eventual async outcome","An HTML heading","A SQL column"],0,"Promises model work that can finish or fail later."),
 A("What does await usually require?",["An async context or supported module scope","A CSS selector","An HTML comment"],0,"await pauses async control flow until a promise settles."),
 B("Build a null-safe property read.",["student?.name","??","'Unknown'","student.name!"],[0,1,2],"Optional chaining and ?? provide a fallback.","student?.name ?? 'Unknown'"),
 A("Why handle errors from network requests?",["Connections and servers can fail","Fetch never fails","Errors change HTML automatically"],0,"Users need useful recovery messages."),
 P("What is the output of [4,7,9].filter(x=>x>5)?",["[7,9]","[4,7,9]","[4]"],0,"filter keeps only elements matching the condition."),
 A("Why should frontend code never contain private server keys?",["Users can inspect and extract them","It improves page speed","They turn into CSS"],0,"Secret keys belong in protected server environments."),
 P("What does JSON.parse('{\"ok\":true}').ok evaluate to?",["true","'true' as a string","undefined"],0,"JSON.parse creates a JavaScript object; ok is a Boolean.")
 ]
 ],
 python:[
 [
 A("What does print('Hello') do in Python?",["Displays Hello","Creates a web link","Deletes a file"],0,"print displays a value.","print('Hello')"),
 B("Build a Python print call.",["print(","'Welcome'",")","#"],[0,1,2],"print opens with a parenthesis and closes after the value.","print('Welcome')"),
 A("How do Python comments start?",["#","//","<!--"],0,"A hash character marks a single-line comment."),
 A("What is an int in Python?",["A whole-number type","A heading","A CSS selector"],0,"Integers represent whole numbers such as 7."),
 P("What does 3 * 4 produce?",["12","7","34"],0,"Python uses * for multiplication."),
 A("Which example assigns a variable?",["name = 'Amina'","<name>Amina</name>","name: Amina;"],0,"Variables store values under names."),
 B("Build an if statement header.",["if","score > 50",":",";"],[0,1,2],"An if header ends with a colon, and its body is indented.","if score > 50:"),
 A("What matters after an if line in Python?",["Indenting the body","Using HTML tags","Typing CSS colors"],0,"Python uses indentation to group instructions."),
 A("What is a list?",["An ordered collection","A server name","A font size"],0,"Lists contain multiple items.","[2, 4, 6]"),
 P("What does len(['a','b']) return?",["2","1","3"],0,"len counts items in a sequence.")
 ],
 [
 A("What does a for loop do?",["Repeats instructions over items","Makes a photo larger","Connects to HTML automatically"],0,"Use loops when many values need the same work."),
 B("Build a Python function header.",["def","total(price):", "return"],[0,1],"def starts a function definition; a colon ends the header.","def total(price):"),
 P("What is list(range(3))?",["[0,1,2]","[1,2,3]","[0,3]"],0,"range(3) produces 0, 1 and 2."),
 A("What does return do in a function?",["Sends a result to the caller","Only prints a message","Stops the whole computer"],0,"A function can return a value for further work."),
 P("What is sum([1,2,3])?",["6","3","123"],0,"sum adds numeric list values."),
 A("How do you get 'name' from a dictionary student?",["student['name']","student->name","<student.name>"],0,"Dictionaries map keys to values."),
 A("What does try / except provide?",["A way to handle many errors","A CSS layout","A table declaration"],0,"Exceptions can be caught to show recovery guidance."),
 B("Build a basic loop header.",["for","item in items",":","<>"],[0,1,2],"Use a colon and an indented body after the loop header.","for item in items:"),
 A("What does enumerate(items) provide?",["An index together with each item","Only a password","A webpage"],0,"enumerate helps loop over positions and values."),
 P("What is 8 // 3 in Python?",["2","2.666...","3"],0,"// performs floor division, not normal division.")
 ],
 [
 A("What is a list comprehension useful for?",["Building a list from another iterable","Styling text","Changing a domain"],0,"Comprehensions express simple transformations compactly."),
 B("Build a safe dictionary value lookup.",["student.get(","'name', 'Unknown'",")","student.name"],[0,1,2],"get can provide a default for a missing key.","student.get('name', 'Unknown')"),
 P("What is [x*x for x in range(3)]?",["[0,1,4]","[1,4,9]","[0,1,2]"],0,"The loop visits 0,1,2 and squares each."),
 A("Why use with open(...) when working with files?",["It manages resource cleanup","It adds HTML tags","It prevents all errors"],0,"A context manager helps close files reliably."),
 A("What is an f-string?",["A string that can embed expressions","A CSS file","A database table"],0,"f'Hello {name}' inserts the value of name."),
 A("What does raise do?",["Signals an exception","Prints the page","Creates a list"],0,"Raise an error when a function receives invalid input."),
 P("What is sorted([3,1,2])?",["[1,2,3]","[3,1,2]","[2,3,1]"],0,"sorted returns a new ascending list by default."),
 B("Build a function with a default parameter.",["def greet(","name='Guest'"," ):","print"],[0,1,2],"Default values apply when callers omit the argument.","def greet(name='Guest'):"),
 A("Why avoid running unknown Python code from strangers?",["It may perform harmful actions","Python is always harmless","It only changes font color"],0,"A full runtime needs trust and strong isolation."),
 P("What does {'a':1}.get('b',0) return?",["0","1","'b'"],0,"The default is returned when the key does not exist.")
 ]
 ],
 sql:[
 [
 A("What is SQL mainly used for?",["Working with relational database data","Styling HTML","Drawing icons"],0,"SQL queries data stored in tables."),
 B("Build a query for student names.",["SELECT","name","FROM students;","<name>"],[0,1,2],"SELECT identifies columns; FROM identifies the table.","SELECT name FROM students;"),
 A("What does SELECT do?",["Chooses columns or expressions","Sets button colors","Runs Python automatically"],0,"A SELECT statement returns the requested data."),
 A("What does FROM students mean?",["Read from the students table","Create student names","Show a heading"],0,"FROM identifies a data source."),
 P("What does SELECT * FROM students request?",["All columns of the selected rows","Only names","No columns"],0,"The asterisk requests all columns; list needed columns in production."),
 A("What does WHERE do?",["Filters rows","Changes font size","Deletes the database"],0,"WHERE keeps rows matching a condition."),
 B("Build a simple filter condition.",["WHERE","grade = 5","ORDER BY","<grade>"],[0,1],"A predicate after WHERE chooses matching rows.","WHERE grade = 5"),
 A("What does ORDER BY name do?",["Sorts the result by name","Creates a name column","Counts rows"],0,"ORDER BY controls result ordering."),
 A("What does COUNT(*) calculate?",["The number of result rows","A CSS width","Every phone number"],0,"COUNT(*) returns how many rows match."),
 P("Does SQL run inside the beginner quiz's browser?",["No; this is a syntax-learning quiz","Yes; it edits a real school database","Yes; it connects to Supabase"],0,"Practice questions are local simulations; they never access actual learner data.")
 ],
 [
 A("What does WHERE age >= 18 AND active = 1 mean?",["Both conditions must hold","Either condition is enough","No condition matters"],0,"AND combines conditions so all must be true."),
 B("Build a DISTINCT name query.",["SELECT DISTINCT","name","FROM students;","HTML"],[0,1,2],"DISTINCT removes duplicate result combinations.","SELECT DISTINCT name FROM students;"),
 P("What does LIMIT 5 typically do?",["Restricts returned rows to five","Creates five tables","Deletes five rows"],0,"LIMIT caps the number of returned rows; syntax varies by database."),
 A("What is GROUP BY used for?",["Grouping rows for aggregates","Setting CSS columns","Sorting alone"],0,"GROUP BY combines data with matching group values."),
 A("Which aggregate totals numeric values?",["SUM","TEXT","COLOR"],0,"SUM adds numeric column values."),
 A("What does JOIN help with?",["Combining related data from tables","Changing button sizes","Installing Python"],0,"JOIN matches records using related keys."),
 B("Build a filter for two possible classes.",["WHERE class IN","(4, 5)","<class>","SELECT *"],[0,1],"IN checks whether a value is in a list.","WHERE class IN (4,5)"),
 A("Why is UPDATE without WHERE risky?",["It could change all rows","It always fails","It only changes one row"],0,"Double-check the WHERE filter before modifying data."),
 A("What does HAVING filter?",["Groups after aggregation","HTML tags","CSS variables"],0,"WHERE filters rows before grouping; HAVING filters grouped results."),
 P("What does COUNT(*) return when zero rows match?",["0","NULL always","An empty string"],0,"COUNT(*) reports zero for an empty input result.")
 ],
 [
 A("Which approach helps defend against SQL injection?",["Parameterized queries","Concatenating user input directly","Hiding the submit button"],0,"Parameters keep user data separate from query structure."),
 B("Build a parameterized filter skeleton.",["WHERE id =","?","WHERE id = '","' + input"],[0,1],"Use the database driver's supported placeholder and bound parameter.","WHERE id = ?"),
 A("What is a transaction useful for?",["Treating several changes as a unit","Changing CSS","Rendering a heading"],0,"Transactions help keep related updates consistent."),
 A("What does a foreign key represent?",["A relationship to a referenced record","A keyboard shortcut","A JavaScript event"],0,"Foreign keys help maintain relationships and integrity."),
 P("What happens to unmatched left-side rows in a LEFT JOIN?",["They can remain with NULL values for the missing right side","They are always deleted","They become CSS"],0,"LEFT JOIN preserves left-side rows."),
 A("What is an index mainly for?",["Helping many queries find data efficiently","Encrypting all data","Creating HTML paragraphs"],0,"Indexes speed some lookups but have storage and write costs."),
 A("Why avoid SELECT * in performance-sensitive reports?",["It may fetch extra columns and more data","It is always a syntax error","It deletes all rows"],0,"Request only the columns needed for a report."),
 B("Build a safe total-by-class query ending.",["GROUP BY","class","ORDER BY","<class>"],[0,1],"GROUP BY class groups rows before aggregates.","SELECT class, COUNT(*) FROM students GROUP BY class"),
 A("Which constraint helps prevent duplicate unique identifiers?",["UNIQUE","COLOR","HOVER"],0,"UNIQUE enforces distinct values according to the database's rules."),
 P("What does WHERE score = NULL generally do?",["It will not match NULL rows; use IS NULL","It matches every NULL row","It turns NULL into zero"],0,"SQL NULL uses three-valued logic; test with IS NULL.")
 ]
 ]
};
const tracks=[
 {id:"html",label:"HTML",description:"Understand website structure"},
 {id:"css",label:"CSS",description:"Style pages and mobile layouts"},
 {id:"javascript",label:"JavaScript",description:"Make code react and compute"},
 {id:"python",label:"Python",description:"Think in everyday programming logic"},
 {id:"sql",label:"SQL",description:"Ask databases useful questions"}
];
const levels=["Beginner","Intermediate","Advanced"];
let all=[];
for(const track of tracks){
 const sets=groups[track.id];
 for(let level=0;level<3;level++){
  const set=sets[level];
  for(let i=0;i<set.length;i++){
   all.push({...set[i],id:track.id+"-"+(level+1)+"-"+String(i+1).padStart(2,"0"),
    track:track.id,level:level+1});
  }
 }
}
root.LAMA_CODING_QUESTIONS=Object.freeze({
 version:1,tracks,levels,items:all
});
})(typeof window!=="undefined"?window:globalThis);
