package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test

class ReadingComprehensionBankTest {
 @Test fun twoStoriesAndTenQuestionsPerGrade() {
  assertEquals(20, ReadingComprehensionBank.lessons.size)
  assertEquals(100, ReadingComprehensionBank.lessons.sumOf { it.questions.size })
  CurriculumCatalog.grades.forEach { grade ->
   val stories = ReadingComprehensionBank.lessons.filter { it.grade == grade }
   assertEquals(2, stories.size)
   assertTrue(stories.all { it.questions.size == 5 })
  }
 }
 @Test fun allStoriesHaveValidQuestions() {
  assertTrue(ContentValidation.errors(ReadingComprehensionBank.lessons).isEmpty())
  ReadingComprehensionBank.lessons.forEach { story ->
   assertTrue(story.explanation.length > 40)
   assertEquals(5, story.questions.map { it.prompt }.distinct().size)
   story.questions.forEach { assertEquals(3, it.answers.distinct().size) }
  }
 }
}
