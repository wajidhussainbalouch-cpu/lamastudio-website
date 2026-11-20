package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test
import kotlin.random.Random

class MathGamesTest {
    @Test fun answersMatchOperations() {
        assertEquals(9, MathChallenge(4,5,'+').answer)
        assertEquals(3, MathChallenge(7,4,'-').answer)
    }
    @Test fun generatedQuestionsAreNonnegative() {
        listOf("Nursery","KG","Class 1","Class 5","Class 8").forEach { grade ->
            repeat(50) {
                val challenge = MathGames.generate(grade, Random(it))
                assertTrue(challenge.answer >= 0)
                assertTrue(MathGames.isCorrect(challenge, challenge.answer.toString()))
            }
        }
    }
}
