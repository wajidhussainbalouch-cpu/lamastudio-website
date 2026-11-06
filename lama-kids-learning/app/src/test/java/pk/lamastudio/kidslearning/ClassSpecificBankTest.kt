package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class ClassSpecificBankTest {
 @Test fun everyClassHasSixDistinctQuestionsPerSubject() {
  assertEquals(60, ClassSpecificBank.lessons.size)
  assertEquals(180, ClassSpecificBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   listOf("English", "Urdu", "Science").forEach { subject ->
    val questions = ClassSpecificBank.lessons.filter { it.grade == grade && it.subject == subject }.flatMap { it.questions }
    assertEquals(6, questions.size)
    assertEquals(6, questions.map { it.prompt }.distinct().size)
    questions.forEach { q ->
     assertEquals(3, q.answers.distinct().size)
     assertTrue(q.correctIndex in q.answers.indices)
     assertTrue(q.explanation.isNotBlank())
    }
   }
  }
 }
 @Test fun allClassSpecificLessonIdsAreUnique() {
  assertEquals(60, ClassSpecificBank.lessons.map { it.id }.distinct().size)
 }
}
