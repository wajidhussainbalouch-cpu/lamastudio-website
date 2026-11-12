package pk.lamastudio.kidslearning
import org.junit.Assert.*
import org.junit.Test
class QuizJourneyTest {
 @Test fun allRoundsHaveAtMostTenQuestionsAndContinue() {
  CurriculumCatalog.grades.forEach { grade ->
   listOf("English","Urdu","Mathematics","Science","General Knowledge","Computer Basics").forEach { subject ->
    val rounds = QuizJourney.tests(grade, subject)
    assertTrue(rounds.isNotEmpty())
    assertTrue(rounds.all { it.questions.isNotEmpty() && it.questions.size <= 10 })
    assertEquals(rounds.size, rounds.map { it.id }.distinct().size)
    rounds.dropLast(1).forEachIndexed { i, lesson ->
     assertEquals(rounds[i + 1].id, QuizJourney.next(grade, subject, lesson.id)?.id)
    }
    assertNull(QuizJourney.next(grade, subject, rounds.last().id))
   }
  }
 }
}
