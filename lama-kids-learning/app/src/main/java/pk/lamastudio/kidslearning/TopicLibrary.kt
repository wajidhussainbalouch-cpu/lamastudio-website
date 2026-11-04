package pk.lamastudio.kidslearning

/**
 * Supplemental topic activities, stored entirely offline.
 * Questions are intentionally short; editorial review is required before release.
 */
object TopicLibrary {
    private fun q(prompt: String, a: String, b: String, c: String, correct: Int, why: String) =
        Question(prompt, listOf(a, b, c), correct, why)

    private val english = listOf(
        Triple("Letter sounds", "Recognize the beginning sounds in common words.", listOf(
            q("Which word starts with the sound /m/?", "Moon", "Sun", "Tree", 0, "Moon starts with /m/."),
            q("Which word starts with the sound /s/?", "Ball", "Sun", "Cat", 1, "Sun starts with /s/."),
            q("Which word starts with the sound /b/?", "Fish", "Apple", "Book", 2, "Book starts with /b/."))),
        Triple("Reading practice", "Read short sentences and notice their meaning.", listOf(
            q("Which sentence is a question?", "The cat sleeps.", "Where is my book?", "I like rain.", 1, "A question asks for an answer."),
            q("Which word means happy?", "Glad", "Angry", "Tired", 0, "Glad and happy have similar meanings."),
            q("Which sentence is in the past?", "I walk.", "I will walk.", "I walked.", 2, "Walked describes a past action."))),
        Triple("Word meanings", "Learn common vocabulary through examples.", listOf(
            q("Which is the opposite of tall?", "High", "Short", "Long", 1, "Short is the opposite of tall."),
            q("Which word means very large?", "Tiny", "Quiet", "Huge", 2, "Huge means very large."),
            q("Which is a describing word?", "Bright", "Run", "School", 0, "Bright describes a noun.")))
    )
    private val urdu = listOf(
        Triple("الفاظ کی پہچان", "آسان الفاظ اور ان کے معنی سیکھیے۔", listOf(
            q("کتاب کس چیز کا نام ہے؟", "کھانے", "پڑھنے", "سونے", 1, "کتاب پڑھنے کے کام آتی ہے۔"),
            q("پانی کس کام آتا ہے؟", "پینے", "لکھنے", "اڑنے", 0, "پانی پینے کے لیے ضروری ہے۔"),
            q("درخت پر کیا اگتا ہے؟", "جوتا", "قلم", "پھل", 2, "بہت سے درختوں پر پھل اگتے ہیں۔"))),
        Triple("جملے بنانا", "مکمل جملے اور سوال پہچانیے۔", listOf(
            q("کون سا مکمل جملہ ہے؟", "اچھا اور", "علی کتاب پڑھتا ہے۔", "کے ساتھ", 1, "مکمل جملہ پوری بات بتاتا ہے۔"),
            q("سوالیہ جملہ کون سا ہے؟", "تم کہاں جا رہے ہو؟", "آج اتوار ہے۔", "وہ پڑھتا ہے۔", 0, "یہ جملہ سوال پوچھتا ہے۔"),
            q("جملے کے آخر میں عام طور پر کیا آتا ہے؟", "الف", "واو", "ختمہ (۔)", 2, "خبریہ جملے کے آخر میں ختمہ آتا ہے۔"))),
        Triple("قواعد کی مشق", "اسم، فعل اور صفت کی ابتدائی مشق۔", listOf(
            q("کون سا لفظ فعل ہے؟", "دوڑنا", "میز", "کتاب", 0, "دوڑنا ایک کام ہے۔"),
            q("کون سا لفظ اسم ہے؟", "جلدی", "پرندہ", "سونا", 1, "پرندہ ایک جاندار کا نام ہے۔"),
            q("کون سا لفظ صفت ہے؟", "کھانا", "لکھنا", "خوبصورت", 2, "خوبصورت کسی چیز کی خوبی بتاتا ہے۔")))
    )
    private val science = listOf(
        Triple("Living things", "Explore plants, animals and their needs.", listOf(
            q("Which needs water to grow?", "Plant", "Stone", "Plastic cup", 0, "Plants need water to grow."),
            q("Which animal can fly?", "Cow", "Sparrow", "Goat", 1, "A sparrow is a bird that can fly."),
            q("What do green plants use for photosynthesis?", "Moonlight", "Plastic", "Sunlight", 2, "Plants use light energy from the Sun."))),
        Triple("Earth and weather", "Learn about weather and the world around us.", listOf(
            q("What measures temperature?", "Thermometer", "Ruler", "Clock", 0, "A thermometer measures temperature."),
            q("Which is a form of precipitation?", "Smoke", "Rain", "Dust", 1, "Rain is precipitation."),
            q("What causes day and night?", "Clouds", "The Moon's shape", "Earth's rotation", 2, "Earth rotates on its axis."))),
        Triple("Matter and energy", "Observe materials, light and forces.", listOf(
            q("Which is a liquid at room temperature?", "Water", "Stone", "Wood", 0, "Water is normally a liquid at room temperature."),
            q("Which is a source of light?", "Book", "Sun", "Chair", 1, "The Sun emits light."),
            q("What can change an object's motion?", "Color", "Smell", "Force", 2, "A force can change motion.")))
    )

    private fun mathQuestions(grade: String, topic: Int): List<Question> {
        val level = when (grade) {
            "Nursery", "KG" -> 1
            "Class 1", "Class 2" -> 2
            "Class 3", "Class 4" -> 4
            "Class 5", "Class 6" -> 7
            else -> 12
        }
        return (1..3).map { i ->
            val left = level * i + topic
            val right = level + i
            val answer = if (topic == 0) left + right else if (topic == 1) left - right else left * right
            val operator = if (topic == 0) "+" else if (topic == 1) "−" else "×"
            val alternatives = listOf(answer, answer + 1, answer + 2)
            val shift = i % 3
            val options = alternatives.drop(shift) + alternatives.take(shift)
            Question("$left $operator $right = ?", options.map { it.toString() }, options.indexOf(answer),
                "The correct result is $answer.")
        }
    }

    val lessons: List<Lesson> = CurriculumCatalog.grades.flatMap { grade ->
        CurriculumCatalog.subjects.flatMap { subject ->
            if (subject == "Mathematics") {
                listOf("Addition practice", "Subtraction practice", "Multiplication practice").mapIndexed { index, title ->
                    Lesson("topic-${grade.replace(" ", "-")}-math-$index", grade, subject, title,
                        "Practice solving number problems. Choose the correct answer.", mathQuestions(grade, index))
                }
            } else {
                val source = when (subject) {
                    "English" -> english
                    "Urdu" -> urdu
                    else -> science
                }
                source.mapIndexed { index, entry ->
                    Lesson("topic-${grade.replace(" ", "-")}-$subject-$index", grade, subject,
                        entry.first, entry.second, entry.third)
                }
            }
        }
    }
}
