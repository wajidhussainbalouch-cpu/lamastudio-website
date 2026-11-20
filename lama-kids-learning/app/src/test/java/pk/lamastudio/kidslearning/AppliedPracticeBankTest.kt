package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class AppliedPracticeBankTest {
 @Test fun fourQuestionsPerGradeAndNonMathSubject() {
  assertEquals(30, AppliedPracticeBank.lessons.size)
  assertEquals(120, AppliedPracticeBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   listOf("English", "Urdu", "Science").forEach { subject ->
    val lessons = AppliedPracticeBank.lessons.filter { it.grade == grade && it.subject == subject }
    assertEquals(1, lessons.size)
    assertEquals(4, lessons.single().questions.size)
   }
  }
 }
 @Test fun everyQuestionHasDistinctOptionsAndExplanation() {
  AppliedPracticeBank.lessons.forEach { lesson ->
   lesson.questions.forEach { question ->
    assertEquals(3, question.answers.distinct().size)
    assertTrue(question.correctIndex in question.answers.indices)
    assertTrue(question.prompt.isNotBlank())
    assertTrue(question.explanation.isNotBlank())
   }
  }
 }
}
