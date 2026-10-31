package pk.lamastudio.englishacademy

/** Checks offline lesson content before presenting it to learners. */
object LessonValidator {
 fun errors(lessons: List<Lesson>): List<String> {
  val errors = mutableListOf<String>()
  if (lessons.map { it.id }.distinct().size != lessons.size) errors += "Duplicate lesson IDs"
  lessons.forEach { lesson ->
   if (lesson.id.isBlank() || lesson.title.isBlank() || lesson.explanation.isBlank()) errors += "Incomplete lesson: ${lesson.id}"
   if (lesson.questions.isEmpty()) errors += "No quiz: ${lesson.id}"
   lesson.questions.forEachIndexed { index, question ->
    if (question.text.isBlank() || question.options.size < 2 || question.answer !in question.options.indices) errors += "Invalid question $index: ${lesson.id}"
   }
  }
  return errors
 }
}
