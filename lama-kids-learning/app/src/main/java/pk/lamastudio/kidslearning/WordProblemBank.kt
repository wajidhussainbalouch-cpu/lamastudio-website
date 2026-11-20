package pk.lamastudio.kidslearning

/** Offline contextual arithmetic: 20 new word problems for each grade. */
object WordProblemBank {
 private val objects = listOf("apples", "books", "pencils", "stars", "flowers",
  "marbles", "stickers", "crayons", "balls", "shells")
 private fun base(index: Int): Int = when(index) {
  0 -> 2; 1 -> 4; 2 -> 7; 3 -> 12; 4 -> 20
  5 -> 35; 6 -> 50; 7 -> 70; 8 -> 100; else -> 150
 }
 private fun question(prompt: String, answer: Int, why: String, seed: Int): Question {
  val choices = listOf(answer, answer + 1, answer + 2)
  val rotated = choices.drop(seed % 3) + choices.take(seed % 3)
  return Question(prompt, rotated.map { it.toString() }, rotated.indexOf(answer), why)
 }
 fun questions(gradeIndex: Int, operation: Int): List<Question> {
  require(gradeIndex in 0..9 && operation in 0..1)
  val max = base(gradeIndex)
  return (0 until 10).map { i ->
   val item = objects[i]
   val first = 2 + (i * (gradeIndex + 1)) % max
   val second = 1 + (i + gradeIndex) % max
   if (operation == 0) {
    val result = first + second
    question("A child has $first $item and gets $second more. How many $item are there now?",
     result, "$first + $second = $result.", i)
   } else {
    val total = first + second
    question("There are $total $item. A child gives away $second. How many $item remain?",
     first, "$total − $second = $first.", i)
   }
  }
 }
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  listOf("Adding in real life", "Taking away in real life").mapIndexed { operation, title ->
   Lesson("word-problem-${grade.replace(" ", "-")}-$operation", grade, "Mathematics",
    title, "Read each story, choose an answer, and check the worked explanation.",
    questions(index, operation))
  }
 }
}
