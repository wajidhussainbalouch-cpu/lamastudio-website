package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class TopicLibraryTest {
    @Test fun everyGradeSubjectHasFourOrMoreTopics() {
        CurriculumCatalog.units.forEach { unit ->
            assertTrue(unit.grade + " " + unit.subject,
                LearningContent.forGradeAndSubject(unit.grade, unit.subject).size >= 4)
        }
    }

    @Test fun everyTopicHasValidQuestions() {
        assertEquals(120, TopicLibrary.lessons.size)
        assertTrue(ContentValidation.errors(LearningContent.allLessons).isEmpty())
        assertTrue(TopicLibrary.lessons.all { it.questions.size >= 3 })
    }

    @Test fun topicIdsAreUnique() {
        assertEquals(TopicLibrary.lessons.size, TopicLibrary.lessons.map { it.id }.toSet().size)
    }
}
