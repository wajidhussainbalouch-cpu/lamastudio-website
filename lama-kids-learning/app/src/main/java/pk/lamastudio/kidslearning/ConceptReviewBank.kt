package pk.lamastudio.kidslearning

/** Additional class-level concept checks. Each question includes a short explanation. */
object ConceptReviewBank {
 private val english: List<List<Pair<String,String>>> = listOf(
  listOf("Noun" to "a naming word", "Verb" to "an action word", "Vowel" to "a letter such as A or E", "Rhyme" to "words with matching ending sounds", "Full stop" to "mark ending a statement"),
  listOf("Singular" to "refers to one", "Plural" to "refers to more than one", "Question mark" to "punctuation ending a question", "Capital letter" to "letter used to begin a sentence", "Alphabet" to "ordered set of letters"),
  listOf("Adjective" to "word describing a noun", "Pronoun" to "word replacing a noun", "Sentence" to "group of words expressing a complete thought", "Antonym" to "word with opposite meaning", "Synonym" to "word with similar meaning"),
  listOf("Preposition" to "word showing position or relationship", "Conjunction" to "word connecting words or clauses", "Adverb" to "word modifying a verb or adjective", "Paragraph" to "group of sentences about one idea", "Dialogue" to "conversation between speakers"),
  listOf("Prefix" to "letters added to the beginning of a word", "Suffix" to "letters added to the end of a word", "Homophone" to "word sounding like another but with different meaning", "Simile" to "comparison using like or as", "Subject" to "who or what a sentence is about"),
  listOf("Tense" to "verb form indicating time", "Quotation marks" to "punctuation around direct speech", "Compound sentence" to "two independent clauses joined together", "Predicate" to "part of a sentence telling about the subject", "Personification" to "giving human qualities to nonhuman things"),
  listOf("Main clause" to "clause that can stand as a sentence", "Dependent clause" to "clause that cannot stand alone", "Active voice" to "subject performs the action", "Passive voice" to "subject receives the action", "Theme" to "central idea of a text"),
  listOf("Inference" to "conclusion based on evidence", "Thesis statement" to "sentence expressing an argument's main claim", "Supporting detail" to "fact or example explaining a main idea", "Tone" to "writer's attitude toward a subject", "Audience" to "people a text is intended for"),
  listOf("Counterargument" to "reason opposing a claim", "Cohesion" to "connections linking parts of a text", "Figurative language" to "words used beyond literal meanings", "Irony" to "contrast between expectation and reality", "Citation" to "acknowledgment of an information source"),
  listOf("Rhetorical question" to "question asked for effect rather than an answer", "Parallelism" to "repetition of similar grammatical structures", "Connotation" to "feelings associated with a word", "Denotation" to "literal dictionary meaning", "Ambiguity" to "possibility of multiple interpretations")
 )
 private val urdu: List<List<Pair<String,String>>> = listOf(
  listOf("حرف" to "آواز کی تحریری علامت", "لفظ" to "حروف سے بنی معنی خیز اکائی", "نقطہ" to "حرف پر یا نیچے لگنے والا نشان", "سوال" to "کسی بات کی معلومات طلب کرنا", "جواب" to "سوال کے ردعمل میں دی گئی بات"),
  listOf("واحد" to "ایک فرد یا چیز کے لیے لفظ", "جمع" to "ایک سے زیادہ کے لیے لفظ", "اسم" to "نام بتانے والا لفظ", "فعل" to "کام یا حالت بتانے والا لفظ", "صفت" to "خوبی یا حالت بتانے والا لفظ"),
  listOf("مترادف" to "ملتے جلتے معنی والے الفاظ", "متضاد" to "الٹ معنی والے الفاظ", "جملہ" to "مکمل مفہوم دینے والے الفاظ", "عنوان" to "تحریر کا نام", "مضمون" to "کسی موضوع پر لکھی گئی تحریر"),
  listOf("مذکر" to "مردانہ جنس ظاہر کرنے والا لفظ", "مونث" to "زنانہ جنس ظاہر کرنے والا لفظ", "سوالیہ جملہ" to "سوال پوچھنے والا جملہ", "خبریہ جملہ" to "خبر دینے والا جملہ", "امریہ جملہ" to "حکم یا درخواست کا جملہ"),
  listOf("ضمیر" to "اسم کی جگہ آنے والا لفظ", "حرفِ جار" to "اسم کا دوسرے لفظ سے تعلق بتانے والا حرف", "زمانہ ماضی" to "گزرا ہوا وقت", "زمانہ حال" to "موجودہ وقت", "زمانہ مستقبل" to "آنے والا وقت"),
  listOf("محاورہ" to "خاص مجازی معنی رکھنے والی ترکیب", "کہاوت" to "تجربے سے اخذ کردہ مشہور قول", "خلاصہ" to "اصل بات کا مختصر بیان", "مرکزی خیال" to "تحریر کا بنیادی پیغام", "کردار" to "کہانی میں حصہ لینے والا فرد"),
  listOf("تشبیہ" to "کسی چیز کو دوسری سے مشابہ کہنا", "استعارہ" to "براہ راست مجازی مماثلت", "قافیہ" to "شعر کے آخر میں ہم آواز الفاظ", "ردیف" to "قافیے کے بعد دہرائے جانے والے الفاظ", "مصرع" to "شعر کی ایک سطر"),
  listOf("فاعل" to "کام انجام دینے والا", "مفعول" to "جس پر فعل کا اثر ہو", "مصدر" to "فعل کی بنیادی صورت", "مرکب" to "دو یا زیادہ الفاظ کا مجموعہ", "تلمیح" to "مشہور واقعے کی طرف ادبی اشارہ"),
  listOf("کنایہ" to "بالواسطہ معنی میں استعمال", "مبالغہ" to "اثر کے لیے بات بڑھا کر کہنا", "تضاد" to "مخالف خیالات یا الفاظ کا استعمال", "علامت" to "کسی خیال کی نمائندگی کرنے والی چیز", "نثر" to "غیر منظوم تحریر"),
  listOf("تنقید" to "ادبی خوبیوں اور خامیوں کا جائزہ", "اسلوب" to "لکھنے یا کہنے کا مخصوص انداز", "بیانیہ" to "واقعات کو بیان کرنے کا طریقہ", "سیاق و سباق" to "کسی عبارت کے اردگرد کا مفہوم", "استدلال" to "دلائل سے نتیجہ اخذ کرنا")
 )
 private val science: List<List<Pair<String,String>>> = listOf(
  listOf("Seed" to "grows into a new plant", "Petal" to "part of a flower", "Nest" to "home built by many birds", "Puppy" to "young dog", "Ice" to "frozen water"),
  listOf("Herbivore" to "animal that eats plants", "Carnivore" to "animal that eats animals", "Omnivore" to "animal that eats plants and animals", "Pond" to "small body of still water", "Shadow" to "dark area where light is blocked"),
  listOf("Skeleton" to "framework of bones", "Muscle" to "tissue that helps movement", "Germination" to "beginning of seed growth", "Habitat" to "natural home of an organism", "Recycling" to "turning waste into usable material"),
  listOf("Water cycle" to "movement of water through Earth's systems", "Precipitation" to "water falling from clouds", "Erosion" to "movement of soil or rock by wind or water", "Fossil" to "preserved trace of ancient life", "Food chain" to "sequence showing who eats whom"),
  listOf("Vertebrate" to "animal with a backbone", "Invertebrate" to "animal without a backbone", "Camouflage" to "blending into surroundings", "Pollinator" to "organism that transfers pollen", "Conductor" to "material allowing heat or electricity to pass"),
  listOf("Solute" to "substance dissolved in a solution", "Solvent" to "substance that dissolves a solute", "Insulator" to "material resisting heat or electricity flow", "Mixture" to "substances combined without chemical bonding", "Lever" to "simple machine rotating about a pivot"),
  listOf("Chlorophyll" to "green pigment absorbing light", "Stomata" to "tiny pores for gas exchange in leaves", "Tissue" to "group of similar cells working together", "Organ" to "structure made of tissues with a function", "Cell membrane" to "boundary controlling movement into a cell"),
  listOf("Acceleration" to "rate of change of velocity", "Velocity" to "speed with direction", "Pressure" to "force per unit area", "Buoyancy" to "upward force exerted by a fluid", "Neutralization" to "reaction of acid and base"),
  listOf("Isotope" to "atoms of an element with different neutron counts", "Ion" to "atom or group carrying electric charge", "Refraction" to "change in light direction between media", "Frequency" to "number of cycles per second", "Wavelength" to "distance between matching wave points"),
  listOf("Homeostasis" to "maintenance of stable internal conditions", "Natural selection" to "process favoring inherited survival traits", "Electrolysis" to "using electricity to drive chemical change", "Momentum" to "mass multiplied by velocity", "Conservation of energy" to "principle that energy is not created or destroyed")
 )
 private fun question(entries: List<Pair<String,String>>, index: Int, subject: String): Question {
  val (term, meaning) = entries[index]
  val wrongA = entries[(index + 1) % entries.size].second
  val wrongB = entries[(index + 2) % entries.size].second
  val choices = listOf(meaning, wrongA, wrongB)
  val shift = index % choices.size
  val rotated = choices.drop(shift) + choices.take(shift)
  val prompt = if (subject == "Urdu") "'$term' کا درست مطلب کیا ہے؟" else "What does '$term' mean?"
  val why = if (subject == "Urdu") "'$term' کا مطلب '$meaning' ہے۔" else "'$term' means $meaning."
  return Question(prompt, rotated, rotated.indexOf(meaning), why)
 }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { gradeIndex, grade ->
  listOf("English", "Urdu", "Science").map { subject ->
   val entries = when (subject) { "English" -> english[gradeIndex]; "Urdu" -> urdu[gradeIndex]; else -> science[gradeIndex] }
   Lesson("concept-review-${grade.replace(" ", "-")}-$subject", grade, subject,
    if (subject == "Urdu") "تصورات کی دہرائی" else "Concept review",
    if (subject == "Urdu") "ہر لفظ کا مطلب سمجھیں اور درست جواب منتخب کریں۔" else "Choose the correct meaning and read the explanation.",
    entries.indices.map { question(entries, it, subject) })
  }
 }
}
