package pk.lamastudio.kidslearning

/**
 * Exactly twelve selectable practice sets of ten questions per grade (120 per level).
 * Questions for the existing four subjects are selected from previously authored
 * content. General Knowledge and Computer Basics use reviewed starter prompts
 * shared within age bands. This is not a complete curriculum.
 */
object TenQuestionSets {
 private fun q(prompt: String, correct: String, a: String, b: String, why: String) =
  Question(prompt, listOf(a, b, correct), 2, why)

 private val gk = listOf(
  listOf(
   q("What do we call the place where we live?", "Home", "Cloud", "River", "A home is where people live."),
   q("Which day comes after Monday?", "Tuesday", "Friday", "Sunday", "Tuesday follows Monday."),
   q("Which animal says meow?", "Cat", "Cow", "Duck", "Cats meow."),
   q("Which color is a ripe banana usually?", "Yellow", "Purple", "Blue", "Ripe bananas are often yellow."),
   q("What do we wear on our feet?", "Shoes", "Hats", "Gloves", "Shoes protect our feet."),
   q("Which vehicle travels on rails?", "Train", "Boat", "Bicycle", "Trains run on rails."),
   q("What should we do before eating?", "Wash hands", "Play in mud", "Touch rubbish", "Clean hands help prevent illness."),
   q("Which month comes after January?", "February", "October", "June", "February follows January."),
   q("How many days are in a week?", "Seven", "Five", "Ten", "A week has seven days."),
   q("What do we use to tell the time?", "Clock", "Plate", "Pillow", "Clocks show time.")
  ),
  listOf(
   q("What is the capital of Pakistan?", "Islamabad", "Karachi", "Lahore", "Islamabad is Pakistan's capital."),
   q("Which continent contains Pakistan?", "Asia", "Africa", "Europe", "Pakistan is in Asia."),
   q("Which ocean lies south of Pakistan?", "Indian Ocean", "Arctic Ocean", "Atlantic Ocean", "Pakistan borders the Arabian Sea, part of the Indian Ocean."),
   q("How many provinces does Pakistan have?", "Four", "Six", "Eight", "Pakistan has four provinces."),
   q("Which is the largest continent by area?", "Asia", "Australia", "Europe", "Asia is the largest continent."),
   q("Which direction does the sun rise from?", "East", "North", "West", "The sun appears to rise in the east."),
   q("Which country is directly east of Pakistan?", "India", "Turkey", "Egypt", "India borders Pakistan to the east."),
   q("What is a map used for?", "Showing locations", "Cooking food", "Measuring weight", "Maps represent places."),
   q("Which is the national language of Pakistan?", "Urdu", "Arabic", "French", "Urdu is Pakistan's national language."),
   q("Which organization is abbreviated UN?", "United Nations", "Universal Network", "United Nature", "UN stands for United Nations.")
  ),
  listOf(
   q("Which is the largest ocean?", "Pacific Ocean", "Indian Ocean", "Arctic Ocean", "The Pacific is the largest ocean."),
   q("What is the primary purpose of a constitution?", "Set basic rules of government", "Predict weather", "Measure land", "A constitution establishes fundamental governance rules."),
   q("What does GDP stand for?", "Gross Domestic Product", "General Data Program", "Global Development Plan", "GDP measures economic output."),
   q("What is a renewable resource?", "One replenished naturally", "One that never changes", "One made only of metal", "Renewable resources can replenish."),
   q("Which line divides Earth into northern and southern hemispheres?", "Equator", "Prime meridian", "Tropic of Cancer", "The equator is at zero degrees latitude."),
   q("Which instrument measures atmospheric pressure?", "Barometer", "Thermometer", "Speedometer", "Barometers measure air pressure."),
   q("Which institution makes laws in a parliamentary system?", "Legislature", "Weather office", "Hospital", "The legislature makes laws."),
   q("What does literacy mean?", "Ability to read and write", "Ability to swim", "Ability to drive", "Literacy includes reading and writing."),
   q("What is inflation?", "General rise in prices", "Falling population", "Increasing rainfall", "Inflation is a sustained increase in general price levels."),
   q("What is the purpose of a census?", "Count and describe a population", "Measure rainfall", "Set school holidays", "A census gathers population information.")
  )
 )
 private val computer = listOf(
  listOf(
   q("Which device has keys for typing?", "Keyboard", "Cup", "Spoon", "A keyboard is used to type."),
   q("What do we use to move a pointer?", "Mouse", "Notebook", "Ruler", "A mouse moves the pointer."),
   q("Which device shows pictures from a computer?", "Monitor", "Pencil", "Eraser", "A monitor displays images."),
   q("Which key makes a space between words?", "Spacebar", "Shift", "Escape", "The spacebar inserts a space."),
   q("Which device prints on paper?", "Printer", "Speaker", "Camera", "Printers produce paper copies."),
   q("What should you do before using a shared computer?", "Ask permission", "Delete files", "Unplug cables", "Ask a responsible adult for permission."),
   q("Which device plays sound?", "Speaker", "Mouse pad", "Paper", "Speakers produce sound."),
   q("Which symbol is used in an email address?", "@", "#", "%", "Email addresses use the @ symbol."),
   q("What should you do with a strange online message?", "Tell a trusted adult", "Reply with your address", "Share a password", "A trusted adult can help keep you safe."),
   q("Which key starts a new line?", "Enter", "Caps Lock", "Tab only", "Enter can start a new line.")
  ),
  listOf(
   q("What does CPU stand for?", "Central Processing Unit", "Computer Power Utility", "Central Print Unit", "CPU means Central Processing Unit."),
   q("Which storage keeps files after shutdown?", "SSD", "RAM", "CPU cache", "An SSD stores data persistently."),
   q("Which program is used to browse websites?", "Web browser", "Calculator", "Paint brush", "Browsers open websites."),
   q("What is a strong password?", "A long unique phrase", "123456", "Your first name", "Long unique passwords are harder to guess."),
   q("What does URL refer to?", "A web address", "A sound card", "A screen type", "A URL identifies an online resource."),
   q("Which action copies selected text?", "Copy", "Delete", "Shutdown", "Copy duplicates selected content."),
   q("What is a spreadsheet useful for?", "Organizing data in cells", "Washing clothes", "Printing photos only", "Spreadsheets organize data."),
   q("Which is an input device?", "Microphone", "Monitor", "Projector", "Microphones capture sound input."),
   q("What is a file extension?", "A suffix indicating file type", "A computer cable", "A screen setting", "Extensions often indicate file format."),
   q("What should you do before installing unknown software?", "Check with a trusted adult", "Ignore warnings", "Share your password", "Checking safety reduces risk.")
  ),
  listOf(
   q("What is an algorithm?", "Step-by-step procedure", "A computer virus", "A monitor setting", "Algorithms describe steps to solve problems."),
   q("What is a variable in programming?", "A named value holder", "A fixed keyboard key", "A computer fan", "Variables store values."),
   q("What is encryption?", "Encoding information to protect it", "Deleting all files", "Turning off the screen", "Encryption protects information."),
   q("What does HTTPS indicate?", "Encrypted web connection", "Offline-only page", "A computer brand", "HTTPS uses TLS to protect data in transit."),
   q("What is a database?", "Organized collection of data", "A sound output", "A computer mouse", "Databases store organized information."),
   q("What is phishing?", "Deceptive attempt to steal information", "Making a backup", "Drawing a chart", "Phishing tricks people into revealing data."),
   q("What is open-source software?", "Software with source code available under a license", "Software without any rules", "Software that cannot be changed", "Open-source licenses permit defined uses of source code."),
   q("What is a software bug?", "An error in a program", "A type of keyboard", "A network cable", "Bugs cause incorrect behavior."),
   q("What is a backup?", "A separate copy of data", "A screen wallpaper", "A keyboard shortcut only", "Backups help restore lost data."),
   q("What is two-factor authentication?", "Two different checks for signing in", "Using two browsers", "Two monitors", "A second factor improves account security.")
  )
 )
 private fun tier(index: Int) = when { index <= 2 -> 0; index <= 5 -> 1; else -> 2 }
 private fun existing(grade: String, subject: String): List<Question> =
  (GradeQuestionBank.lessons + ClassSpecificBank.lessons + ConceptReviewBank.lessons +
   AppliedPracticeBank.lessons + TopicLibrary.lessons + LearningContent.practiceLessons)
   .asSequence().filter { it.grade == grade && it.subject == subject }
   .flatMap { it.questions.asSequence() }.distinctBy { it.prompt.trim() }.toList()

