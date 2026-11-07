package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class ScienceDiscoveryBankTest {
 @Test fun tenScienceQuestionsPerGrade() {
  assertEquals(20, ScienceDiscoveryBank.lessons.size)
  assertEquals(100, ScienceDiscoveryBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val lessons = ScienceDiscoveryBank.lessons.filter { it.grade == grade }
   assertEquals(2, lessons.size)
   assertTrue(lessons.all { it.subject == "Science" && it.questions.size == 5 })
   assertEquals(10, lessons.flatMap { it.questions }.map { it.prompt }.distinct().size)
  }
 }
 @Test fun answerOptionsAreValid() {
  assertTrue(ContentValidation.errors(ScienceDiscoveryBank.lessons).isEmpty())
  ScienceDiscoveryBank.lessons.flatMap { it.questions }.forEach { q ->
   assertEquals(3, q.answers.distinct().size)
   assertTrue(q.correctIndex in q.answers.indices)
  }
 }
}
