package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class TenQuestionSetsTest {
 @Test fun tenSetsOfTenPerLevel() {
  assertEquals(100, TenQuestionSets.lessons.size)
  assertEquals(1000, TenQuestionSets.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val items = TenQuestionSets.lessons.filter { it.grade == grade }
   assertEquals(10, items.size)
   assertTrue(items.all { it.questions.size == 10 })
   assertEquals(100, items.sumOf { it.questions.size })
  }
 }
 @Test fun answersAndIdsAreValid() {
  assertEquals(100, TenQuestionSets.lessons.map { it.id }.distinct().size)
  assertTrue(ContentValidation.errors(TenQuestionSets.lessons).isEmpty())
  TenQuestionSets.lessons.forEach { lesson ->
   assertEquals(10, lesson.questions.map { it.prompt }.distinct().size)
   lesson.questions.forEach { assertEquals(3, it.answers.distinct().size) }
  }
 }
}
