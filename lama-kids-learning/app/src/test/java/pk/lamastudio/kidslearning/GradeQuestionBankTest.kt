package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class GradeQuestionBankTest {
 @Test fun everyGradeHasThreeTopicsInEveryNonMathSubject() {
  assertEquals(90, GradeQuestionBank.lessons.size)
  assertEquals(360, GradeQuestionBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   listOf("English", "Urdu", "Science").forEach { subject ->
    assertEquals(3, GradeQuestionBank.lessons.count { it.grade == grade && it.subject == subject })
   }
  }
 }
 @Test fun allQuestionsHaveValidDistinctAnswers() {
  assertEquals(90, GradeQuestionBank.lessons.map { it.id }.distinct().size)
  GradeQuestionBank.lessons.forEach { lesson ->
   assertEquals(4, lesson.questions.size)
   lesson.questions.forEach { q ->
    assertEquals(3, q.answers.size)
    assertTrue(q.correctIndex in q.answers.indices)
    assertEquals(3, q.answers.distinct().size)
    assertTrue(q.explanation.isNotBlank())
   }
  }
 }
}
