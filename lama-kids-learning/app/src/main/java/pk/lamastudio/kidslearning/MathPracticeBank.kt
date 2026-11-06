package pk.lamastudio.kidslearning

/** Deterministic, offline grade-scaled mathematics practice. */
object MathPracticeBank {
    private val grades = listOf("Nursery", "KG") + (1..8).map { "Class " + it }
    private val titles = listOf("Number addition", "Number subtraction", "Number multiplication", "Number comparison")
    private fun difficulty(grade: String): Int = when (grade) {
        "Nursery" -> 2
        "KG" -> 4
        "Class 1" -> 9
        "Class 2" -> 18
        "Class 3" -> 35
        "Class 4" -> 60
        "Class 5" -> 90
        "Class 6" -> 130
        "Class 7" -> 180
        else -> 250
    }

    fun questions(grade: String, topic: Int): List<Question> {
        require(grade in grades && topic in 0..3)
        val scale = difficulty(grade)
        return (1..10).map { index ->
            val first = 1 + (scale * index) / 10
            val second = 1 + (index * 3) % maxOf(2, scale)
            val result = when (topic) {
                0 -> first + second
                1 -> maxOf(first, second) - minOf(first, second)
                2 -> first * (1 + index % 5)
                else -> if (first > second) 1 else if (first < second) -1 else 0
            }
            if (topic == 3) {
                val answer = if (result > 0) ">" else if (result < 0) "<" else "="
                val options = listOf(">", "<", "=")
                Question("$first  ?  $second", options, options.indexOf(answer),
                    "$first $answer $second")
            } else {
                val symbol = when (topic) { 0 -> "+"; 1 -> "−"; else -> "×" }
                val left = if (topic == 1) maxOf(first, second) else first
                val right = if (topic == 1) minOf(first, second) else if (topic == 2) 1 + index % 5 else second
                val choices = listOf(result, result + 1, result + 2)
                val rotated = choices.drop(index % 3) + choices.take(index % 3)
                Question("$left $symbol $right = ?", rotated.map { it.toString() }, rotated.indexOf(result),
                    "The correct answer is $result.")
            }
        }
    }

    val lessons: List<Lesson> = grades.flatMap { grade ->
        titles.mapIndexed { topic, title ->
            Lesson("math-bank-${grade.replace(" ", "-")}-$topic", grade, "Mathematics", title,
                "Solve ten number challenges to practice your skills.", questions(grade, topic))
        }
    }
}
