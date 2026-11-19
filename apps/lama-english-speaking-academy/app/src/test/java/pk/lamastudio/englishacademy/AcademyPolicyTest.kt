package pk.lamastudio.englishacademy

import org.junit.Assert.*
import org.junit.Test

class AcademyPolicyTest {
 @Test fun freeModulesAreAccessible() {
  assertTrue(AcademyPolicy.canOpen(LearningModule("a1", AcademyLevel.EASY, false), AccessTier.FREE))
 }
 @Test fun premiumModulesRequirePremium() {
  val module = LearningModule("c1", AcademyLevel.HARD, true)
  assertFalse(AcademyPolicy.canOpen(module, AccessTier.FREE))
  assertTrue(AcademyPolicy.canOpen(module, AccessTier.PREMIUM))
 }
 @Test fun adsNeverInterruptLearningOrChildren() {
  assertFalse(AcademyPolicy.mayShowAd(Placement.SPEAKING, AccessTier.FREE, false))
  assertFalse(AcademyPolicy.mayShowAd(Placement.QUIZ, AccessTier.FREE, false))
  assertFalse(AcademyPolicy.mayShowAd(Placement.HOME, AccessTier.FREE, true))
  assertFalse(AcademyPolicy.mayShowAd(Placement.HOME, AccessTier.PREMIUM, false))
  assertTrue(AcademyPolicy.mayShowAd(Placement.HOME, AccessTier.FREE, false))
 }
}
