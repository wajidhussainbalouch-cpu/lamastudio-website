package pk.lamastudio.kidslearning

/**
 * Class-specific offline vocabulary and factual recall exercises.
 * Distinct prompts are authored per class; educator review is required.
 */
object ClassSpecificBank {
 private fun make(prompt: String, correct: String, a: String, b: String, explanation: String) =
  Question(prompt, listOf(correct, a, b), 0, explanation)

 // Each grade has six distinct English words and associated definitions.
 private val english: List<List<Pair<String,String>>> = listOf(
  listOf("apple" to "a fruit", "chair" to "a seat", "sun" to "a star", "cat" to "an animal", "red" to "a color", "run" to "an action"),
  listOf("garden" to "a place for plants", "rain" to "water from clouds", "pencil" to "a writing tool", "bird" to "an animal with feathers", "blue" to "a color", "jump" to "an action"),
  listOf("teacher" to "a person who teaches", "library" to "a place for books", "river" to "flowing water", "gentle" to "kind and soft", "quickly" to "at a fast speed", "happy" to "feeling joy"),
  listOf("honest" to "truthful", "brave" to "showing courage", "journey" to "a trip", "village" to "a small settlement", "collect" to "bring together", "silent" to "without sound"),
  listOf("observe" to "watch carefully", "predict" to "say what may happen", "compare" to "find similarities and differences", "describe" to "tell what something is like", "protect" to "keep safe", "explain" to "make clear"),
  listOf("ancient" to "very old", "modern" to "of recent times", "fragile" to "easily broken", "generous" to "willing to give", "cautious" to "careful about danger", "enormous" to "very large"),
  listOf("consequence" to "a result", "evidence" to "information supporting a claim", "summarize" to "state main points briefly", "persuade" to "convince", "reliable" to "dependable", "interpret" to "explain meaning"),
  listOf("hypothesis" to "a testable proposed explanation", "analyze" to "examine in detail", "evaluate" to "judge using evidence", "contrast" to "show differences", "infer" to "reach a conclusion from clues", "justify" to "give reasons"),
  listOf("metaphor" to "a direct figurative comparison", "irony" to "a contrast between expectation and reality", "narrator" to "the voice telling a story", "theme" to "a central idea", "context" to "surrounding information", "bias" to "an unfair preference"),
  listOf("synthesize" to "combine ideas into a whole", "coherent" to "logically connected", "ambiguous" to "having more than one meaning", "credible" to "believable", "objective" to "based on facts rather than feelings", "paraphrase" to "express in different words")
 )
 private val science: List<List<Pair<String,String>>> = listOf(
  listOf("eyes" to "seeing", "ears" to "hearing", "nose" to "smelling", "tongue" to "tasting", "skin" to "touching", "roots" to "absorbing water"),
  listOf("sun" to "daylight", "clouds" to "rain formation", "leaves" to "making food for a plant", "wings" to "helping birds fly", "teeth" to "chewing", "lungs" to "breathing"),
  listOf("heart" to "pumping blood", "stomach" to "digesting food", "brain" to "controlling the body", "stem" to "supporting a plant", "magnet" to "attracting iron", "thermometer" to "measuring temperature"),
  listOf("evaporation" to "liquid changing to gas", "condensation" to "gas changing to liquid", "freezing" to "liquid changing to solid", "melting" to "solid changing to liquid", "rotation" to "turning around an axis", "orbit" to "path around another object"),
  listOf("producer" to "making its own food", "consumer" to "eating other organisms", "decomposer" to "breaking down dead material", "habitat" to "an organism's home", "adaptation" to "a feature aiding survival", "pollination" to "moving pollen between flowers"),
  listOf("friction" to "resisting sliding motion", "gravity" to "attraction between masses", "mass" to "amount of matter", "volume" to "space occupied", "density" to "mass per unit volume", "energy" to "capacity to do work"),
  listOf("atom" to "basic unit of an element", "molecule" to "bonded group of atoms", "element" to "substance of one atom type", "compound" to "chemically joined elements", "solution" to "homogeneous mixture", "solvent" to "substance that dissolves a solute"),
  listOf("photosynthesis" to "using light to make sugar", "respiration" to "releasing energy from food", "diffusion" to "net movement down a concentration gradient", "osmosis" to "movement of water through a selectively permeable membrane", "ecosystem" to "organisms and surroundings", "biodiversity" to "variety of living things"),
  listOf("conduction" to "heat transfer through contact", "convection" to "heat transfer by fluid movement", "radiation" to "energy transfer by waves", "refraction" to "bending of light between media", "reflection" to "light bouncing from a surface", "resistance" to "opposition to electric current"),
  listOf("chromosome" to "structure carrying DNA", "gene" to "hereditary information unit", "mutation" to "change in genetic sequence", "enzyme" to "biological catalyst", "catalyst" to "substance speeding a reaction without being used up", "inertia" to "resistance to change in motion")
 )
 private val urdu: List<List<Pair<String,String>>> = listOf(
  listOf("سیب" to "پھل", "قلم" to "لکھنے کی چیز", "کرسی" to "بیٹھنے کی چیز", "بلی" to "جانور", "سرخ" to "رنگ", "پڑھنا" to "کام"),
  listOf("بارش" to "بادل سے پانی", "باغ" to "پودوں کی جگہ", "پرندہ" to "پروں والا جانور", "استاد" to "پڑھانے والا", "دریا" to "بہتا پانی", "دوست" to "ساتھی"),
  listOf("سچ" to "درست بات", "جھوٹ" to "غلط بات", "خوش" to "مسرور", "اداس" to "غمگین", "تیز" to "رفتار والا", "خاموش" to "بغیر آواز"),
  listOf("ہمت" to "حوصلہ", "محنت" to "کوشش", "امید" to "آس", "خوشبو" to "اچھی مہک", "روشنی" to "اجالا", "اندھیرا" to "تاریکی"),
  listOf("مترادف" to "ہم معنی لفظ", "متضاد" to "الٹ معنی لفظ", "اسم" to "نام بتانے والا لفظ", "فعل" to "کام بتانے والا لفظ", "صفت" to "خوبی بتانے والا لفظ", "جملہ" to "مکمل بات"),
  listOf("واحد" to "ایک کے لیے لفظ", "جمع" to "ایک سے زیادہ کے لیے لفظ", "مذکر" to "نر کے لیے لفظ", "مونث" to "مادہ کے لیے لفظ", "سوالیہ" to "سوال پوچھنے والا", "امریہ" to "حکم دینے والا"),
  listOf("محاورہ" to "خاص مجازی معنی رکھنے والا فقرہ", "کہاوت" to "تجربے پر مبنی مشہور بات", "عنوان" to "تحریر کا نام", "خلاصہ" to "مختصر بیان", "مضمون" to "کسی موضوع پر تحریر", "کردار" to "کہانی کا فرد"),
  listOf("تشبیہ" to "کی طرح موازنہ", "استعارہ" to "براہ راست مجازی نسبت", "قافیہ" to "ہم آواز اختتامی الفاظ", "ردیف" to "قافیے کے بعد دہرایا جانے والا لفظ", "شعر" to "دو مصرعوں کی اکائی", "مصرع" to "شعر کی ایک سطر"),
  listOf("فاعل" to "کام کرنے والا", "مفعول" to "جس پر کام ہو", "ماضی" to "گزرا ہوا زمانہ", "حال" to "موجودہ زمانہ", "مستقبل" to "آنے والا زمانہ", "مصدر" to "فعل کی بنیادی شکل"),
  listOf("مرکب" to "ملے ہوئے الفاظ", "تلمیح" to "مشہور واقعے کی طرف اشارہ", "کنایہ" to "بالواسطہ معنی", "مبالغہ" to "بات کو بڑھا کر بیان کرنا", "تضاد" to "مخالف خیالات کا استعمال", "علامت" to "کسی خیال کی نمائندگی کرنے والی چیز")
 )
 private fun questions(entries: List<Pair<String,String>>, subject: String): List<Question> =
  entries.mapIndexed { i, entry ->
   val other1 = entries[(i + 1) % entries.size].second
   val other2 = entries[(i + 2) % entries.size].second
   if (subject == "Urdu")
    make("لفظ '${entry.first}' کا درست مطلب کیا ہے؟", entry.second, other1, other2,
     "'${entry.first}' کا مطلب '${entry.second}' ہے۔")
   else
    make("What does '${entry.first}' mean?", entry.second, other1, other2,
     "'${entry.first}' means ${entry.second}.")
  }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  listOf("English", "Urdu", "Science").flatMap { subject ->
   val entries = when (subject) { "English" -> english[index]; "Urdu" -> urdu[index]; else -> science[index] }
   val all = questions(entries, subject)
   (0..1).map { topic ->
    Lesson("class-specific-${grade.replace(" ", "-")}-$subject-$topic", grade, subject,
     if (subject == "Urdu") "نئے الفاظ: حصہ ${topic + 1}" else if (subject == "Science") "Science concepts ${topic + 1}" else "Vocabulary builder ${topic + 1}",
     if (subject == "Urdu") "لفظ پڑھیں اور درست معنی منتخب کریں۔" else "Read each term and choose its correct meaning.",
     all.subList(topic * 3, (topic + 1) * 3))
   }
  }
 }
}
