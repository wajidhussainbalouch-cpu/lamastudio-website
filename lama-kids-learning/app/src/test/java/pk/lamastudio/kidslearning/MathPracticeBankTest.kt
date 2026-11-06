package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class MathPracticeBankTest {
    @Test fun allQuestionsHaveCorrectAnswer() {
        assertEquals(40, MathPracticeBank.lessons.size)
        assertEquals(400, MathPracticeBank.lessons.sumOf { it.questions.size })
        MathPracticeBank.lessons.forEach { lesson ->
            lesson.questions.forEach { question ->
                assertEquals(3, question.answers.size)
                assertTrue(question.correctIndex in question.answers.indices)
                assertTrue(question.answers.distinct().size == question.answers.size)
            }
        }
    }

    @Test fun everyGradeGetsFourMathPracticeTopics() {
        CurriculumCatalog.grades.forEach { grade ->
            assertEquals(4, MathPracticeBank.lessons.count { it.grade == grade })
        }
    }
}
