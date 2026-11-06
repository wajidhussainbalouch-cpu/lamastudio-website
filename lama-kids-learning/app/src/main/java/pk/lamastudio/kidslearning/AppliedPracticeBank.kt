package pk.lamastudio.kidslearning

/**
 * Context-based multiple choice practice with grade-specific scenarios.
 * All content is offline; teacher review remains necessary before publication.
 */
object AppliedPracticeBank {
 private fun q(prompt: String, right: String, wrong1: String, wrong2: String, explanation: String) =
  Question(prompt, listOf(wrong1, right, wrong2), 1, explanation)

 private val english = listOf(
  listOf(
   q("Which word completes: I see a ___?", "cat", "run", "blue", "Cat names an animal."),
   q("Which word rhymes with sun?", "fun", "tree", "book", "Sun and fun rhyme."),
   q("Choose the greeting.", "Hello!", "Under!", "Blue!", "Hello is a greeting."),
   q("Which letter comes after B?", "C", "A", "E", "The alphabet goes A, B, C.")),
  listOf(
   q("Complete: The bird can ___.", "fly", "yellow", "table", "Fly is an action."),
   q("Choose the plural of pen.", "pens", "penes", "penn", "Add s to make pens."),
   q("Which word begins with the /sh/ sound?", "ship", "cat", "dog", "Ship starts with sh."),
   q("Which word is the opposite of big?", "small", "wide", "heavy", "Small is the opposite of big.")),
  listOf(
   q("Complete: She ___ a book every day.", "reads", "readed", "reading", "She reads is present simple."),
   q("Which is an adjective?", "bright", "jump", "school", "Bright describes a noun."),
   q("Which word means the same as quick?", "fast", "slow", "late", "Fast and quick have similar meanings."),
   q("Choose the correct question.", "Where is my bag?", "Where is my bag.", "Where is my bag,", "A question ends with a question mark.")),
  listOf(
   q("Which sentence uses past tense?", "They visited the museum.", "They visit daily.", "They will visit.", "Visited shows past time."),
   q("Choose the correct conjunction: I stayed home ___ it rained.", "because", "beautiful", "under", "Because introduces a reason."),
   q("Which is a pronoun?", "we", "river", "large", "We replaces a group of nouns."),
   q("Which sentence is a command?", "Close the door.", "The door is closed.", "Is the door closed?", "A command tells someone to act.")),
  listOf(
   q("Choose the correct comparative: This bag is ___ than that one.", "heavier", "heaviest", "heavy", "Heavier compares two things."),
   q("Which phrase is a simile?", "as busy as a bee", "the classroom is quiet", "birds are flying", "A simile uses as or like."),
   q("Choose the correct preposition: The ball is ___ the box.", "inside", "carefully", "happy", "Inside shows position."),
   q("Which word is a homophone of sea?", "see", "say", "she", "Sea and see sound alike.")),
  listOf(
   q("Choose the correct present perfect: She ___ finished.", "has", "have", "had been", "She has finished uses present perfect."),
   q("What does the prefix un- mean in unhappy?", "not", "again", "before", "Un- often means not."),
   q("Which is a compound sentence?", "I studied, and I passed.", "After I studied.", "Studying hard.", "Two independent clauses are joined by and."),
   q("Which word is an adverb?", "carefully", "careful", "care", "Carefully describes how an action happens.")),
  listOf(
   q("Which sentence is in passive voice?", "The cake was baked by Sara.", "Sara baked the cake.", "Sara is baking.", "The cake receives the action."),
   q("Which is an example of personification?", "The wind whispered.", "The wind was strong.", "It was windy.", "Whispering gives the wind a human action."),
   q("Which is a dependent clause?", "because the bus was late", "The bus was late.", "We waited.", "Because introduces a dependent clause."),
   q("Which word is an abstract noun?", "freedom", "window", "pencil", "Freedom is an idea.")),
  listOf(
   q("Which sentence has a conditional clause?", "If you practice, you improve.", "You practice daily.", "Practice is useful.", "If introduces a condition."),
   q("What is the writer's central claim called?", "thesis", "caption", "index", "A thesis states a central claim."),
   q("Which is a credible research source?", "a peer-reviewed study", "an anonymous rumor", "an unverified post", "Peer review provides a layer of scrutiny."),
   q("Which word is closest to concise?", "brief", "lengthy", "unclear", "Concise means brief and clear.")),
  listOf(
   q("Which is an example of irony?", "A fire station catches fire.", "Rain falls from clouds.", "A bird has wings.", "The outcome contrasts with expectations."),
   q("What is the purpose of a counterargument?", "address an opposing view", "repeat a title", "avoid evidence", "A counterargument engages an opposing position."),
   q("Which phrase uses alliteration?", "wild winds whistle", "a quiet room", "the blue sky", "Initial w sounds repeat."),
   q("Which sentence is objective?", "Water freezes near 0°C at sea level.", "Winter is the best season.", "Snow is beautiful.", "An objective statement is testable.")),
  listOf(
   q("Which revision improves concision?", "The results were clear.", "The results were very clearly clear.", "It was the case that results were clear.", "Concise writing removes unnecessary words."),
   q("Which sentence demonstrates parallelism?", "She likes reading, writing, and painting.", "She likes reading, to write, and paint.", "She likes read, writing, and painting.", "Parallel items share grammatical form."),
   q("What is a logical fallacy?", "an error in reasoning", "a verified source", "a quotation mark", "A fallacy is flawed reasoning."),
   q("Which is a defensible thesis?", "Schools should provide libraries because they support reading.", "Libraries.", "Reading is nice.", "A thesis makes a claim with a reason."))
 )
 private val science = listOf(
  listOf(
   q("What do we use to smell a flower?", "nose", "ear", "hand", "The nose detects smells."),
   q("What helps a seed grow?", "water", "plastic", "paint", "Seeds need moisture to germinate."),
   q("Which animal has feathers?", "hen", "goat", "fish", "Birds have feathers."),
   q("Which object gives light?", "torch", "stone", "spoon", "A torch produces light.")),
  listOf(
   q("Which part of a plant absorbs water?", "roots", "flower", "fruit", "Roots take up water."),
   q("Which material is transparent?", "clear glass", "brick", "wood", "Clear glass lets light through."),
   q("Which sense helps you hear music?", "hearing", "taste", "touch", "Ears detect sound."),
   q("Which action saves water?", "turning off a tap", "leaving taps open", "washing an empty road", "Closing taps prevents waste.")),
  listOf(
   q("Which organ pumps blood?", "heart", "stomach", "liver", "The heart pumps blood."),
   q("Which state of matter has a fixed shape?", "solid", "gas", "liquid", "Solids retain shape."),
   q("What happens to ice in warmth?", "it melts", "it grows", "it disappears instantly", "Melting changes ice to water."),
   q("What do bees often carry between flowers?", "pollen", "sand", "stones", "Bees can transfer pollen.")),
  listOf(
   q("What causes day and night?", "Earth's rotation", "the Moon's phases", "rainfall", "Earth rotates on its axis."),
   q("Which instrument measures temperature?", "thermometer", "ruler", "compass", "Thermometers measure temperature."),
   q("Which material conducts electricity well?", "copper", "rubber", "dry wood", "Copper is a good conductor."),
   q("Which process forms clouds?", "condensation", "melting", "freezing soil", "Water vapor condenses into droplets.")),
  listOf(
   q("Which force pulls objects toward Earth?", "gravity", "friction", "magnetism only", "Gravity attracts masses."),
   q("Which plant part makes most food?", "leaf", "root", "seed coat", "Leaves perform photosynthesis."),
   q("Which is a food chain producer?", "grass", "rabbit", "fox", "Grass makes its own food."),
   q("Which energy source is renewable?", "wind", "coal", "diesel", "Wind is naturally replenished.")),
  listOf(
   q("What is evaporation?", "liquid becoming gas", "gas becoming solid", "solid becoming liquid", "Evaporation changes liquid to gas."),
   q("Which structure controls many cell activities?", "nucleus", "cell wall", "cytoplasm alone", "The nucleus contains genetic instructions."),
   q("What is density?", "mass per unit volume", "volume per second", "distance per time", "Density equals mass divided by volume."),
   q("Which is a simple machine?", "lever", "battery", "bulb", "A lever changes applied force.")),
  listOf(
   q("Which particle has a negative charge?", "electron", "proton", "neutron", "Electrons carry negative charge."),
   q("Which gas is released in photosynthesis?", "oxygen", "nitrogen", "methane", "Photosynthesis releases oxygen."),
   q("Which heat transfer occurs through contact?", "conduction", "radiation only", "reflection", "Conduction transfers energy through contact."),
   q("Which planet has the largest mass?", "Jupiter", "Mars", "Mercury", "Jupiter is the most massive planet.")),
  listOf(
   q("Which organelle performs most aerobic respiration?", "mitochondrion", "ribosome", "vacuole", "Mitochondria release energy from food."),
   q("Which is the SI unit of force?", "newton", "watt", "joule", "Force is measured in newtons."),
   q("Which acid is found in the stomach?", "hydrochloric acid", "acetic acid", "citric acid", "Stomach acid contains hydrochloric acid."),
   q("What is a balanced ecosystem?", "interacting organisms and environment", "only plants", "only animals", "Ecosystems include biotic and abiotic parts.")),
  listOf(
   q("What is refraction?", "bending of light between media", "reflection from a mirror", "light being created", "Light changes direction as speed changes."),
   q("What is an isotope?", "same element with different neutron number", "different elements with equal mass", "an electrically charged molecule", "Isotopes differ in neutron number."),
   q("What is the role of red blood cells?", "carry oxygen", "digest proteins", "produce bile", "Hemoglobin transports oxygen."),
   q("What is the unit of electrical resistance?", "ohm", "volt", "ampere", "Resistance is measured in ohms.")),
  listOf(
   q("Which process copies DNA before cell division?", "replication", "translation", "diffusion", "DNA replication produces a copy."),
   q("What does a catalyst do?", "speeds a reaction without being consumed", "always raises temperature", "creates new atoms", "Catalysts lower activation energy."),
   q("What does Newton's second law relate?", "force, mass, acceleration", "pressure and volume only", "voltage and resistance only", "Net force equals mass times acceleration."),
   q("What does biodiversity describe?", "variety of living organisms", "only the number of rocks", "one type of animal", "Biodiversity concerns variation in life."))
 )
 private val urdu = listOf(
  listOf(
   q("لفظ 'آم' کس چیز کا نام ہے؟", "پھل", "جانور", "رنگ", "آم ایک پھل ہے۔"),
   q("لفظ 'پانی' کس کام آتا ہے؟", "پینے", "لکھنے", "اڑنے", "پانی پیا جاتا ہے۔"),
   q("حرف 'ب' سے کون سا لفظ بنتا ہے؟", "بلی", "انار", "آم", "بلی ب سے شروع ہوتی ہے۔"),
   q("کون سا لفظ رنگ کا نام ہے؟", "نیلا", "دوڑنا", "قلم", "نیلا ایک رنگ ہے۔")),
  listOf(
   q("لفظ 'لڑکی' کی جمع کیا ہے؟", "لڑکیاں", "لڑکا", "لڑکیوں کا", "لڑکیاں جمع ہے۔"),
   q("لفظ 'دن' کا الٹ کیا ہے؟", "رات", "روشنی", "سورج", "رات دن کا متضاد ہے۔"),
   q("لفظ 'تیز' کا متضاد کیا ہے؟", "آہستہ", "جلدی", "فوراً", "آہستہ تیز کے مقابل ہے۔"),
   q("جملے کے آخر میں سوال کے لیے کیا لگتا ہے؟", "؟", "۔", "،", "سوالیہ نشان لگتا ہے۔")),
  listOf(
   q("کون سا لفظ اسم ہے؟", "میز", "پڑھنا", "جلدی", "میز ایک چیز کا نام ہے۔"),
   q("کون سا لفظ فعل ہے؟", "کھیلنا", "سرخ", "کتاب", "کھیلنا کام بتاتا ہے۔"),
   q("لفظ 'خوش' کا مترادف کیا ہے؟", "مسرور", "اداس", "غصہ", "مسرور کا مطلب خوش ہے۔"),
   q("کون سا جملہ سوالیہ ہے؟", "آپ کب آئیں گے؟", "میں آیا۔", "یہ میرا گھر ہے۔", "یہ جملہ سوال کرتا ہے۔")),
  listOf(
   q("لفظ 'کتاب' کی جمع کیا ہے؟", "کتابیں", "کتابا", "کتابی", "کتابیں جمع ہے۔"),
   q("لفظ 'اندھیرا' کا متضاد کیا ہے؟", "روشنی", "رات", "سایہ", "روشنی اندھیرے کا متضاد ہے۔"),
   q("کون سا لفظ صفت ہے؟", "ذہین", "لکھنا", "قلم", "ذہین خوبی بتاتا ہے۔"),
   q("کون سا جملہ امریہ ہے؟", "سبق یاد کرو۔", "وہ پڑھتا ہے۔", "تم کہاں ہو؟", "یہ جملہ حکم دیتا ہے۔")),
  listOf(
   q("لفظ 'محنت' کا مترادف کیا ہے؟", "کوشش", "سستی", "آرام", "محنت میں کوشش شامل ہے۔"),
   q("کون سا لفظ ضمیر ہے؟", "ہم", "کتاب", "خوبصورت", "ہم ضمیر ہے۔"),
   q("لفظ 'بہادر' کا متضاد کیا ہے؟", "بزدل", "دلیر", "نڈر", "بزدل بہادر کا متضاد ہے۔"),
   q("کون سا جملہ ماضی میں ہے؟", "علی آیا تھا۔", "علی آتا ہے۔", "علی آئے گا۔", "آیا تھا ماضی ظاہر کرتا ہے۔")),
  listOf(
   q("محاورہ 'آنکھوں کا تارا' کیا ظاہر کرتا ہے؟", "بہت عزیز", "بہت دور", "بہت غصہ", "یہ محاورہ بہت پیارے شخص کے لیے ہے۔"),
   q("لفظ 'امن' کا متضاد کیا ہے؟", "جنگ", "سکون", "آرام", "جنگ امن کے مقابل ہے۔"),
   q("کون سا جملہ مستقبل میں ہے؟", "وہ کل آئے گا۔", "وہ کل آیا تھا۔", "وہ ابھی آتا ہے۔", "آئے گا مستقبل ظاہر کرتا ہے۔"),
   q("خلاصہ کس کو کہتے ہیں؟", "مختصر بیان", "لمبی کہانی", "عنوان", "خلاصہ اصل بات مختصر کرتا ہے۔")),
  listOf(
   q("تشبیہ کی مثال کون سی ہے؟", "وہ پھول کی طرح نرم ہے۔", "وہ پھول ہے۔", "پھول کھلا۔", "کی طرح تشبیہ ظاہر کرتا ہے۔"),
   q("لفظ 'علم' کا متضاد کیا ہے؟", "جہالت", "کتاب", "سبق", "جہالت علم کے مقابل ہے۔"),
   q("شعر کی ایک سطر کو کیا کہتے ہیں؟", "مصرع", "عنوان", "کہاوت", "مصرع شعر کی ایک سطر ہے۔"),
   q("کون سا لفظ مصدر ہے؟", "دوڑنا", "دوڑا", "دوڑتا", "دوڑنا مصدر ہے۔")),
  listOf(
   q("فاعل کون ہوتا ہے؟", "کام کرنے والا", "جس پر کام ہو", "کام کا نتیجہ", "فاعل فعل انجام دیتا ہے۔"),
   q("مفعول کیا ہوتا ہے؟", "جس پر فعل کا اثر ہو", "کام کرنے والا", "فعل کا زمانہ", "مفعول فعل سے متاثر ہوتا ہے۔"),
   q("استعارہ کی مثال کون سی ہے؟", "وہ میدان کا شیر ہے۔", "وہ شیر کی طرح ہے۔", "شیر جنگل میں ہے۔", "استعارہ براہ راست مجازی نسبت ہے۔"),
   q("لفظ 'سخاوت' کا متضاد کیا ہے؟", "بخل", "فیاضی", "مہربانی", "بخل سخاوت کے مقابل ہے۔")),
  listOf(
   q("کنایہ کیا ہے؟", "بالواسطہ معنی", "لفظی ترجمہ", "سوالیہ نشان", "کنایہ بالواسطہ مفہوم دیتا ہے۔"),
   q("مبالغہ کیا ہے؟", "بات کو بڑھا کر کہنا", "بات مختصر کرنا", "سوال پوچھنا", "مبالغہ میں بات بڑھائی جاتی ہے۔"),
   q("ردیف کہاں آتی ہے؟", "قافیے کے بعد", "عنوان سے پہلے", "ہر لفظ سے پہلے", "ردیف قافیے کے بعد دہرائی جاتی ہے۔"),
   q("تضاد کی مثال کون سی ہے؟", "دن اور رات", "کتاب اور قلم", "پانی اور دریا", "دن اور رات متضاد ہیں۔")),
  listOf(
   q("سیاق و سباق کا مطلب کیا ہے؟", "عبارت کا اردگرد کا مفہوم", "صرف عنوان", "صرف قافیہ", "سیاق و سباق مفہوم واضح کرتا ہے۔"),
   q("استدلال کس پر مبنی ہوتا ہے؟", "دلائل", "اندازے", "بے ربط الفاظ", "استدلال دلائل سے نتیجہ نکالتا ہے۔"),
   q("اسلوب کیا ہے؟", "اظہار کا مخصوص انداز", "حروف کی تعداد", "صفحے کا نمبر", "اسلوب لکھنے یا کہنے کا انداز ہے۔"),
   q("تنقید کا مقصد کیا ہے؟", "خوبیوں اور خامیوں کا جائزہ", "صرف تعریف", "صرف نقل", "تنقید متوازن جائزہ لیتی ہے۔"))
 )
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  listOf("English", "Urdu", "Science").map { subject ->
   val questions = when (subject) {
    "English" -> english[index]
    "Urdu" -> urdu[index]
    else -> science[index]
   }
   Lesson("applied-${grade.replace(" ", "-")}-$subject", grade, subject,
    if (subject == "Urdu") "عملی مشق" else "Applied practice",
    if (subject == "Urdu") "ہر سوال پڑھیں اور جواب کی وجہ سمجھیں۔" else "Apply what you have learned and read each explanation.",
    questions)
  }
 }
}
