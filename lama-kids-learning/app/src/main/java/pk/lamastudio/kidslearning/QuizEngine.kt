package pk.lamastudio.kidslearning

object QuizEngine {
    fun isCorrect(question: Question, chosenIndex: Int): Boolean =
        chosenIndex in question.answers.indices && chosenIndex == question.correctIndex
    fun score(questions: List<Question>, choices: List<Int>): Int =
        questions.zip(choices).count { (q, choice) -> isCorrect(q, choice) }
}
