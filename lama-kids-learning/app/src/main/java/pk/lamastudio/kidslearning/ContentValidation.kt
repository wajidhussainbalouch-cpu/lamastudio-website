package pk.lamastudio.kidslearning

object ContentValidation {
    fun errors(lessons: List<Lesson>): List<String> {
        val errors = mutableListOf<String>()
        val ids = mutableSetOf<String>()
        lessons.forEach { lesson ->
            if (!ids.add(lesson.id)) errors.add("Duplicate lesson id: " + lesson.id)
            if (lesson.title.isBlank() || lesson.explanation.isBlank()) errors.add("Empty lesson content: " + lesson.id)
            if (lesson.questions.isEmpty()) errors.add("No questions: " + lesson.id)
            lesson.questions.forEachIndexed { index, question ->
                if (question.prompt.isBlank() || question.explanation.isBlank()) errors.add("Empty question: " + lesson.id + "/" + index)
                if (question.answers.size < 2 || question.answers.any { it.isBlank() }) errors.add("Invalid answers: " + lesson.id + "/" + index)
                if (question.correctIndex !in question.answers.indices) errors.add("Invalid answer key: " + lesson.id + "/" + index)
            }
        }
        return errors
    }
}
