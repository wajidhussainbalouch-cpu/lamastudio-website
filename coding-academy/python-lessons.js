/* Real executable Python missions for Pyodide. Tests are educational, not proctored. */
window.LAMA_PYTHON_MISSIONS = [
  {
    "id": "pyx-greetings",
    "topic": "Functions",
    "title": "Greet a New Learner",
    "difficulty": "Beginner",
    "minutes": 8,
    "purpose": "Real apps greet users with personalized messages instead of hard-coded names.",
    "concept": "Use def to create a reusable function. A return value can be tested and displayed elsewhere.",
    "task": "Write greet(name) to return 'Hello, ' followed by the supplied name and an exclamation mark.",
    "starter": "def greet(name):\n    # Replace this comment with your solution\n    pass\n\nprint('Ready to greet a learner!')\n",
    "hint": "return 'Hello, ' + name + '!'",
    "quiz": {
      "question": "What is the main benefit of a function parameter?",
      "options": [
        "It accepts changing input",
        "It automatically saves files",
        "It styles a page"
      ],
      "answer": 0
    },
    "tests": [
      {
        "label": "Amina greeting",
        "expression": "greet('Amina') == 'Hello, Amina!'"
      },
      {
        "label": "Bilal greeting",
        "expression": "greet('Bilal') == 'Hello, Bilal!'"
      },
      {
        "label": "Empty name",
        "expression": "greet('') == 'Hello, !'"
      }
    ]
  },
  {
    "id": "pyx-fees",
    "topic": "Arithmetic",
    "title": "Calculate School Fees",
    "difficulty": "Beginner",
    "minutes": 10,
    "purpose": "Financial forms must calculate totals correctly for different amounts and durations.",
    "concept": "Multiply values using *. Return the number rather than printing it from the function.",
    "task": "Write total_fee(monthly, months) to return monthly multiplied by months.",
    "starter": "def total_fee(monthly, months):\n    # Calculate the total\n    pass\n",
    "hint": "return monthly * months",
    "quiz": {
      "question": "Which result should total_fee(500, 3) return?",
      "options": [
        "503",
        "1500",
        "500"
      ],
      "answer": 1
    },
    "tests": [
      {
        "label": "Three months",
        "expression": "total_fee(500, 3) == 1500"
      },
      {
        "label": "Zero months",
        "expression": "total_fee(800, 0) == 0"
      },
      {
        "label": "Different fee",
        "expression": "total_fee(275, 4) == 1100"
      }
    ]
  },
  {
    "id": "pyx-grades",
    "topic": "Conditions",
    "title": "Check Passing Grades",
    "difficulty": "Beginner",
    "minutes": 12,
    "purpose": "Student result systems make decisions from consistent thresholds.",
    "concept": "An if statement controls conditional behavior. Comparing >= includes the boundary value.",
    "task": "Write has_passed(score) to return True for 50 and above and False otherwise.",
    "starter": "def has_passed(score):\n    # Use a comparison to return a Boolean\n    pass\n",
    "hint": "return score >= 50",
    "quiz": {
      "question": "What does the >= operator mean?",
      "options": [
        "Greater than only",
        "Less than or equal to",
        "Greater than or equal to"
      ],
      "answer": 2
    },
    "tests": [
      {
        "label": "Below threshold",
        "expression": "has_passed(49) is False"
      },
      {
        "label": "Exactly 50",
        "expression": "has_passed(50) is True"
      },
      {
        "label": "Top score",
        "expression": "has_passed(100) is True"
      }
    ]
  },
  {
    "id": "pyx-attendance",
    "topic": "Calculations",
    "title": "Attendance Percentage",
    "difficulty": "Beginner+",
    "minutes": 13,
    "purpose": "Attendance dashboards need reliable percentages and safe handling of empty classes.",
    "concept": "Use an if check to avoid dividing by zero, then use round for a whole-number percentage.",
    "task": "Write attendance_rate(present, total). Return 0 when total is zero; otherwise return round(present / total * 100).",
    "starter": "def attendance_rate(present, total):\n    # Handle an empty class, then calculate a percentage\n    pass\n",
    "hint": "if total == 0:\n    return 0\nreturn round(present / total * 100)",
    "quiz": {
      "question": "Why check total == 0 first?",
      "options": [
        "To avoid division by zero",
        "To make a list",
        "To reverse the score"
      ],
      "answer": 0
    },
    "tests": [
      {
        "label": "All present",
        "expression": "attendance_rate(20, 20) == 100"
      },
      {
        "label": "Quarter absent",
        "expression": "attendance_rate(9, 12) == 75"
      },
      {
        "label": "Empty class",
        "expression": "attendance_rate(0, 0) == 0"
      }
    ]
  },
  {
    "id": "pyx-stock",
    "topic": "Lists",
    "title": "Low Stock Alert",
    "difficulty": "Intermediate starter",
    "minutes": 15,
    "purpose": "Offices and stores need a clear list of items that require reordering.",
    "concept": "A list comprehension can filter records and return their names in the original order.",
    "task": "Write low_stock(items) to return names of items whose quantity is below 10. Each item is a dictionary with name and quantity.",
    "starter": "def low_stock(items):\n    # Return the names of items with quantity less than 10\n    pass\n",
    "hint": "return [item['name'] for item in items if item['quantity'] < 10]",
    "quiz": {
      "question": "Which quantity should be included when the threshold is below 10?",
      "options": [
        "10",
        "9",
        "15"
      ],
      "answer": 1
    },
    "tests": [
      {
        "label": "Filter small quantities",
        "expression": "low_stock([{'name':'Pens','quantity':4},{'name':'Books','quantity':20}]) == ['Pens']"
      },
      {
        "label": "No stock items",
        "expression": "low_stock([]) == []"
      },
      {
        "label": "Preserve input order",
        "expression": "low_stock([{'name':'A','quantity':9},{'name':'B','quantity':10},{'name':'C','quantity':0}]) == ['A','C']"
      }
    ]
  },
  {
    "id": "pyx-average",
    "topic": "Data Analysis",
    "title": "Average Marks",
    "difficulty": "Beginner+",
    "minutes": 14,
    "purpose": "Teachers can summarize a set of marks without calculating manually.",
    "concept": "sum(values) adds a list and len(values) counts entries. Handle empty lists before dividing.",
    "task": "Write average_marks(scores) to return a numeric average, or 0 when the list is empty.",
    "starter": "def average_marks(scores):\n    # Return the average (or zero for empty scores)\n    pass\n",
    "hint": "if not scores:\n    return 0\nreturn sum(scores) / len(scores)",
    "quiz": {
      "question": "What should happen when the list is empty?",
      "options": [
        "Divide by zero",
        "Return zero without dividing",
        "Delete the list"
      ],
      "answer": 1
    },
    "tests": [
      {
        "label": "Ordinary marks",
        "expression": "average_marks([80, 90, 70]) == 80"
      },
      {
        "label": "Empty marks",
        "expression": "average_marks([]) == 0"
      },
      {
        "label": "Fractional average",
        "expression": "average_marks([1, 2]) == 1.5"
      }
    ]
  },
  {
    "id": "pyx-clean",
    "topic": "Strings",
    "title": "Clean Reference Numbers",
    "difficulty": "Beginner+",
    "minutes": 13,
    "purpose": "Real data often contains spaces or separators that need normalization.",
    "concept": "String methods such as replace and strip can remove unwanted formatting.",
    "task": "Write clean_reference(raw) to remove spaces and hyphens from the given string, keeping the original letter case.",
    "starter": "def clean_reference(raw):\n    # Remove spaces and hyphens\n    pass\n",
    "hint": "return raw.replace(' ', '').replace('-', '')",
    "quiz": {
      "question": "What does replace('-', '') do?",
      "options": [
        "Removes hyphens",
        "Adds hyphens",
        "Converts to numbers"
      ],
      "answer": 0
    },
    "tests": [
      {
        "label": "Remove both separators",
        "expression": "clean_reference('AB - 102') == 'AB102'"
      },
      {
        "label": "Already clean",
        "expression": "clean_reference('ID2026') == 'ID2026'"
      },
      {
        "label": "Preserve letter case",
        "expression": "clean_reference('a-b C') == 'abC'"
      }
    ]
  },
  {
    "id": "pyx-absent",
    "topic": "Dictionaries",
    "title": "Count Absent Students",
    "difficulty": "Beginner+",
    "minutes": 15,
    "purpose": "Attendance summaries depend on structured records, not manual counting.",
    "concept": "Iterate over a list of dictionaries and evaluate a Boolean present field.",
    "task": "Write count_absent(records) to count records whose 'present' value is False.",
    "starter": "def count_absent(records):\n    # Count records where present is False\n    pass\n",
    "hint": "return sum(1 for student in records if student['present'] is False)",
    "quiz": {
      "question": "What does a dictionary key identify?",
      "options": [
        "A random position",
        "A named value in a record",
        "The browser size"
      ],
      "answer": 1
    },
    "tests": [
      {
        "label": "Mixed list",
        "expression": "count_absent([{'present':True},{'present':False},{'present':False}]) == 2"
      },
      {
        "label": "All present",
        "expression": "count_absent([{'present':True}]) == 0"
      },
      {
        "label": "Empty records",
        "expression": "count_absent([]) == 0"
      }
    ]
  },
  {
    "id": "pyx-grade-label",
    "topic": "Business Rules",
    "title": "Assign a Grade Band",
    "difficulty": "Intermediate starter",
    "minutes": 18,
    "purpose": "Examination reports often convert numerical scores into defined categories.",
    "concept": "Ordered if conditions matter: test the highest band first.",
    "task": "Write grade_band(score) that returns 'A' for 80+, 'B' for 60–79, 'C' for 50–59, and 'F' below 50.",
    "starter": "def grade_band(score):\n    # Check the score bands in order\n    pass\n",
    "hint": "if score >= 80: return 'A'\nif score >= 60: return 'B'\nif score >= 50: return 'C'\nreturn 'F'",
    "quiz": {
      "question": "Why check the highest score band first?",
      "options": [
        "To avoid high scores falling into lower bands",
        "To print more text",
        "To create an HTML tag"
      ],
      "answer": 0
    },
    "tests": [
      {
        "label": "Grade A boundary",
        "expression": "grade_band(80) == 'A' and grade_band(100) == 'A'"
      },
      {
        "label": "B and C bands",
        "expression": "grade_band(60) == 'B' and grade_band(50) == 'C'"
      },
      {
        "label": "Fail boundary",
        "expression": "grade_band(49) == 'F' and grade_band(79) == 'B'"
      }
    ]
  },
  {
    "id": "pyx-report",
    "topic": "Mini Project",
    "title": "Create a Passing-Students Report",
    "difficulty": "Intermediate starter",
    "minutes": 20,
    "purpose": "Data tools often filter and sort records before presenting them to a teacher or manager.",
    "concept": "Combine filtering, dictionaries and sorting to produce a clean report.",
    "task": "Write passing_names(students) to return a sorted list of names for records with score >= 50. Each record has 'name' and 'score'.",
    "starter": "def passing_names(students):\n    # Filter by score, then sort names alphabetically\n    pass\n",
    "hint": "return sorted(student['name'] for student in students if student['score'] >= 50)",
    "quiz": {
      "question": "Why sort report output?",
      "options": [
        "To make results predictable and easy to scan",
        "To hide lower scores",
        "To alter student scores"
      ],
      "answer": 0
    },
    "tests": [
      {
        "label": "Filter and sort",
        "expression": "passing_names([{'name':'Zara','score':60},{'name':'Amina','score':90},{'name':'Bilal','score':40}]) == ['Amina','Zara']"
      },
      {
        "label": "No passing students",
        "expression": "passing_names([{'name':'Ali','score':49}]) == []"
      },
      {
        "label": "Boundary passing",
        "expression": "passing_names([{'name':'Mina','score':50},{'name':'Sara','score':80}]) == ['Mina','Sara']"
      }
    ]
  }
];
