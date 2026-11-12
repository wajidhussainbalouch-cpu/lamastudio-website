package pk.lamastudio.englishacademy

import org.junit.Assert.*
import org.junit.Test

class RewardPolicyTest {
 @Test fun passingScoreAtSeventyPercent() {
  assertTrue(RewardPolicy.passed(7, 10))
  assertFalse(RewardPolicy.passed(6, 10))
  assertFalse(RewardPolicy.passed(0, 0))
 }
 @Test fun awardOnlyForFirstPass() {
  assertEquals(25, RewardPolicy.award(false, 7, 10))
  assertEquals(0, RewardPolicy.award(true, 10, 10))
  assertEquals(0, RewardPolicy.award(false, 6, 10))
 }
 @Test fun courseMustBeFullyCompleted() {
  assertTrue(RewardPolicy.certificateEligible(4, 4))
  assertFalse(RewardPolicy.certificateEligible(3, 4))
  assertFalse(RewardPolicy.certificateEligible(0, 0))
 }
}
