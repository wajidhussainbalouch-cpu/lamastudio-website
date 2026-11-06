package pk.lamastudio.kidslearning

/** One hundred offline general-knowledge questions, ten for each level. */
object GeneralKnowledgeExpansion {
 private val facts = listOf(
  listOf(
   "Which animal gives us wool?" to "Sheep",
   "What do we drink when thirsty?" to "Water",
   "What color is fresh grass usually?" to "Green",
   "What do bees make?" to "Honey",
   "Which part of the body helps us see?" to "Eyes",
   "What do we use to brush teeth?" to "Toothbrush",
   "Which animal barks?" to "Dog",
   "What do we call a baby cat?" to "Kitten",
   "What protects us from rain?" to "Umbrella",
   "Which fruit is usually orange?" to "Orange"
  ),
  listOf(
   "How many wheels does a bicycle have?" to "Two",
   "Which animal has a long trunk?" to "Elephant",
   "What do plants need from the sky?" to "Sunlight",
   "Which vehicle flies in the sky?" to "Aeroplane",
   "Which season is usually the hottest?" to "Summer",
   "Where do fish live?" to "Water",
   "What do we call frozen water?" to "Ice",
   "Which shape has three sides?" to "Triangle",
   "Who helps sick people in hospitals?" to "Doctor",
   "Which direction is opposite north?" to "South"
  ),
  listOf(
   "How many months are in a year?" to "Twelve",
   "Which planet do we live on?" to "Earth",
   "What is the first month of the year?" to "January",
   "Which organ helps us breathe?" to "Lungs",
   "What is the young of a cow called?" to "Calf",
   "Which day follows Friday?" to "Saturday",
   "Which tool tells direction?" to "Compass",
   "What do roots absorb from soil?" to "Water",
   "Which shape has four equal sides?" to "Square",
   "Which star lights Earth during the day?" to "Sun"
  ),
  listOf(
   "Which is the largest land animal?" to "African elephant",
   "What is the capital city of Pakistan?" to "Islamabad",
   "What is the currency of Pakistan?" to "Pakistani rupee",
   "How many minutes are in one hour?" to "Sixty",
   "What do we call a group of stars forming a pattern?" to "Constellation",
   "Which instrument measures rainfall?" to "Rain gauge",
   "Which ocean borders Pakistan's coast?" to "Indian Ocean",
   "What is the opposite of sunrise?" to "Sunset",
   "Which organ pumps blood?" to "Heart",
   "Which gas do humans need for breathing?" to "Oxygen"
  ),
  listOf(
   "Which is the highest mountain in Pakistan?" to "K2",
   "Which river flows through Punjab and Sindh?" to "Indus River",
   "Which is the national flower of Pakistan?" to "Jasmine",
   "Which city is known as Pakistan's largest city by population?" to "Karachi",
   "Which country lies to Pakistan's west?" to "Afghanistan",
   "Which instrument measures temperature?" to "Thermometer",
   "What is the largest planet in our solar system?" to "Jupiter",
   "What is Earth's natural satellite?" to "Moon",
   "What is the process of plants making food using light?" to "Photosynthesis",
   "Which layer of Earth is at the surface?" to "Crust"
  ),
  listOf(
   "What does UNESCO stand for?" to "United Nations Educational, Scientific and Cultural Organization",
   "Which continent is the Sahara Desert in?" to "Africa",
   "Which imaginary line is at zero degrees latitude?" to "Equator",
   "Which is the smallest continent by land area?" to "Australia",
   "Which instrument measures wind speed?" to "Anemometer",
   "What is the study of weather called?" to "Meteorology",
   "Which planet is known for its prominent rings?" to "Saturn",
   "Which vitamin can skin produce with sunlight?" to "Vitamin D",
   "Which organ filters blood to produce urine?" to "Kidneys",
   "What is the name of the force resisting sliding?" to "Friction"
  ),
  listOf(
   "What is the longest river in Pakistan?" to "Indus River",
   "Which sea is northwest of the Indian Ocean?" to "Arabian Sea",
   "Which city is Pakistan's federal capital?" to "Islamabad",
   "Which is the largest province of Pakistan by area?" to "Balochistan",
   "Which is the largest province of Pakistan by population?" to "Punjab",
   "What does GDP stand for?" to "Gross Domestic Product",
   "What is the chemical symbol for gold?" to "Au",
   "Which blood cells help fight infection?" to "White blood cells",
   "What is the basic unit of life?" to "Cell",
   "What is the SI unit of electric current?" to "Ampere"
  ),
  listOf(
   "Which planet has the shortest year?" to "Mercury",
   "Which scientist proposed three laws of motion?" to "Isaac Newton",
   "Which gas makes up most of Earth's atmosphere?" to "Nitrogen",
   "What is the largest organ of the human body?" to "Skin",
   "What is the chemical formula of water?" to "H2O",
   "What is the SI unit of energy?" to "Joule",
   "Which instrument measures atmospheric pressure?" to "Barometer",
   "What is the study of earthquakes called?" to "Seismology",
   "Which branch of government interprets laws?" to "Judiciary",
   "What does a population census count?" to "People"
  ),
  listOf(
   "What is the SI unit of frequency?" to "Hertz",
   "Which particle has a positive electric charge?" to "Proton",
   "What is the pH of pure water at 25 degrees Celsius?" to "7",
   "Which organelle contains chlorophyll?" to "Chloroplast",
   "What is the process of liquid turning into gas?" to "Evaporation",
   "What is the study of heredity called?" to "Genetics",
   "Which treaty created the United Nations Charter?" to "UN Charter",
   "Which layer of the atmosphere contains most weather?" to "Troposphere",
   "What is the basic unit of an element?" to "Atom",
   "Which device converts light directly to electrical energy?" to "Solar cell"
  ),
  listOf(
   "What is the SI unit of electrical resistance?" to "Ohm",
   "What is the approximate speed of light in vacuum?" to "300000 km/s",
   "Which law relates current, voltage and resistance?" to "Ohm's law",
   "What is the chemical symbol for sodium?" to "Na",
   "Which type of bond shares electron pairs?" to "Covalent bond",
   "What is the study of ecosystems called?" to "Ecology",
   "Which process makes RNA from a DNA template?" to "Transcription",
   "Which type of economic measure tracks general price increases?" to "Inflation rate",
   "What is the term for a government's spending exceeding revenue?" to "Budget deficit",
   "Which international body issues the Human Development Report?" to "UNDP"
  )
 )
 private val wrongAnswers = listOf("Moon", "Paper", "Chair", "Blue", "Seven", "Mountain", "Mercury", "Gold", "Winter", "Clock")
 private fun question(prompt: String, answer: String, index: Int): Question {
  val alternatives = wrongAnswers.filter { it != answer }.take(2)
  val options = listOf(alternatives[0], answer, alternatives[1])
  return Question(prompt, options, 1, "Correct answer: $answer.")
 }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { gradeIndex, grade ->
  val questions = facts[gradeIndex].mapIndexed { i, fact -> question(fact.first, fact.second, i) }
  listOf(
   Lesson("gk-extra-${grade.replace(" ", "-")}-1", grade, "General Knowledge", "Discover the world: Part 1",
    "Learn ten new facts about nature, society and the world.", questions.take(5)),
   Lesson("gk-extra-${grade.replace(" ", "-")}-2", grade, "General Knowledge", "Discover the world: Part 2",
    "Practice facts suitable for your class.", questions.drop(5))
  )
 }
}
