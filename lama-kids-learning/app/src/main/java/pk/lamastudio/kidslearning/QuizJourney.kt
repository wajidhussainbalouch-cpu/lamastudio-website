package pk.lamastudio.kidslearning

/** Offline, deterministic quiz progression. Each test contains at most ten questions. */
object QuizJourney {
 fun tests(grade: String, subject: String): List<Lesson> {
  val structured = TenQuestionSets.lessons.filter { it.grade == grade && it.subject == subject }
  val extras = LearningContent.allLessons.filter {
   it.grade == grade && it.subject == subject &&
    it.id !in structured.map { set -> set.id } && it.questions.isNotEmpty()
  }
  val chunks = extras.flatMap { lesson ->
   lesson.questions.chunked(10).mapIndexed { index, batch ->
    lesson.copy(id = "${lesson.id}-round-${index + 1}",
     title = "${lesson.title} • Round ${index + 1}", questions = batch)
   }
  }
  return structured + chunks
 }
 fun next(grade: String, subject: String, currentId: String): Lesson? {
  val tests = tests(grade, subject)
  val index = tests.indexOfFirst { it.id == currentId }
  return if (index < 0) null else tests.getOrNull(index + 1)
 }
}
