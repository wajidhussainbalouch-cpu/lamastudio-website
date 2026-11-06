package pk.lamastudio.kidslearning

/** Reviewed starter material is still required before production publication.
 * This offline bank adds three short practice topics per grade for each language/science subject.
 */
object GradeQuestionBank {
 private fun q(prompt: String, correct: String, wrong1: String, wrong2: String, why: String): Question =
  Question(prompt, listOf(correct, wrong1, wrong2), 0, why)

 private val earlyEnglish = listOf(
  q("Which letter begins CAT?", "C", "B", "D", "Cat begins with C."),
  q("Which letter begins DOG?", "D", "G", "T", "Dog begins with D."),
  q("Which word names a color?", "Red", "Run", "Eat", "Red is a color."),
  q("What is the opposite of hot?", "Cold", "Tall", "Fast", "Cold is the opposite of hot."),
  q("Which word rhymes with cat?", "Hat", "Sun", "Pen", "Cat and hat rhyme."),
  q("Which word names an animal?", "Rabbit", "Table", "Pencil", "Rabbit is an animal."),
  q("Which is a vowel?", "E", "B", "T", "E is a vowel."),
  q("Which word begins with S?", "Star", "Apple", "Book", "Star begins with S."),
  q("Which word means one more than one?", "Two", "One", "Zero", "Two means one plus one."),
  q("Which sentence is a question?", "Are you ready?", "I am ready.", "We are here.", "A question asks something."),
  q("Which is a greeting?", "Hello", "Under", "Green", "Hello is a greeting."),
  q("Which word is plural?", "Books", "Book", "A book", "Books means more than one book.")
 )
 private val middleEnglish = listOf(
  q("Which word is a verb?", "Jump", "Blue", "Desk", "Jump describes an action."),
  q("Which word is an adjective?", "Gentle", "Walk", "Village", "Gentle describes a noun."),
  q("Plural of child?", "Children", "Childs", "Childes", "Children is the irregular plural."),
  q("Past tense of go?", "Went", "Goed", "Going", "Went is the past tense of go."),
  q("Which word is a pronoun?", "They", "School", "Quick", "They is a pronoun."),
  q("Choose the correct article: ___ apple.", "An", "A", "Thee", "An comes before a vowel sound."),
  q("Which word is an adverb?", "Slowly", "Slow", "Slowness", "Slowly tells how an action happens."),
  q("Which is the opposite of ancient?", "Modern", "Old", "Historic", "Modern contrasts with ancient."),
  q("Which word is a conjunction?", "Because", "Beautiful", "River", "Because connects ideas."),
  q("Choose the correct form: She ___ every day.", "reads", "readed", "reading", "She reads is present simple."),
  q("Which word means brave?", "Courageous", "Afraid", "Sleepy", "Courageous means brave."),
  q("Which is a complete sentence?", "The birds are singing.", "Because the birds", "On the tall", "It has a subject and predicate.")
 )
 private val upperEnglish = listOf(
  q("Which is a complex sentence?", "I stayed home because it rained.", "It rained.", "Rain and wind.", "A complex sentence contains a dependent clause."),
  q("Identify the passive voice.", "The ball was kicked by Ali.", "Ali kicked the ball.", "Ali kicks.", "The subject receives the action."),
  q("Which word is a synonym of meticulous?", "Careful", "Careless", "Rapid", "Meticulous means very careful."),
  q("Which word is an antonym of scarce?", "Abundant", "Rare", "Limited", "Abundant means plentiful."),
  q("Which is a conditional sentence?", "If it rains, we will stay.", "It is raining.", "Rain is wet.", "If introduces a condition."),
  q("Identify the relative pronoun.", "Which", "Very", "Quickly", "Which can introduce a relative clause."),
  q("Which sentence uses present perfect?", "She has finished her work.", "She finished yesterday.", "She finishes daily.", "Has finished is present perfect."),
  q("Which word is an abstract noun?", "Honesty", "Chair", "River", "Honesty names a quality."),
  q("Which is correctly punctuated?", "Where are you going?", "Where are you going.", "Where are you going,", "Direct questions end with a question mark."),
  q("Which is an example of alliteration?", "Busy bees buzz.", "The sun is hot.", "A red flower.", "Repeated initial consonant sounds create alliteration."),
  q("What is the main purpose of a topic sentence?", "Introduce a paragraph's main idea", "End a story", "List page numbers", "A topic sentence presents the main idea."),
  q("Which is a subordinating conjunction?", "Although", "And", "Or", "Although introduces a dependent clause.")
 )
 private val earlyUrdu = listOf(
  q("انار کا پہلا حرف کون سا ہے؟", "ا", "ب", "ت", "انار ا سے شروع ہوتا ہے۔"),
  q("بکری کا پہلا حرف کون سا ہے؟", "ب", "پ", "ج", "بکری ب سے شروع ہوتی ہے۔"),
  q("قلم کس کام آتا ہے؟", "لکھنے", "کھانے", "سونے", "قلم سے لکھتے ہیں۔"),
  q("دن کے بعد کیا آتا ہے؟", "رات", "صبح", "دوپہر", "دن کے بعد رات آتی ہے۔"),
  q("سورج کب نکلتا ہے؟", "صبح", "رات", "آدھی رات", "سورج صبح طلوع ہوتا ہے۔"),
  q("پانی کس کام آتا ہے؟", "پینے", "اڑنے", "کاٹنے", "پانی پیا جاتا ہے۔"),
  q("درخت پر کیا اگتا ہے؟", "پتے", "کتاب", "جوتے", "درخت پر پتے اگتے ہیں۔"),
  q("ایک کے بعد کون سا عدد ہے؟", "دو", "چار", "پانچ", "ایک کے بعد دو آتا ہے۔"),
  q("کتاب کہاں پڑھی جاتی ہے؟", "اسکول", "دریا کے اندر", "بادل پر", "اسکول میں کتاب پڑھی جاتی ہے۔"),
  q("پرندہ کیا کر سکتا ہے؟", "اڑنا", "لکھنا", "پکانا", "بہت سے پرندے اڑ سکتے ہیں۔"),
  q("لفظ 'امی' میں کتنے حروف ہیں؟", "تین", "دو", "چار", "امی میں تین حروف ہیں۔"),
  q("سوال کے آخر میں کیا لگتا ہے؟", "؟", "۔", "،", "سوالیہ نشان لگتا ہے۔")
 )
 private val middleUrdu = listOf(
  q("کتاب کی جمع کیا ہے؟", "کتابیں", "کتابا", "کتابی", "کتاب کی جمع کتابیں ہے۔"),
  q("دن کا متضاد کیا ہے؟", "رات", "صبح", "روشنی", "دن کا متضاد رات ہے۔"),
  q("اسم کی مثال کون سی ہے؟", "درخت", "دوڑنا", "جلدی", "درخت ایک چیز کا نام ہے۔"),
  q("فعل کی مثال کون سی ہے؟", "پڑھنا", "کرسی", "سبز", "پڑھنا ایک کام ہے۔"),
  q("صفت کی مثال کون سی ہے؟", "خوبصورت", "لکھنا", "کتاب", "خوبصورت خوبی بتاتا ہے۔"),
  q("خوش کا مترادف کیا ہے؟", "مسرور", "اداس", "غصہ", "مسرور کا معنی خوش ہے۔"),
  q("بڑا کا متضاد کیا ہے؟", "چھوٹا", "لمبا", "بھاری", "چھوٹا بڑا کا متضاد ہے۔"),
  q("کون سا جملہ سوالیہ ہے؟", "آپ کہاں ہیں؟", "وہ گھر گیا۔", "آج بارش ہے۔", "یہ سوال پوچھتا ہے۔"),
  q("استاد کی جمع کیا ہے؟", "اساتذہ", "استادی", "استادان", "اساتذہ جمع ہے۔"),
  q("کون سا لفظ واحد ہے؟", "لڑکا", "لڑکے", "لڑکیاں", "لڑکا ایک فرد کے لیے ہے۔"),
  q("کون سا لفظ مذکر ہے؟", "بیٹا", "بیٹی", "لڑکی", "بیٹا مذکر ہے۔"),
  q("کون سا لفظ مونث ہے؟", "بہن", "بھائی", "لڑکا", "بہن مونث ہے۔")
 )
 private val upperUrdu = listOf(
  q("تشبیہ کی مثال کون سی ہے؟", "وہ شیر کی طرح بہادر ہے۔", "وہ آیا۔", "آج پیر ہے۔", "کی طرح تشبیہ ظاہر کرتا ہے۔"),
  q("استعارہ کی مثال کون سی ہے؟", "وہ میدان کا شیر ہے۔", "وہ شیر کی طرح ہے۔", "شیر جنگل میں ہے۔", "استعارے میں براہ راست مماثلت ظاہر ہوتی ہے۔"),
  q("محاورہ 'ہاتھ بٹانا' کا مطلب؟", "مدد کرنا", "ہاتھ دھونا", "لکھنا", "ہاتھ بٹانا یعنی مدد کرنا۔"),
  q("لفظ 'علم' کا متضاد کیا ہے؟", "جہالت", "کتاب", "سبق", "جہالت علم کے مقابل ہے۔"),
  q("لفظ 'خوشی' کا متضاد کیا ہے؟", "غم", "مسکراہٹ", "محبت", "غم خوشی کا متضاد ہے۔"),
  q("کون سا لفظ مصدر ہے؟", "لکھنا", "لکھا", "لکھتے", "لکھنا مصدر ہے۔"),
  q("کون سا جملہ امریہ ہے؟", "دروازہ بند کرو۔", "دروازہ بند ہے۔", "دروازہ کہاں ہے؟", "امریہ جملہ حکم دیتا ہے۔"),
  q("قافیہ کیا ہوتا ہے؟", "ہم آواز الفاظ", "کتاب کا عنوان", "نثر کی سطر", "قافیہ میں آواز کی مماثلت ہوتی ہے۔"),
  q("شاعر کی جمع کیا ہے؟", "شعرا", "شاعری", "شاعرہ", "شعرا شاعر کی جمع ہے۔"),
  q("کون سا لفظ صفت ہے؟", "دلیر", "دوڑنا", "قلم", "دلیر ایک خوبی بتاتا ہے۔"),
  q("جملے میں فاعل کون ہے: علی پڑھتا ہے؟", "علی", "پڑھتا", "ہے", "علی کام کرنے والا ہے۔"),
  q("لفظ 'امن' کا متضاد کیا ہے؟", "جنگ", "سکون", "محبت", "جنگ امن کا متضاد ہے۔")
 )
 private val earlyScience = listOf(
  q("Which body part helps us see?", "Eyes", "Ears", "Feet", "Eyes help us see."),
  q("Which body part helps us hear?", "Ears", "Hands", "Nose", "Ears help us hear."),
  q("Which animal gives us milk?", "Cow", "Crow", "Ant", "Cows can provide milk."),
  q("What do plants need to grow?", "Water", "Plastic", "Glass", "Plants need water."),
  q("Which is a living thing?", "Tree", "Rock", "Chair", "Trees grow and need resources."),
  q("Which gives us daylight?", "Sun", "Torch", "Book", "Sunlight lights the daytime sky."),
  q("Which is a fruit?", "Mango", "Stone", "Spoon", "Mango is a fruit."),
  q("Which animal lives in water?", "Fish", "Camel", "Hen", "Fish live in water."),
  q("Which season is usually hottest?", "Summer", "Winter", "Autumn", "Summer is usually hottest."),
  q("Which part of a plant grows underground?", "Root", "Flower", "Leaf", "Roots usually grow underground."),
  q("Which helps keep teeth clean?", "Brushing", "Mud", "Dust", "Brushing cleans teeth."),
  q("Which is safe to drink?", "Clean water", "Dirty water", "Paint", "Clean drinking water is safer.")
 )
 private val middleScience = listOf(
  q("Which organ pumps blood?", "Heart", "Lungs", "Stomach", "The heart pumps blood."),
  q("Which gas do humans breathe in to survive?", "Oxygen", "Helium", "Neon", "Humans need oxygen."),
  q("Which process turns liquid water into vapor?", "Evaporation", "Freezing", "Melting", "Evaporation changes liquid to gas."),
  q("What do roots absorb?", "Water", "Sunlight", "Sound", "Roots absorb water."),
  q("Which material is magnetic?", "Iron", "Wood", "Paper", "Iron is attracted by magnets."),
  q("Which planet is our home?", "Earth", "Mars", "Venus", "We live on Earth."),
  q("Which is a renewable energy source?", "Sunlight", "Coal", "Petrol", "Sunlight is renewable."),
  q("What causes shadows?", "Blocked light", "Sound", "Smell", "Opaque objects block light."),
  q("Which state of matter keeps its shape?", "Solid", "Liquid", "Gas", "Solids retain their shape."),
  q("What is the boiling point of water at sea level?", "100°C", "0°C", "50°C", "Water boils near 100°C at sea level."),
  q("Which is a vertebrate?", "Cat", "Earthworm", "Snail", "Cats have backbones."),
  q("What carries pollen between flowers?", "Pollinators", "Rocks", "Clouds", "Insects and other animals can pollinate.")
 )
 private val upperScience = listOf(
  q("What is the SI unit of force?", "Newton", "Joule", "Watt", "Force is measured in newtons."),
  q("Which organelle releases energy from food?", "Mitochondrion", "Cell wall", "Vacuole", "Mitochondria carry out cellular respiration."),
  q("What is the chemical formula of water?", "H₂O", "CO₂", "O₂", "Water contains two hydrogen atoms and one oxygen atom."),
  q("Which process transfers heat through a solid?", "Conduction", "Reflection", "Refraction", "Conduction transfers heat through contact."),
  q("Which particle has a negative charge?", "Electron", "Proton", "Neutron", "Electrons are negatively charged."),
  q("What does photosynthesis release?", "Oxygen", "Nitrogen", "Helium", "Oxygen is released during photosynthesis."),
  q("Which blood cells carry oxygen?", "Red blood cells", "Platelets", "White blood cells", "Red blood cells contain hemoglobin."),
  q("What is the unit of electrical resistance?", "Ohm", "Volt", "Ampere", "Resistance is measured in ohms."),
  q("Which type of rock forms from cooled magma?", "Igneous", "Sedimentary", "Metamorphic", "Igneous rocks form from cooled molten rock."),
  q("What is the approximate speed of light in vacuum?", "300,000 km/s", "300 km/s", "3 km/s", "Light travels about 300,000 km per second."),
  q("Which is a greenhouse gas?", "Carbon dioxide", "Argon", "Neon", "Carbon dioxide absorbs infrared radiation."),
  q("What does an ecosystem include?", "Organisms and their environment", "Only animals", "Only soil", "An ecosystem includes living and nonliving parts.")
 )

 private fun bank(subject: String, gradeIndex: Int): List<Question> {
  val tier = when { gradeIndex < 4 -> 0; gradeIndex < 7 -> 1; else -> 2 }
  return when (subject) {
   "English" -> listOf(earlyEnglish, middleEnglish, upperEnglish)[tier]
   "Urdu" -> listOf(earlyUrdu, middleUrdu, upperUrdu)[tier]
   else -> listOf(earlyScience, middleScience, upperScience)[tier]
  }
 }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  listOf("English", "Urdu", "Science").flatMap { subject ->
   val questions = bank(subject, index)
   (0..2).map { topic ->
    Lesson("graded-${grade.replace(" ", "-")}-$subject-$topic", grade, subject,
     when (subject) {
      "Urdu" -> listOf("الفاظ کی مشق", "جملوں کی مشق", "معلوماتی سوالات")[topic]
      "Science" -> listOf("Science practice A", "Science practice B", "Science practice C")[topic]
      else -> listOf("English practice A", "English practice B", "English practice C")[topic]
     },
     "Practice and learn with short explanations.",
     questions.subList(topic * 4, (topic + 1) * 4))
   }
  }
 }
}
