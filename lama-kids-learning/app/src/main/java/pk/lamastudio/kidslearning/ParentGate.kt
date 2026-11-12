package pk.lamastudio.kidslearning

import kotlin.random.Random

data class ParentChallenge(val first: Int, val second: Int) {
    val answer: Int get() = first + second
    companion object { fun generate(): ParentChallenge = ParentChallenge(Random.nextInt(12, 30), Random.nextInt(12, 30)) }
}
