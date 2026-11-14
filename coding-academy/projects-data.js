/* Local-first guided project data: English with Urdu coaching. Pattern checks are formative, not professional certification. */
window.LAMA_STUDIO_PROJECTS = [
  {
    "id": "school",
    "icon": "🏫",
    "name": "School Information Website",
    "sector": "Education • Frontend",
    "level": "Beginner",
    "outcome": "A responsive school information website with useful navigation and contact details.",
    "description": "Practice building a site that parents and students can understand.",
    "starter": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>My School Website</title>\n<style>\nbody { margin:0; font-family:Arial,sans-serif; background:#f3f7fa; color:#172b42; }\nheader { padding:26px; background:#194b74; color:white; }\nmain { max-width:860px; margin:auto; padding:24px; }\n</style>\n</head>\n<body>\n<header><h1>My School</h1><p>Learning and growing together.</p></header>\n<main>\n<!-- Add your navigation, programs and contact section here. -->\n</main>\n</body>\n</html>",
    "steps": [
      {
        "id": "navigation",
        "title": "Create meaningful navigation",
        "why": "Real sites need clear page routes and accessible navigation.",
        "task": "Insert a nav element with aria-label=\"Main navigation\" and links to #programs and #contact.",
        "hint": "<nav aria-label=\"Main navigation\"><a href=\"#programs\">Programs</a> <a href=\"#contact\">Contact</a></nav>",
        "checks": [
          [
            "Accessible navigation",
            "<nav\\b[^>]*aria-label\\s*=\\s*[\"']Main navigation[\"'][^>]*>"
          ],
          [
            "Programs anchor",
            "<a\\b[^>]*href\\s*=\\s*[\"']#programs[\"']"
          ],
          [
            "Contact anchor",
            "<a\\b[^>]*href\\s*=\\s*[\"']#contact[\"']"
          ]
        ],
        "review": "Click both navigation links. Confirm they scroll to their intended sections.",
        "ur": {
          "title": "درست نیویگیشن بنائیں",
          "why": "حقیقی ویب سائٹ پر ہر صارف آسانی سے مطلوبہ حصے تک پہنچ سکے۔",
          "task": "aria-label=\"Main navigation\" والا nav بنائیں اور #programs اور #contact کے لنکس شامل کریں۔",
          "review": "دونوں لنک کلک کر کے دیکھیں کہ متعلقہ حصے کھلتے ہیں۔"
        }
      },
      {
        "id": "programs",
        "title": "Explain school programs",
        "why": "Users need understandable sections, not only decoration.",
        "task": "Create a section with id=\"programs\", an h2 heading named Programs, and at least one paragraph.",
        "hint": "<section id=\"programs\"><h2>Programs</h2><p>Primary education and foundational skills.</p></section>",
        "checks": [
          [
            "Programs section",
            "<section\\b[^>]*id\\s*=\\s*[\"']programs[\"']"
          ],
          [
            "Programs heading",
            "<h2\\b[^>]*>\\s*Programs\\s*<\\/h2>"
          ],
          [
            "Readable paragraph",
            "<p\\b[^>]*>[^<]{15,}<\\/p>"
          ]
        ],
        "review": "Ask a reader whether they understand what the school offers.",
        "ur": {
          "title": "اسکول کے پروگرام بتائیں",
          "why": "صارف کو واضح طور پر معلوم ہونا چاہیے کہ ادارہ کیا سہولت فراہم کرتا ہے۔",
          "task": "id=\"programs\" والا section، Programs کے عنوان کا h2، اور کم از کم ایک پیراگراف لکھیں۔",
          "review": "کسی دوسرے شخص سے پوچھیں کہ ویب سائٹ پڑھ کر اسکول کے پروگرام سمجھ آتے ہیں یا نہیں۔"
        }
      },
      {
        "id": "responsive",
        "title": "Adapt to smaller phones",
        "why": "Parents often access school websites using mobile devices.",
        "task": "Add a CSS @media(max-width:600px) rule and reduce header padding on small screens.",
        "hint": "@media (max-width:600px) { header { padding:14px; } }",
        "checks": [
          [
            "600px phone breakpoint",
            "@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)"
          ],
          [
            "Small-screen header padding",
            "@media\\s*\\([^)]*max-width[^)]*\\)\\s*\\{[\\s\\S]*?header\\s*\\{[^}]*padding\\s*:\\s*14px"
          ]
        ],
        "review": "Test portrait mobile width: no horizontal scrolling and buttons remain easy to tap.",
        "ur": {
          "title": "موبائل اسکرین کے لیے ترتیب",
          "why": "بہت سے والدین موبائل فون سے ویب سائٹ کھولتے ہیں۔",
          "task": "CSS میں @media(max-width:600px) شامل کریں اور چھوٹی اسکرین پر header کی padding کو 14px کریں۔",
          "review": "موبائل کی عمودی اسکرین میں دیکھیں کہ کوئی حصہ باہر تو نہیں نکلتا۔"
        }
      },
      {
        "id": "contact",
        "title": "Publish accessible contact details",
        "why": "Real services must offer people a way to reach them.",
        "task": "Add a section id=\"contact\" with h2 Contact and a mailto link. Use a sample address, not private student information.",
        "hint": "<section id=\"contact\"><h2>Contact</h2><a href=\"mailto:hello@example.org\">Email the school</a></section>",
        "checks": [
          [
            "Contact section",
            "<section\\b[^>]*id\\s*=\\s*[\"']contact[\"']"
          ],
          [
            "Contact heading",
            "<h2\\b[^>]*>\\s*Contact\\s*<\\/h2>"
          ],
          [
            "Email link",
            "<a\\b[^>]*href\\s*=\\s*[\"']mailto:[^\"']+[\"']"
          ]
        ],
        "review": "Open the mailto link and confirm its destination is a safe test address.",
        "ur": {
          "title": "رابطے کی سہولت دیں",
          "why": "صارفین کو ادارے سے رابطہ کرنے کا واضح طریقہ چاہیے۔",
          "task": "id=\"contact\" والا section، Contact کا h2 اور mailto ای میل لنک شامل کریں۔ حقیقی طالب علم کا ذاتی ڈیٹا نہ ڈالیں۔",
          "review": "صرف تجربے کے لیے فرضی ای میل استعمال کر کے رابطہ لنک چیک کریں۔"
        }
      }
    ],
    "ur": {
      "name": "اسکول کی معلومات کی ویب سائٹ",
      "description": "والدین اور طلبہ کے لیے واضح اور آسان ویب سائٹ بنانے کی مشق۔",
      "outcome": "ایسی ویب سائٹ جس میں پروگرام، رابطہ اور موبائل کے مطابق ترتیب ہو۔"
    }
  },
  {
    "id": "fees",
    "icon": "🧮",
    "name": "Tuition Fee Calculator",
    "sector": "Finance • JavaScript",
    "level": "Foundation+",
    "outcome": "A working form that calculates a fee total and handles invalid input.",
    "description": "Practice form inputs, JavaScript functions, and helpful error messages.",
    "starter": "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Tuition Fee Calculator</title>\n<style>\nbody { font-family:Arial,sans-serif; margin:24px; background:#eef4fc;color:#162b41 }\nmain{max-width:520px;margin:auto;background:#fff;padding:22px;border-radius:14px}\nlabel{display:block;margin-top:12px}\ninput{display:block;padding:11px;margin-top:4px;width:100%;box-sizing:border-box}\nbutton{padding:12px;margin-top:15px}\n</style>\n</head><body><main>\n<h1>Calculate School Fees</h1>\n<label for=\"monthly\">Monthly fee</label><input id=\"monthly\" type=\"number\" min=\"0\" value=\"500\">\n<label for=\"months\">Months</label><input id=\"months\" type=\"number\" min=\"0\" value=\"3\">\n<button id=\"calculate\" type=\"button\">Calculate</button>\n<p id=\"result\" aria-live=\"polite\">Enter values and calculate.</p>\n</main>\n<script>\nfunction totalFee(monthly, months) {\n  // Return the total for these values.\n}\ndocument.getElementById(\"calculate\").addEventListener(\"click\", function() {\n  // Read the fields, handle errors, and show a result.\n});\n</script></body></html>",
    "steps": [
      {
        "id": "calculate",
        "title": "Implement reusable calculations",
        "why": "Billing code should have a testable, reusable function.",
        "task": "Complete totalFee so it returns monthly * months.",
        "hint": "return monthly * months;",
        "checks": [
          [
            "Correct multiplication return",
            "return\\s+monthly\\s*\\*\\s*months\\s*;?"
          ]
        ],
        "review": "Test the function for a regular amount, zero months, and a different price.",
        "ur": {
          "title": "دوبارہ استعمال ہونے والا حساب",
          "why": "فیس کے حساب کا ایک درست فنکشن مختلف مقامات پر کام آتا ہے۔",
          "task": "totalFee فنکشن کو مکمل کریں تاکہ monthly * months واپس کرے۔",
          "review": "عام رقم، صفر مہینے اور مختلف اعداد پر نتیجہ خود چیک کریں۔"
        }
      },
      {
        "id": "inputs",
        "title": "Read numeric form inputs",
        "why": "Form values arrive as strings and need conversion for calculations.",
        "task": "Inside the button click handler, read #monthly and #months using document.getElementById and Number or valueAsNumber.",
        "hint": "const monthly = Number(document.getElementById(\"monthly\").value); const months = Number(document.getElementById(\"months\").value);",
        "checks": [
          [
            "Monthly field accessed",
            "getElementById\\s*\\(\\s*[\"']monthly[\"']\\s*\\)"
          ],
          [
            "Months field accessed",
            "getElementById\\s*\\(\\s*[\"']months[\"']\\s*\\)"
          ],
          [
            "Numeric conversion",
            "\\b(?:Number\\s*\\(|valueAsNumber\\b)"
          ]
        ],
        "review": "Change the monthly price and duration before clicking Calculate.",
        "ur": {
          "title": "فارم سے اعداد پڑھیں",
          "why": "فارم سے ملنے والی قدریں اکثر متن ہوتی ہیں، حساب کے لیے عدد میں بدلنا پڑتا ہے۔",
          "task": "بٹن کے click ہینڈلر میں document.getElementById کے ذریعے monthly اور months پڑھیں، پھر Number یا valueAsNumber استعمال کریں۔",
          "review": "رقم اور مہینے بدل کر Calculate دبائیں۔"
        }
      },
      {
        "id": "output",
        "title": "Display the amount to users",
        "why": "Data must be shown understandably after a calculation.",
        "task": "Set result.textContent or document.getElementById('result').textContent using totalFee(monthly, months).",
        "hint": "document.getElementById(\"result\").textContent = \"Total: \" + totalFee(monthly, months);",
        "checks": [
          [
            "Result output updated",
            "(?:getElementById\\s*\\(\\s*[\"']result[\"']\\s*\\)|result)\\.textContent\\s*="
          ],
          [
            "Reusable function used",
            "totalFee\\s*\\(\\s*monthly\\s*,\\s*months\\s*\\)"
          ]
        ],
        "review": "Confirm a monthly fee of 500 for three months produces 1500.",
        "ur": {
          "title": "صارف کو کل رقم دکھائیں",
          "why": "حساب مکمل ہونے پر واضح نتیجہ نظر آنا چاہیے۔",
          "task": "result کے textContent میں totalFee(monthly, months) کا جواب دکھائیں۔",
          "review": "ماہانہ 500 اور تین مہینوں کا جواب 1500 ہونا چاہیے۔"
        }
      },
      {
        "id": "validate",
        "title": "Handle invalid numbers",
        "why": "Reliable financial software must reject negative values and other invalid input.",
        "task": "Check Number.isFinite for inputs and reject negative monthly fees or months using a conditional.",
        "hint": "if (!Number.isFinite(monthly) || !Number.isFinite(months) || monthly < 0 || months < 0) { document.getElementById(\"result\").textContent = \"Enter valid nonnegative numbers\"; return; }",
        "checks": [
          [
            "Finite-number check",
            "Number\\.isFinite\\s*\\("
          ],
          [
            "Check a negative input",
            "(?:monthly\\s*<\\s*0|months\\s*<\\s*0)"
          ],
          [
            "Invalid input branch",
            "\\bif\\s*\\("
          ]
        ],
        "review": "Try -5, 0, a blank input, and 3 months; verify a clear response.",
        "ur": {
          "title": "غلط اعداد کو روکیں",
          "why": "مالی سافٹ ویئر میں منفی یا نامکمل رقم قبول کرنا مسئلہ پیدا کر سکتا ہے۔",
          "task": "Number.isFinite سے اعداد چیک کریں اور if لگا کر منفی فیس یا منفی مہینے مسترد کریں۔",
          "review": "-5، صفر، خالی خانہ اور تین مہینوں پر نتیجہ چیک کریں۔"
        }
      }
    ],
    "ur": {
      "name": "فیس کیلکولیٹر",
      "description": "فارم، جاوا اسکرپٹ فنکشن اور غلط اندراج سے نمٹنے کی عملی مشق۔",
      "outcome": "ایسا فارم جو فیس کا مجموعہ نکالے اور غلط اعداد پر مناسب پیغام دکھائے۔"
    }
  },
  {
    "id": "attendance",
    "icon": "📋",
    "name": "Student Attendance Summary",
    "sector": "Education Operations • Data",
    "level": "Foundation+",
    "outcome": "An interactive student list with present/absent totals and missing-attendance handling.",
    "description": "Practice arrays, filters, loops and safe DOM text updates.",
    "starter": "<!doctype html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Attendance Summary</title>\n<style>\nbody{font-family:Arial,sans-serif;background:#edf3fa;padding:20px;color:#193046}\nmain{max-width:700px;margin:auto;background:white;padding:22px;border-radius:14px}\nli{padding:8px;border-bottom:1px solid #ddd}\n</style>\n</head><body>\n<main><h1>Today's Attendance</h1>\n<p id=\"summary\" aria-live=\"polite\">Complete your JavaScript.</p>\n<ul id=\"students\"></ul></main>\n<script>\nconst attendance = [\n  {name:\"Amina\", present:true},\n  {name:\"Bilal\", present:false},\n  {name:\"Hira\", present:true},\n  {name:\"Sara\", present:false}\n];\n// Count and display attendance below.\n</script>\n</body></html>",
    "steps": [
      {
        "id": "count",
        "title": "Count present learners",
        "why": "A register dashboard starts with reliable, derived totals.",
        "task": "Create a variable named presentCount using attendance.filter with student.present.",
        "hint": "const presentCount = attendance.filter(student => student.present).length;",
        "checks": [
          [
            "Present count variable",
            "(?:const|let)\\s+presentCount\\s*="
          ],
          [
            "Present student filter",
            "attendance\\.filter\\s*\\("
          ],
          [
            "Present status used",
            "\\b(?:student|s)\\.present\\b"
          ]
        ],
        "review": "With the sample data, exactly two students should be marked present.",
        "ur": {
          "title": "حاضر طلبہ کی گنتی",
          "why": "حاضری رجسٹر میں درست اعداد بنیادی ضرورت ہیں۔",
          "task": "attendance.filter اور student.present استعمال کر کے presentCount نام کا متغیر بنائیں۔",
          "review": "نمونے کے چار ریکارڈ میں دو طلبہ حاضر ہونے چاہییں۔"
        }
      },
      {
        "id": "absent",
        "title": "Calculate absent learners",
        "why": "Administrators need to identify missing students for follow-up.",
        "task": "Create absentCount by subtracting presentCount from attendance.length.",
        "hint": "const absentCount = attendance.length - presentCount;",
        "checks": [
          [
            "Absent count is derived",
            "(?:const|let)\\s+absentCount\\s*=\\s*attendance\\.length\\s*-\\s*presentCount"
          ]
        ],
        "review": "With four students total, present plus absent must equal four.",
        "ur": {
          "title": "غیر حاضر طلبہ کی گنتی",
          "why": "اسکول کو غیر حاضر طلبہ کا بروقت پتا ہونا چاہیے۔",
          "task": "attendance.length سے presentCount منفی کر کے absentCount بنائیں۔",
          "review": "حاضر اور غیر حاضر کی کل تعداد چار ہونی چاہیے۔"
        }
      },
      {
        "id": "summary",
        "title": "Show an attendance summary",
        "why": "Good dashboards show statistics rather than hiding useful numbers in code.",
        "task": "Set the textContent of the #summary element using presentCount and absentCount.",
        "hint": "document.getElementById(\"summary\").textContent = \"Present: \" + presentCount + \" | Absent: \" + absentCount;",
        "checks": [
          [
            "Summary element accessed",
            "getElementById\\s*\\(\\s*[\"']summary[\"']\\s*\\)"
          ],
          [
            "Update text safely",
            "\\.textContent\\s*="
          ],
          [
            "Uses present and absent",
            "presentCount[\\s\\S]*absentCount|absentCount[\\s\\S]*presentCount"
          ]
        ],
        "review": "Verify the displayed totals match the four example records.",
        "ur": {
          "title": "خلاصہ اسکرین پر دکھائیں",
          "why": "ڈیش بورڈ پر اہم اعداد واضح نظر آنے چاہییں۔",
          "task": "#summary عنصر کو getElementById سے حاصل کریں اور textContent کے ذریعے presentCount اور absentCount دکھائیں۔",
          "review": "نظر آنے والے اعداد نمونے کے ریکارڈ سے ملائیں۔"
        }
      },
      {
        "id": "records",
        "title": "Display each record safely",
        "why": "Real systems must show individual records without inserting untrusted HTML.",
        "task": "Use attendance.forEach, document.createElement('li'), and element.textContent to add learner names into the #students list.",
        "hint": "attendance.forEach(student => { const li = document.createElement(\"li\"); li.textContent = student.name; document.getElementById(\"students\").appendChild(li); });",
        "checks": [
          [
            "Process records",
            "attendance\\.forEach\\s*\\("
          ],
          [
            "Create list item",
            "document\\.createElement\\s*\\(\\s*[\"']li[\"']\\s*\\)"
          ],
          [
            "Use textContent",
            "\\.textContent\\s*="
          ],
          [
            "Add child node",
            "\\.appendChild\\s*\\("
          ]
        ],
        "review": "Confirm the list contains all four names, with no HTML injection.",
        "ur": {
          "title": "ہر طالب علم کا نام دکھائیں",
          "why": "اسکول ریکارڈ دکھاتے وقت غیر ضروری HTML شامل کرنا خطرناک ہو سکتا ہے۔",
          "task": "attendance.forEach، document.createElement('li')، textContent اور appendChild استعمال کر کے طلبہ کی فہرست دکھائیں۔",
          "review": "چاروں نام نظر آئیں اور کوئی غیر محفوظ HTML شامل نہ ہو۔"
        }
      }
    ],
    "ur": {
      "name": "طلبہ کی حاضری کا خلاصہ",
      "description": "فہرست، فلٹر، گنتی اور محفوظ متن دکھانے کی عملی مشق۔",
      "outcome": "حاضر اور غیر حاضر طلبہ کی گنتی اور نام دکھانے والا ڈیش بورڈ۔"
    }
  }
];
