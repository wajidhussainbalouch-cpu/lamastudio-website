package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class DigitalSkillsBankTest {
 @Test fun tenQuestionsPerGrade() {
  assertEquals(20, DigitalSkillsBank.lessons.size)
  assertEquals(100, DigitalSkillsBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val lessons = DigitalSkillsBank.lessons.filter { it.grade == grade }
   assertEquals(2, lessons.size)
   assertTrue(lessons.all { it.subject == "Computer Basics" && it.questions.size == 5 })
   val questions = lessons.flatMap { it.questions }
   assertEquals(10, questions.map { it.prompt }.distinct().size)
  }
 }
 @Test fun answerOptionsAndKeysAreValid() {
  assertTrue(ContentValidation.errors(DigitalSkillsBank.lessons).isEmpty())
  DigitalSkillsBank.lessons.flatMap { it.questions }.forEach { q ->
   assertEquals(3, q.answers.distinct().size)
   assertTrue(q.correctIndex in q.answers.indices)
  }
 }
}
