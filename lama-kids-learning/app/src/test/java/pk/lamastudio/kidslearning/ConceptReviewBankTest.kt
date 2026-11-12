package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class ConceptReviewBankTest {
 @Test fun everyClassAndSubjectHasFiveQuestions() {
  assertEquals(30, ConceptReviewBank.lessons.size)
  assertEquals(150, ConceptReviewBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   listOf("English", "Urdu", "Science").forEach { subject ->
    val matching = ConceptReviewBank.lessons.filter { it.grade == grade && it.subject == subject }
    assertEquals(1, matching.size)
    assertEquals(5, matching.single().questions.size)
   }
  }
 }
 @Test fun answersAndIdsAreValid() {
  assertEquals(30, ConceptReviewBank.lessons.map { it.id }.distinct().size)
  assertTrue(ContentValidation.errors(ConceptReviewBank.lessons).isEmpty())
  ConceptReviewBank.lessons.forEach { lesson ->
   assertEquals(5, lesson.questions.map { it.prompt }.distinct().size)
   lesson.questions.forEach { question ->
    assertEquals(3, question.answers.distinct().size)
    assertTrue(question.correctIndex in question.answers.indices)
   }
  }
 }
}
