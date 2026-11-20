package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class GeneralKnowledgeExpansionTest {
 @Test fun tenQuestionsForEveryGrade() {
  assertEquals(20, GeneralKnowledgeExpansion.lessons.size)
  assertEquals(100, GeneralKnowledgeExpansion.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val lessons = GeneralKnowledgeExpansion.lessons.filter { it.grade == grade }
   assertEquals(2, lessons.size)
   assertEquals(10, lessons.sumOf { it.questions.size })
   assertEquals(10, lessons.flatMap { it.questions }.map { it.prompt }.distinct().size)
  }
 }
 @Test fun answerKeysAreValid() {
  assertTrue(ContentValidation.errors(GeneralKnowledgeExpansion.lessons).isEmpty())
  GeneralKnowledgeExpansion.lessons.flatMap { it.questions }.forEach { q ->
   assertEquals(3, q.answers.distinct().size)
   assertTrue(q.correctIndex in q.answers.indices)
  }
 }
}
