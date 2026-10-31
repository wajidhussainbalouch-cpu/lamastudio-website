package pk.lamastudio.englishacademy

import android.content.Context
import org.json.JSONObject

data class Question(val text: String, val options: List<String>, val answer: Int)
data class Lesson(val id: String, val title: String, val urduTitle: String, val explanation: String, val dialogue: List<String>, val questions: List<Question>)

object LessonRepository {
 fun load(context: Context): List<Lesson> {
  val json = JSONObject(context.assets.open("lessons_a1.json").bufferedReader().use { it.readText() })
  val array = json.getJSONArray("lessons")
  return (0 until array.length()).map { i ->
   val item = array.getJSONObject(i)
   val dialog = item.getJSONArray("dialogue")
   val quiz = item.getJSONArray("quiz")
   Lesson(item.getString("id"), item.getString("title"), item.getString("titleUrdu"),
    item.getString("explanationUrdu"),
    (0 until dialog.length()).map { dialog.getJSONObject(it).getString("text") },
    (0 until quiz.length()).map { j ->
     val q = quiz.getJSONObject(j)
     val opts = q.getJSONArray("options")
     Question(q.getString("question"), (0 until opts.length()).map { opts.getString(it) }, q.getInt("correctIndex"))
    })
  }
 }
}
