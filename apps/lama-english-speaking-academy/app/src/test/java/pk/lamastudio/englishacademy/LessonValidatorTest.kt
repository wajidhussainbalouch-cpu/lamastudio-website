package pk.lamastudio.englishacademy

import org.junit.Assert.*
import org.junit.Test

class LessonValidatorTest {
 @Test fun validLessonHasNoErrors() {
  val lesson = Lesson("a1-test", "Introductions", "تعارف", "My name is ...", listOf("Hello"), listOf(Question("Choose a greeting", listOf("Hello", "Bye"), 0)))
  assertTrue(LessonValidator.errors(listOf(lesson)).isEmpty())
 }
 @Test fun duplicateLessonIdsAreRejected() {
  val lesson = Lesson("same", "Lesson", "سبق", "Explain", emptyList(), listOf(Question("Q?", listOf("A", "B"), 1)))
  assertTrue(LessonValidator.errors(listOf(lesson, lesson)).any { it.contains("Duplicate") })
 }
 @Test fun invalidAnswerIndexIsRejected() {
  val lesson = Lesson("test", "Lesson", "سبق", "Explain", emptyList(), listOf(Question("Q?", listOf("A", "B"), 2)))
  assertTrue(LessonValidator.errors(listOf(lesson)).isNotEmpty())
 }
}
