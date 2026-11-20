package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class WordProblemBankTest {
 @Test fun twentyQuestionsForEveryGrade() {
  assertEquals(20, WordProblemBank.lessons.size)
  assertEquals(200, WordProblemBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val lessons = WordProblemBank.lessons.filter { it.grade == grade }
   assertEquals(2, lessons.size)
   assertEquals(20, lessons.sumOf { it.questions.size })
  }
 }
 @Test fun everyAnswerIsValidAndStoryIsDistinctWithinGrade() {
  assertTrue(ContentValidation.errors(WordProblemBank.lessons).isEmpty())
  CurriculumCatalog.grades.forEach { grade ->
   val questions = WordProblemBank.lessons.filter { it.grade == grade }.flatMap { it.questions }
   assertEquals(20, questions.map { it.prompt }.distinct().size)
   questions.forEach { q ->
    assertEquals(3, q.answers.distinct().size)
    assertTrue(q.correctIndex in q.answers.indices)
   }
  }
 }
}
