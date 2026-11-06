package pk.lamastudio.iqtest

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AttentionChallengeTest {
    @Test fun generatedAnswersMatchDisplayedSymbols() {
        for (seed in 1..30) {
            val rounds = createAttentionRounds(seed)
            assertEquals(10, rounds.size)
            assertEquals(10, rounds.map { it.grid.joinToString("") }.distinct().size)
            rounds.forEach { round ->
                assertEquals(4, round.choices.distinct().size)
                assertTrue(round.correct in 0..3)
                assertEquals(round.grid.count { it == round.target }, round.choices[round.correct])
            }
        }
    }
}