 private fun from(grade: String, subject: String, offset: Int): List<Question> {
  val pool = if (subject == "Mathematics")
   (MathPracticeBank.questions(grade, 0) + MathPracticeBank.questions(grade, 1))
   .distinctBy { it.prompt }
  else existing(grade, subject)
  require(pool.size >= 20) { "Not enough unique $subject questions for $grade: ${pool.size}" }
  return pool.drop(offset).take(10)
 }
 private val subjects = listOf("English", "English", "Urdu", "Urdu",
  "Mathematics", "Mathematics", "Science", "Science",
  "General Knowledge", "General Knowledge", "Computer Basics", "Computer Basics")

 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { gradeIndex, grade ->
  subjects.mapIndexed { setIndex, subject ->
   val questions = when (subject) {
    "General Knowledge" -> if (setIndex == 8) gk[tier(gradeIndex)] else
     (GeneralKnowledgeExpansion.lessons.filter { it.grade == grade }.flatMap { it.questions } +
      GeneralKnowledgeExpansion.lessons.flatMap { it.questions })
      .distinctBy { it.prompt.trim() }.filterNot { candidate ->
       gk[tier(gradeIndex)].any { it.prompt.trim() == candidate.prompt.trim() }
      }.take(10)
    "Computer Basics" -> if (setIndex == 10) computer[tier(gradeIndex)] else
     (DigitalSkillsBank.lessons.filter { it.grade == grade }.flatMap { it.questions } +
      DigitalSkillsBank.lessons.flatMap { it.questions })
      .distinctBy { it.prompt.trim() }.filterNot { candidate ->
       computer[tier(gradeIndex)].any { it.prompt.trim() == candidate.prompt.trim() }
      }.take(10)
    else -> from(grade, subject, if (setIndex % 2 == 0) 0 else 10)
   }
   require(questions.size == 10) { "Expected ten questions for $grade / $subject / $setIndex" }
   Lesson("ten-set-${grade.replace(" ", "-")}-${setIndex + 1}", grade, subject,
    "Practice set ${setIndex + 1} of 10",
    "Answer ten questions and review the explanation after each answer.",
    questions)
  }
 }
}
