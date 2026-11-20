package pk.lamastudio.kidslearning

/**
 * 180 additional offline questions: three per subject, per grade.
 * These are supplemental to the 120-question structured practice program.
 */
object FinalMilestoneBank {
 private val subjectData = listOf(
  "English" to listOf(
   listOf("Which word rhymes with cat?" to "Hat","Which word begins with B?" to "Ball","Which word is a color?" to "Red"),
   listOf("Which word rhymes with sun?" to "Fun","Which word names an animal?" to "Rabbit","Which word begins with M?" to "Moon"),
   listOf("Which word is a plural noun?" to "Books","Which word is an action?" to "Jump","Which word is the opposite of hot?" to "Cold"),
   listOf("Which word is an adjective?" to "Bright","Which word is a pronoun?" to "They","Which sentence is a question?" to "Where is my bag?"),
   listOf("Which word is a conjunction?" to "Because","Which word is an adverb?" to "Quickly","Which sentence is in past tense?" to "She visited yesterday."),
   listOf("Which word is a preposition?" to "Between","Which phrase is a simile?" to "As brave as a lion","Which sentence uses a comma in a list?" to "I bought apples, pears, and dates."),
   listOf("Which sentence is in passive voice?" to "The window was cleaned.","Which word is a synonym for enormous?" to "Huge","Which word is an antonym of scarce?" to "Abundant"),
   listOf("Which word is a subordinating conjunction?" to "Although","Which sentence uses a relative clause?" to "The girl who won smiled.","Which phrase is an idiom?" to "Break the ice"),
   listOf("Which sentence uses a semicolon correctly?" to "It rained; we stayed home.","Which word means careful and thorough?" to "Meticulous","Which sentence contains personification?" to "The wind whispered."),
   listOf("Which phrase is an oxymoron?" to "Deafening silence","Which word means a misleading argument?" to "Fallacy","Which sentence uses parallel structure?" to "She likes reading, writing, and drawing.")
  ),
  "Urdu" to listOf(
   listOf("اردو میں پھول کس کو کہتے ہیں؟" to "گل","لفظ 'پانی' کس چیز کا نام ہے؟" to "آب","لفظ 'ماں' کس رشتے کو ظاہر کرتا ہے؟" to "والدہ"),
   listOf("لفظ 'خوش' کا الٹ کیا ہے؟" to "اداس","لفظ 'دن' کا الٹ کیا ہے؟" to "رات","لفظ 'بڑا' کا الٹ کیا ہے؟" to "چھوٹا"),
   listOf("لفظ 'کتاب' کی جمع کیا ہے؟" to "کتابیں","لفظ 'لڑکا' کی مؤنث کیا ہے؟" to "لڑکی","لفظ 'اچھا' کا متضاد کیا ہے؟" to "برا"),
   listOf("لفظ 'سچ' کا متضاد کیا ہے؟" to "جھوٹ","لفظ 'استاد' کس کے لیے استعمال ہوتا ہے؟" to "معلم","لفظ 'دوست' کا مترادف کیا ہے؟" to "رفیق"),
   listOf("لفظ 'روشنی' کا متضاد کیا ہے؟" to "اندھیرا","لفظ 'خوشبو' کا مترادف کیا ہے؟" to "مہک","لفظ 'محنت' کا مطلب کیا ہے؟" to "کوشش"),
   listOf("لفظ 'امید' کا متضاد کیا ہے؟" to "ناامیدی","لفظ 'علم' کا مترادف کیا ہے؟" to "دانش","لفظ 'امن' کا متضاد کیا ہے؟" to "جنگ"),
   listOf("لفظ 'عروج' کا متضاد کیا ہے؟" to "زوال","لفظ 'اخلاص' کا مطلب کیا ہے؟" to "خلوص","لفظ 'اتحاد' کا متضاد کیا ہے؟" to "اختلاف"),
   listOf("لفظ 'فراوانی' کا متضاد کیا ہے؟" to "قلت","لفظ 'تدبیر' کا مطلب کیا ہے؟" to "منصوبہ بندی","لفظ 'عزم' کا مترادف کیا ہے؟" to "ارادہ"),
   listOf("لفظ 'انکساری' کا متضاد کیا ہے؟" to "تکبر","لفظ 'بصیرت' کا مطلب کیا ہے؟" to "گہری سمجھ","لفظ 'تجسس' کا مطلب کیا ہے؟" to "جاننے کی خواہش"),
   listOf("لفظ 'استقامت' کا مطلب کیا ہے؟" to "ثابت قدمی","لفظ 'رواداری' کا مطلب کیا ہے؟" to "برداشت","لفظ 'خود مختاری' کا مطلب کیا ہے؟" to "اپنے فیصلوں کا اختیار")
  ),
  "Mathematics" to emptyList(),
  "Science" to listOf(
   listOf("Which sense detects smells?" to "Smell","What do we call the light in the sky at night?" to "Moonlight","Which animal lays eggs?" to "Hen"),
   listOf("What is the hard outer covering of an egg?" to "Shell","Which body part bends at the elbow?" to "Arm","What is the color of a healthy leaf usually?" to "Green"),
   listOf("Which object is attracted to a magnet?" to "Iron nail","Which part of the body digests food?" to "Stomach","What do we call a baby butterfly before it changes?" to "Caterpillar"),
   listOf("What is the change from liquid to solid?" to "Freezing","What do we call animals that eat meat?" to "Carnivores","What helps a seed begin growing?" to "Water"),
   listOf("Which gas do plants release in photosynthesis?" to "Oxygen","What carries messages in the body?" to "Nerves","What do we call the movement of Earth around the Sun?" to "Revolution"),
   listOf("What is the unit of mass in SI?" to "Kilogram","Which tissue transports sugars in plants?" to "Phloem","What is an organism's response to a stimulus?" to "Reaction"),
   listOf("Which organ produces bile?" to "Liver","What is a molecule?" to "Two or more bonded atoms","What is the transfer of heat by moving fluid?" to "Convection"),
   listOf("What do enzymes do?" to "Speed up biological reactions","What is the SI unit of pressure?" to "Pascal","Which structure controls entry into a cell?" to "Cell membrane"),
   listOf("Which process copies DNA?" to "Replication","What is the SI unit of charge?" to "Coulomb","What is a neutral solution's pH at 25°C?" to "7"),
   listOf("What is the SI unit of magnetic flux?" to "Weber","What is an allele?" to "A variant of a gene","What is the process of breaking down glucose to release energy?" to "Cellular respiration")
  ),
  "General Knowledge" to listOf(
   listOf("What is the name of our country?" to "Pakistan","What is a person who teaches called?" to "Teacher","What color is a ripe banana usually?" to "Yellow"),
   listOf("How many days are in a week?" to "Seven","Which vehicle runs on rails?" to "Train","Which bird is known for its colorful tail?" to "Peacock"),
   listOf("Which city is the capital of Punjab, Pakistan?" to "Lahore","How many hours are in a day?" to "24","Which ocean is the largest?" to "Pacific Ocean"),
   listOf("Which province has Quetta as its capital?" to "Balochistan","Which month comes after March?" to "April","What does a map show?" to "Places and locations"),
   listOf("Which city is the capital of Sindh?" to "Karachi","Which continent contains Pakistan?" to "Asia","What do we call a person who studies the past?" to "Historian"),
   listOf("Which province has Peshawar as its capital?" to "Khyber Pakhtunkhwa","Which ocean lies south of Asia?" to "Indian Ocean","What is the largest hot desert?" to "Sahara Desert"),
   listOf("Which is the national language of Pakistan?" to "Urdu","What is a democracy?" to "Government with public participation","What is a constitution?" to "Fundamental laws of a state"),
   listOf("Which mountain range includes K2?" to "Karakoram","What does a compass needle help identify?" to "Direction","What is a peninsula?" to "Land surrounded by water on three sides"),
   listOf("What is longitude used to measure?" to "Position east or west","What is the purpose of a national census?" to "Count and describe population","Which body coordinates international public health?" to "WHO"),
   listOf("What does literacy rate measure?" to "Share of people able to read and write","What is a trade deficit?" to "Imports exceed exports in value","What is a renewable resource?" to "Resource replenished naturally")
  ),
  "Computer Basics" to listOf(
   listOf("What do we press to type a letter?" to "Keyboard key","Which device displays pictures?" to "Screen","What moves a pointer on a computer?" to "Mouse"),
   listOf("Which key makes a space between words?" to "Spacebar","Which device prints on paper?" to "Printer","What is a tablet computer?" to "Portable touchscreen device"),
   listOf("Which key starts a new line?" to "Enter","Which device records your voice?" to "Microphone","What is a computer file?" to "Saved information"),
   listOf("What is a folder used for?" to "Organizing files","What is a password?" to "Secret sign-in information","What does a web browser open?" to "Web pages"),
   listOf("What does the save command do?" to "Stores changes","What does copy and paste do?" to "Duplicates selected content","What does a search engine help find?" to "Information on the web"),
   listOf("What is a spreadsheet cell?" to "Intersection of a row and column","What does a formula in a spreadsheet do?" to "Calculates a result","What is a presentation slide?" to "One screen in a slideshow"),
   listOf("What is a hyperlink?" to "Clickable connection to another resource","What is a file extension?" to "Suffix indicating file type","What is a strong password?" to "Long and difficult-to-guess secret"),
   listOf("What does RAM hold while a computer works?" to "Temporary working data","What is malware?" to "Software designed to cause harm","What is cloud storage?" to "Data stored on remote servers"),
   listOf("What is encryption?" to "Encoding data to protect it","What is an algorithm?" to "Step-by-step procedure","What is a database query?" to "Request to retrieve data"),
   listOf("What is an API?" to "Interface for software communication","What is version control?" to "Tracking changes to files","What is multi-factor authentication?" to "Using more than one identity check")
  )
 )
 private fun fromFacts(grade: String, subject: String, facts: List<Pair<String,String>>): List<Question> =
  facts.mapIndexed { index, fact ->
   val correct = fact.second
   val distractors = (facts.map { it.second } + listOf("None of these", "Not known"))
    .filter { it != correct }.distinct().take(2)
   val options = listOf(correct, distractors[0], distractors[1])
   val shift = index % 3
   val rotated = options.drop(shift) + options.take(shift)
   Question(fact.first, rotated, rotated.indexOf(correct), "Correct answer: $correct.")
  }
 private fun math(gradeIndex: Int): List<Question> = (1..3).map { i ->
  val a = (gradeIndex + 2) * (i + 3)
  val b = gradeIndex + i + 1
  val answer = if (i == 1 || gradeIndex < 2) a + b else if (i == 2) a - b else a * b
  val symbol = if (i == 1 || gradeIndex < 2) "+" else if (i == 2) "−" else "×"
  val options = listOf(answer + 1, answer, answer - 1).map { it.toString() }
  Question("Calculate: $a $symbol $b = ?", options, 1, "$a $symbol $b = $answer.")
 }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  subjectData.map { (subject, perGrade) ->
   val questions = if (subject == "Mathematics") math(index) else fromFacts(grade, subject, perGrade[index])
   Lesson("final-milestone-${grade.replace(" ", "-")}-${subject.replace(" ", "-")}",
    grade, subject, "More $subject challenges",
    "Three additional questions for this level.", questions)
  }
 }
}
