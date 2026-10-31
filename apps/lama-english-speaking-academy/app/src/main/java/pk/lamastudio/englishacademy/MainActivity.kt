package pk.lamastudio.englishacademy

import android.os.Bundle
import android.speech.tts.TextToSpeech
import java.util.Locale
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
 private var speaker: TextToSpeech? = null
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val lessons = LessonRepository.load(this)
  require(LessonValidator.errors(lessons).isEmpty()) { "Invalid bundled lesson content" }
  val progress = ProgressStore(this)
  var speechReady by mutableStateOf(false)
  speaker = TextToSpeech(this) { status ->
   if (status == TextToSpeech.SUCCESS) {
    val availability = speaker?.setLanguage(Locale.ENGLISH)
    speechReady = availability != TextToSpeech.LANG_MISSING_DATA && availability != TextToSpeech.LANG_NOT_SUPPORTED
   }
  }
  setContent {
   var selected by remember { mutableStateOf<Lesson?>(null) }
   var questionIndex by remember { mutableIntStateOf(0) }
   var correct by remember { mutableIntStateOf(0) }
   var finished by remember { mutableStateOf(false) }
   var coinBalance by remember { mutableIntStateOf(progress.coins()) }
   var completed by remember { mutableStateOf(lessons.filter { progress.completed(it.id) }.map { it.id }.toSet()) }
   MaterialTheme {
    Scaffold(topBar = { Surface(tonalElevation = 3.dp) { Text("Lama English Speaking Academy", modifier = Modifier.padding(20.dp), style = MaterialTheme.typography.titleMedium) } }) { inset ->
     Column(Modifier.padding(inset).fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
      if (selected == null) {
       Text("Learn English • انگریزی سیکھیں", style = MaterialTheme.typography.headlineSmall)
       Text("Easy • A1–A2 • Beginner")
       LinearProgressIndicator(progress = { if (lessons.isEmpty()) 0f else completed.size.toFloat() / lessons.size }, modifier = Modifier.fillMaxWidth())
       Text("Completed: ${completed.count { it }} / ${lessons.size}")
       Text("Reward coins: $coinBalance", style = MaterialTheme.typography.titleMedium)
       if (RewardPolicy.certificateEligible(completed.size, lessons.size)) {
        ElevatedCard(modifier = Modifier.fillMaxWidth()) {
         Column(Modifier.padding(16.dp)) {
          Text("Certificate of Course Completion", style = MaterialTheme.typography.titleMedium)
          Text("Congratulations! You have completed the Easy A1 course.")
          Text("Certificate preview only — personalized PDF issuance is not yet available.")
         }
        }
       }
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
       Text("Vocabulary", style = MaterialTheme.typography.titleMedium)
       lesson.vocabulary.forEach { word ->
        ElevatedCard(modifier = Modifier.fillMaxWidth()) {
         Column(Modifier.padding(12.dp)) {
          Text(word.word, style = MaterialTheme.typography.titleSmall)
          Text(word.urdu)
          Text(word.example, style = MaterialTheme.typography.bodySmall)
         }
        }
       }
       Text("Conversation", style = MaterialTheme.typography.titleMedium)
       lesson.dialogue.forEach { line ->
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
         Text(line, modifier = Modifier.weight(1f))
         TextButton(enabled = speechReady, onClick = { speaker?.speak(line, TextToSpeech.QUEUE_FLUSH, null, "dialogue") }) { Text("Listen") }
        }
       }
       if (!finished) {
        val q = lesson.questions[questionIndex]
        Text("Question ${questionIndex + 1} / ${lesson.questions.size}", style = MaterialTheme.typography.titleMedium)
        Text(q.text)
        q.options.forEachIndexed { index, answer ->
         OutlinedButton(onClick = {
          if (index == q.answer) correct++
          if (questionIndex + 1 == lesson.questions.size) {
           finished = true
           if (RewardPolicy.passed(correct, lesson.questions.size)) {
            coinBalance += progress.markCompleted(lesson.id)
            completed = completed + lesson.id
           }
          } else questionIndex++
         }, modifier = Modifier.fillMaxWidth()) { Text(answer) }
        }
       } else {
        Text("Quiz completed: $correct / ${lesson.questions.size}")
        if (RewardPolicy.passed(correct, lesson.questions.size)) Text("Lesson passed! First completion earns 25 coins.")
        Text(if (lesson.id in completed) "Passed! Lesson saved on this device." else "Try again to pass with at least 70%.")
        if (lesson.id !in completed) Button(onClick = { questionIndex = 0; correct = 0; finished = false }) { Text("Retry quiz") }
       }
       TextButton(onClick = { selected = null }) { Text("Back to lessons") }
      }
     }
    }
   }
  }
 }
 override fun onDestroy() {
  speaker?.stop()
  speaker?.shutdown()
  speaker = null
  super.onDestroy()
 }
}
