package pk.lamastudio.iqtest

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AdvancedReasoningTest {
    @Test fun generatedChoicesAreDistinctAndCorrectIndicesValid() {
        for (seed in 1..500) {
            val rounds = createReasoningRounds(seed)
            assertEquals(10, rounds.size)
            assertEquals(10, rounds.map { it.id.substringBefore("-") }.distinct().size)
            rounds.forEach { round ->
                assertEquals(4, round.choices.size)
                assertEquals(4, round.choices.distinct().size)
                assertTrue(round.correctIndex in 0..3)
                assertTrue(round.choices[round.correctIndex].isNotBlank())
                assertTrue(round.hint.isNotBlank())
                assertTrue(round.explanation.isNotBlank())
            }
        }
    }
}
