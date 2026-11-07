package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class TenQuestionSetsTest {
 @Test fun sixSetsOfTenPerLevel() {
  assertEquals(60, TenQuestionSets.lessons.size)
  assertEquals(600, TenQuestionSets.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val items = TenQuestionSets.lessons.filter { it.grade == grade }
   assertEquals(6, items.size)
   assertTrue(items.all { it.questions.size == 10 })
   assertEquals(60, items.sumOf { it.questions.size })
   listOf("English", "Urdu", "Mathematics", "Science", "General Knowledge", "Computer Basics").forEach { subject ->
    val subjectSets = items.filter { it.subject == subject }
    assertEquals(1, subjectSets.size)
    assertEquals(10, subjectSets.sumOf { it.questions.size })
    assertEquals(10, subjectSets.flatMap { it.questions }.map { it.prompt }.distinct().size)
   }
  }
 }
 @Test fun answersAndIdsAreValid() {
  assertEquals(60, TenQuestionSets.lessons.map { it.id }.distinct().size)
  assertTrue(ContentValidation.errors(TenQuestionSets.lessons).isEmpty())
  TenQuestionSets.lessons.forEach { lesson ->
   assertEquals(10, lesson.questions.map { it.prompt }.distinct().size)
   lesson.questions.forEach { assertEquals(3, it.answers.distinct().size) }
  }
 }
}
