package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class FinalMilestoneBankTest {
 @Test fun balancedMilestone() {
  val lessons = FinalMilestoneBank.lessons
  assertEquals(60, lessons.size)
  assertEquals(180, lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val gradeLessons = lessons.filter { it.grade == grade }
   assertEquals(6, gradeLessons.size)
   assertEquals(18, gradeLessons.sumOf { it.questions.size })
   listOf("English", "Urdu", "Mathematics", "Science", "General Knowledge", "Computer Basics").forEach { subject ->
    assertEquals(3, gradeLessons.single { it.subject == subject }.questions.size)
   }
  }
 }
 @Test fun answerIntegrity() {
  assertTrue(ContentValidation.errors(FinalMilestoneBank.lessons).isEmpty())
  FinalMilestoneBank.lessons.flatMap { it.questions }.forEach { question ->
   assertEquals(3, question.answers.distinct().size)
   assertTrue(question.correctIndex in question.answers.indices)
  }
 }
}
