package pk.lamastudio.iqtest

import org.junit.Assert.*
import org.junit.Test

class QuestionValidationTest {
    @Test fun fixedBankIsValid() {
        assertTrue("Fixed questions must have unique IDs and valid choices", ChallengeBank.validate())
        for (level in 1..5) assertEquals(10, ChallengeBank.forLevel(level).size)
    }

    @Test fun visualQuestionsAreWellFormed() {
        for (level in 1..5) {
            val items = VisualPuzzleFactory.create(level, count = 100, seed = 700 + level)
            assertEquals(100, items.size)
            assertEquals(100, items.map { it.id }.distinct().size)
            assertTrue(VisualPuzzleFactory.validate(items))
        }
    }

    @Test fun generatedVisualPuzzlesAreReproducible() {
        val first = VisualPuzzleFactory.create(3, count = 20, seed = 88)
        assertEquals(first, VisualPuzzleFactory.create(3, count = 20, seed = 88))
    }

    @Test fun freeAndRewardRules() {
        assertEquals(100, AccessPolicy.freeQuestions())
        assertTrue(AccessPolicy.canOpenBatch(1, 0, 0, false))
        assertTrue(AccessPolicy.canOpenBatch(2, 7, 0, false))
        assertFalse(AccessPolicy.canOpenBatch(2, 6, 0, false))
        assertFalse(AccessPolicy.canOpenBatch(11, 7, 0, false))
        assertTrue(AccessPolicy.canOpenBatch(11, 7, 1, false))
        assertEquals(6, AccessPolicy.grantBatches(5, 5, 2))
    }
}
