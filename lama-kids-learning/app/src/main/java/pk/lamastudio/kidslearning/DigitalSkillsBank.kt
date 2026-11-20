package pk.lamastudio.kidslearning

/**
 * 100 offline computer and digital citizenship questions, ten per grade.
 * Grade-specific terms with explanations; children should be supervised online.
 */
object DigitalSkillsBank {
 private val concepts: List<List<Pair<String,String>>> = listOf(
  listOf("keyboard" to "typing letters", "mouse" to "moving a pointer", "monitor" to "showing pictures", "speaker" to "playing sound", "printer" to "printing on paper", "camera" to "taking pictures", "microphone" to "recording sound", "spacebar" to "putting spaces between words", "enter key" to "starting a new line", "power button" to "switching a device on or off"),
  listOf("touchscreen" to "controlling a device by touch", "headphones" to "listening privately", "tablet" to "portable touch computer", "cursor" to "showing a position on screen", "icon" to "small picture representing an app", "folder" to "grouping files", "backspace" to "deleting the character before the cursor", "shift key" to "typing capital letters", "battery" to "storing electrical energy", "charger" to "replenishing battery power"),
  listOf("browser" to "opening websites", "search box" to "entering words to find information", "bookmark" to "saving a web page address", "password" to "protecting access to an account", "username" to "identifying an account", "download" to "saving a file from a source", "upload" to "sending a file to a service", "email" to "sending electronic messages", "link" to "opening a connected page", "home page" to "starting page of a website"),
  listOf("copy" to "duplicating selected content", "paste" to "inserting copied content", "cut" to "moving selected content", "undo" to "reversing a recent action", "save" to "storing changes", "rename" to "changing a file name", "delete" to "removing a selected item", "recycle bin" to "holding some deleted files temporarily", "scroll" to "moving through visible content", "zoom" to "changing the display scale"),
  listOf("spreadsheet" to "organizing data in rows and columns", "cell" to "intersection of a row and column", "formula" to "calculating values automatically", "chart" to "showing data visually", "presentation" to "displaying information as slides", "slide" to "one page of a presentation", "text editor" to "creating and editing text", "file extension" to "indicating a file format", "PDF" to "portable document format", "CSV" to "comma-separated values"),
  listOf("operating system" to "managing device hardware and software", "application" to "performing a user task", "RAM" to "holding working data temporarily", "SSD" to "storing files persistently", "CPU" to "executing instructions", "USB port" to "connecting compatible devices", "Wi-Fi" to "connecting wirelessly to a network", "Bluetooth" to "connecting nearby devices wirelessly", "router" to "directing network traffic", "modem" to "connecting to a communication service"),
  listOf("algorithm" to "following steps to solve a problem", "variable" to "storing a value under a name", "loop" to "repeating instructions", "condition" to "choosing actions based on a test", "function" to "grouping reusable instructions", "debugging" to "finding and fixing errors", "source code" to "human-readable program instructions", "compiler" to "translating source code", "input" to "data supplied to a program", "output" to "results produced by a program"),
  listOf("phishing" to "tricking people into revealing information", "two-factor authentication" to "using a second login verification factor", "encryption" to "protecting data by encoding it", "backup" to "keeping a separate recoverable copy", "malware" to "software designed to cause harm", "firewall" to "filtering network traffic", "privacy setting" to "controlling access to personal information", "digital footprint" to "traces left by online activity", "copyright" to "legal protection for creative work", "citation" to "crediting an information source"),
  listOf("database" to "storing organized related data", "record" to "representing one item in a data set", "primary key" to "uniquely identifying a database record", "query" to "requesting data matching criteria", "cloud storage" to "keeping files on remote servers", "latency" to "measuring delay in communication", "bandwidth" to "describing data transfer capacity", "IP address" to "identifying a network interface", "domain name" to "providing a human-readable internet name", "HTTPS" to "securing web traffic using TLS"),
  listOf("machine learning" to "finding patterns from training data", "training data" to "examples used to fit a model", "bias in data" to "systematic distortion in a dataset", "overfitting" to "learning training examples too narrowly", "open-source license" to "defining permissions for source code use", "version control" to "tracking changes to files", "repository" to "storing project files and history", "API" to "allowing software systems to communicate", "accessibility" to "making technology usable by people with different needs", "data minimization" to "collecting only necessary personal information")
 )
 private fun questions(terms: List<Pair<String,String>>): List<Question> =
  terms.mapIndexed { index, item ->
   val alternatives = listOf(terms[(index + 3) % terms.size].second,
    terms[(index + 6) % terms.size].second, item.second)
   val rotation = index % 3
   val answers = alternatives.drop(rotation) + alternatives.take(rotation)
   Question("What is the main purpose of ${item.first}?", answers,
    answers.indexOf(item.second), "${item.first} means ${item.second}.")
  }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  val questions = questions(concepts[index])
  listOf(
   Lesson("digital-${grade.replace(" ", "-")}-1", grade, "Computer Basics",
    "Digital skills: Part 1", "Learn how technology works and how to use it responsibly.",
    questions.take(5)),
   Lesson("digital-${grade.replace(" ", "-")}-2", grade, "Computer Basics",
    "Digital skills: Part 2", "Practice important computer and internet concepts.",
    questions.drop(5))
  )
 }
}
