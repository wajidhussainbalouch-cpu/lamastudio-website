package pk.lamastudio.englishacademy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val lessons = LessonRepository.load(this)
  val progress = ProgressStore(this)
  setContent {
   var selected by remember { mutableStateOf<Lesson?>(null) }
   var questionIndex by remember { mutableIntStateOf(0) }
   var correct by remember { mutableIntStateOf(0) }
   var finished by remember { mutableStateOf(false) }
   var completed by remember { mutableStateOf(lessons.map { progress.completed(it.id) }.toSet()) }
   MaterialTheme {
    Scaffold(topBar = { Surface(tonalElevation = 3.dp) { Text("Lama English Speaking Academy", modifier = Modifier.padding(20.dp), style = MaterialTheme.typography.titleMedium) } }) { inset ->
     Column(Modifier.padding(inset).fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
      if (selected == null) {
       Text("Learn English • انگریزی سیکھیں", style = MaterialTheme.typography.headlineSmall)
       Text("Offline A1 lessons — Beginner")
       Text("Completed: ${completed.count { it }} / ${lessons.size}")
       lessons.forEach { lesson ->
        OutlinedButton(onClick = { selected = lesson; questionIndex = 0; correct = 0; finished = false }, modifier = Modifier.fillMaxWidth()) {
         Text(lesson.title + if (lesson.id in completed) " ✓" else "")
        }
       }
      } else {
       val lesson = selected!!
       Text(lesson.title, style = MaterialTheme.typography.headlineSmall)
       Text(lesson.urduTitle)
       Text(lesson.explanation)
       Text("Conversation", style = MaterialTheme.typography.titleMedium)
       lesson.dialogue.forEach { Text(it) }
       if (!finished) {
        val q = lesson.questions[questionIndex]
        Text("Question ${questionIndex + 1} / ${lesson.questions.size}", style = MaterialTheme.typography.titleMedium)
        Text(q.text)
        q.options.forEachIndexed { index, answer ->
         OutlinedButton(onClick = {
          if (index == q.answer) correct++
          if (questionIndex + 1 == lesson.questions.size) {
           finished = true
           progress.markCompleted(lesson.id)
           completed = completed + lesson.id
          } else questionIndex++
         }, modifier = Modifier.fillMaxWidth()) { Text(answer) }
        }
       } else {
        Text("Quiz completed: $correct / ${lesson.questions.size}")
        Text("Lesson saved on this device.")
       }
       TextButton(onClick = { selected = null }) { Text("Back to lessons") }
      }
     }
    }
   }
  }
 }
}
