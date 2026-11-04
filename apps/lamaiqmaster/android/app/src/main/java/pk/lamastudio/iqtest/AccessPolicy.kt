package pk.lamastudio.iqtest

/**
 * Product access rules. Ad grants must be persisted ONLY after the rewarded-ad SDK
 * delivers its earned-reward callback. This class does not show ads or process payments.
 */
object AccessPolicy {
    const val FREE_BATCHES = 10
    const val QUESTIONS_PER_BATCH = 10
    const val PASS_SCORE = 7
    const val MAX_REWARDED_BATCHES_PER_DAY = 6
    const val REWARD_STANDARD_BATCHES = 1
    const val REWARD_EXTENDED_BATCHES = 2

    fun freeQuestions(): Int = FREE_BATCHES * QUESTIONS_PER_BATCH

    fun canOpenBatch(
        batch: Int,
        previousBatchScore: Int,
        rewardedBonusBatches: Int,
        proActive: Boolean
    ): Boolean {
        if (batch < 1) return false
        if (proActive) return true
        if (batch == 1) return true
        val earnedProgress = if (previousBatchScore >= PASS_SCORE) batch <= FREE_BATCHES else false
        if (batch <= FREE_BATCHES) return earnedProgress
        return batch <= FREE_BATCHES + rewardedBonusBatches
    }

    fun grantBatches(
        currentBonus: Int,
        dailyEarned: Int,
        rewardBatches: Int
    ): Int {
        require(rewardBatches == REWARD_STANDARD_BATCHES || rewardBatches == REWARD_EXTENDED_BATCHES)
        return currentBonus + minOf(rewardBatches, (MAX_REWARDED_BATCHES_PER_DAY - dailyEarned).coerceAtLeast(0))
    }
}
