package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class ParentGateTest {
    @Test fun arithmeticChallengeIsConsistent() {
        val challenge = ParentChallenge(17, 23)
        assertEquals(40, challenge.answer)
    }
}
