package pk.lamastudio.englishacademy
object RewardPolicy {
 const val FIRST_PASS_COINS = 25
 fun passed(correct: Int, total: Int): Boolean = total > 0 && correct * 100 >= total * 70
 fun award(alreadyCompleted: Boolean, correct: Int, total: Int): Int = if (!alreadyCompleted && passed(correct,total)) FIRST_PASS_COINS else 0
 fun certificateEligible(completed: Int, total: Int): Boolean = total > 0 && completed == total
}
