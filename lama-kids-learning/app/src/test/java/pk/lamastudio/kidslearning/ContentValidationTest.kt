package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class ContentValidationTest {
    @Test fun starterLessonsValidate() {
        assertTrue(ContentValidation.errors(LearningContent.lessons).joinToString(), ContentValidation.errors(LearningContent.lessons).isEmpty())
    }
    @Test fun duplicateIdsRejected() {
        val lesson = LearningContent.lessons.first()
        assertTrue(ContentValidation.errors(listOf(lesson,lesson)).any { it.contains("Duplicate") })
    }
}
