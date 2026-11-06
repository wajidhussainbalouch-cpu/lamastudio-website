package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class TenQuestionSetsTest {
 @Test fun twelveSetsOfTenPerLevel() {
  assertEquals(120, TenQuestionSets.lessons.size)
  assertEquals(1200, TenQuestionSets.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val items = TenQuestionSets.lessons.filter { it.grade == grade }
   assertEquals(12, items.size)
   assertTrue(items.all { it.questions.size == 10 })
   assertEquals(120, items.sumOf { it.questions.size })
   listOf("English", "Urdu", "Mathematics", "Science", "General Knowledge", "Computer Basics").forEach { subject ->
    val subjectSets = items.filter { it.subject == subject }
    assertEquals(2, subjectSets.size)
    assertEquals(20, subjectSets.sumOf { it.questions.size })
    assertEquals(20, subjectSets.flatMap { it.questions }.map { it.prompt }.distinct().size)
   }
  }
 }
 @Test fun answersAndIdsAreValid() {
  assertEquals(120, TenQuestionSets.lessons.map { it.id }.distinct().size)
  assertTrue(ContentValidation.errors(TenQuestionSets.lessons).isEmpty())
  TenQuestionSets.lessons.forEach { lesson ->
   assertEquals(10, lesson.questions.map { it.prompt }.distinct().size)
   lesson.questions.forEach { assertEquals(3, it.answers.distinct().size) }
  }
 }
}
