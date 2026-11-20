package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class QuizEngineTest {
    @Test fun correctAndIncorrectAnswers() {
        val q = Question("2+2?", listOf("3","4"),1,"4")
        assertTrue(QuizEngine.isCorrect(q,1))
        assertFalse(QuizEngine.isCorrect(q,0))
        assertFalse(QuizEngine.isCorrect(q,8))
    }
    @Test fun contentAnswersAreValid() {
        LearningContent.lessons.forEach { lesson ->
            assertTrue(lesson.questions.isNotEmpty())
            lesson.questions.forEach { assertTrue(it.correctIndex in it.answers.indices) }
        }
    }
    @Test fun lessonIdsUnique() {
        assertEquals(LearningContent.lessons.size, LearningContent.lessons.map { it.id }.toSet().size)
    }
}
