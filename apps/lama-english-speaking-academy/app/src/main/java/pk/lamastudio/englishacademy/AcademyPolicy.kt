package pk.lamastudio.englishacademy

enum class AcademyLevel(val label: String, val cefr: String) {
 EASY("Easy", "A1-A2"), MEDIUM("Medium", "B1-B2"), HARD("Hard", "C1-C2")
}
enum class AccessTier { FREE, PREMIUM }
enum class Placement { HOME, LESSON_COMPLETION, SPEAKING, QUIZ, CERTIFICATE }

data class LearningModule(val id: String, val level: AcademyLevel, val premiumOnly: Boolean)

object AcademyPolicy {
 fun canOpen(module: LearningModule, tier: AccessTier): Boolean =
  !module.premiumOnly || tier == AccessTier.PREMIUM

 /** Advertising is never permitted during a lesson, quiz, speaking session, or certificate. */
 fun mayShowAd(placement: Placement, tier: AccessTier, learnerIsChild: Boolean): Boolean =
  tier == AccessTier.FREE && !learnerIsChild &&
   (placement == Placement.HOME || placement == Placement.LESSON_COMPLETION)
}
