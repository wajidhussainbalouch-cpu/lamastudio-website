package pk.lamastudio.kidslearning

import kotlin.random.Random

data class MathChallenge(val left: Int, val right: Int, val operation: Char) {
    val answer: Int get() = if (operation == '+') left + right else left - right
    fun question(): String = "$left $operation $right = ?"
}

object MathGames {
    fun generate(grade: String, random: Random = Random.Default): MathChallenge {
        val level = when (grade) {
            "Nursery", "KG" -> 5
            "Class 1", "Class 2" -> 10
            "Class 3", "Class 4" -> 30
            else -> 100
        }
        val left = random.nextInt(1, level + 1)
        val right = random.nextInt(1, level + 1)
        val subtraction = grade !in listOf("Nursery", "KG") && random.nextBoolean()
        return if (subtraction) MathChallenge(maxOf(left, right), minOf(left, right), '-')
        else MathChallenge(left, right, '+')
    }
    fun isCorrect(challenge: MathChallenge, input: String): Boolean =
        input.toIntOrNull() == challenge.answer
}
