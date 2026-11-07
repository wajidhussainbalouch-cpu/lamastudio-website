package pk.lamastudio.englishacademy

import android.os.Bundle
import android.speech.tts.TextToSpeech
import java.util.Locale
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.launch

private val navy = Color(0xFF10223E)
private val teal = Color(0xFF008F86)
private val gold = Color(0xFFFFC857)

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
    val available = speaker?.setLanguage(Locale.ENGLISH)
    speechReady = available != TextToSpeech.LANG_MISSING_DATA && available != TextToSpeech.LANG_NOT_SUPPORTED
   }
  }
  setContent {
   val drawerState = rememberDrawerState(DrawerValue.Closed)
   val scope = rememberCoroutineScope()
   var section by remember { mutableStateOf("Home") }
   var selected by remember { mutableStateOf<Lesson?>(null) }
   var questionIndex by remember { mutableIntStateOf(0) }
   var correct by remember { mutableIntStateOf(0) }
   var finished by remember { mutableStateOf(false) }
   var feedback by remember { mutableStateOf("") }
   var coinBalance by remember { mutableIntStateOf(progress.coins()) }
   var completed by remember { mutableStateOf(lessons.filter { progress.completed(it.id) }.map { it.id }.toSet()) }
   fun openLesson(lesson: Lesson) {
    selected = lesson; questionIndex = 0; correct = 0; finished = false; feedback = ""
   }
   BackHandler(selected != null || section != "Home") {
    if (selected != null) selected = null else section = "Home"
   }
   MaterialTheme(colorScheme = lightColorScheme(primary = teal, secondary = navy, tertiary = gold)) {
    ModalNavigationDrawer(drawerState = drawerState, drawerContent = {
     ModalDrawerSheet {
      Text("LAMA English Academy", modifier = Modifier.padding(22.dp), style = MaterialTheme.typography.titleLarge, color = navy)
      HorizontalDivider()
      listOf("Home", "Courses", "Speaking Practice", "Vocabulary", "My Progress", "Study Tips", "Settings", "Privacy Policy", "About").forEach { item ->
       NavigationDrawerItem(label = { Text(item) }, selected = section == item && selected == null,
        onClick = { selected = null; section = item; scope.launch { drawerState.close() } },
        modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp))
      }
     }
    }) {
     Scaffold(topBar = {
      Surface(color = navy) {
       Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        TextButton(onClick = { scope.launch { drawerState.open() } }) { Text("☰", color = Color.White) }
        Text(if (selected != null) selected!!.title else "LAMA • English Academy", color = Color.White,
         style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 12.dp))
       }
      }
     }) { inset ->
      Column(Modifier.padding(inset).fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp),
       verticalArrangement = Arrangement.spacedBy(14.dp)) {
       if (selected != null) {
        val lesson = selected!!
        Text(lesson.level + " • " + lesson.title, style = MaterialTheme.typography.headlineSmall, color = navy)
        Text(lesson.urduTitle)
        ElevatedCard { Column(Modifier.padding(16.dp)) {
         Text("Learn the idea", style = MaterialTheme.typography.titleMedium)
         Text(lesson.explanation)
        } }
        Text("Useful vocabulary", style = MaterialTheme.typography.titleMedium)
        lesson.vocabulary.forEach { word ->
         ElevatedCard(Modifier.fillMaxWidth()) { Column(Modifier.padding(12.dp)) {
          Text(word.word, style = MaterialTheme.typography.titleSmall, color = teal)
          Text(word.urdu)
          Text(word.example)
         } }
        }
        Text("Listen • Repeat • Speak", style = MaterialTheme.typography.titleMedium)
        lesson.dialogue.forEach { line ->
         ElevatedCard(Modifier.fillMaxWidth()) {
          Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
           Text(line, Modifier.weight(1f))
           TextButton(enabled = speechReady, onClick = { speaker?.speak(line, TextToSpeech.QUEUE_FLUSH, null, "dialogue") }) { Text("▶") }
          }
         }
        }
        if (lesson.dialogue.isNotEmpty()) SpeakingPractice(this@MainActivity, lesson.dialogue.first())
        HorizontalDivider()
        if (!finished) {
         val q = lesson.questions[questionIndex]
         Text("Check your learning • ${questionIndex + 1}/${lesson.questions.size}", style = MaterialTheme.typography.titleMedium)
         Text(q.text)
         if (feedback.isNotEmpty()) {
          Text(feedback, color = if (feedback.startsWith("Correct")) teal else Color(0xFFB3261E))
          Button(onClick = {
           feedback = ""
           if (questionIndex + 1 == lesson.questions.size) {
            finished = true
            if (RewardPolicy.passed(correct, lesson.questions.size)) {
             coinBalance += progress.markCompleted(lesson.id)
             completed = completed + lesson.id
            }
           } else questionIndex++
          }) { Text("Continue") }
         } else {
          q.options.forEachIndexed { index, answer ->
           OutlinedButton(onClick = {
            if (index == q.answer) correct++
            feedback = if (index == q.answer) "Correct! Well done." else "Correct answer: ${q.options[q.answer]}"
           }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp)) { Text(answer) }
          }
         }
        } else {
         Text("Score: $correct / ${lesson.questions.size}", style = MaterialTheme.typography.titleLarge)
         Text(if (RewardPolicy.passed(correct, lesson.questions.size)) "Passed! Your progress is saved." else "Keep practicing. You need 70% to pass.")
         Button(onClick = { questionIndex = 0; correct = 0; finished = false; feedback = "" }) { Text("Practice again") }
        }
        TextButton(onClick = { selected = null }) { Text("← Back to courses") }
       } else when (section) {
        "Home" -> {
         Surface(color = navy, shape = RoundedCornerShape(24.dp)) {
          Column(Modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
           Text("Speak English with confidence", style = MaterialTheme.typography.headlineSmall, color = Color.White)
           Text("انگریزی بولنا سیکھیں • Learn, listen and practice every day.", color = Color.White)
           Text("Your learning journey • A1 to C2", color = gold)
           LinearProgressIndicator(progress = { completed.size.toFloat() / lessons.size.coerceAtLeast(1) }, modifier = Modifier.fillMaxWidth())
           Text("${completed.size} of ${lessons.size} lessons completed", color = Color.White)
          }
         }
         Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
          ElevatedCard(Modifier.weight(1f)) { Column(Modifier.padding(14.dp)) {
           Text("★ $coinBalance", color = teal, style = MaterialTheme.typography.titleLarge)
           Text("Reward coins")
          } }
          ElevatedCard(Modifier.weight(1f)) { Column(Modifier.padding(14.dp)) {
           Text("${lessons.map { it.level }.distinct().size}", color = teal, style = MaterialTheme.typography.titleLarge)
           Text("Active levels")
          } }
         }
         Text("Continue learning", style = MaterialTheme.typography.titleLarge, color = navy)
         lessons.filter { it.id !in completed }.take(3).forEach { lesson ->
          ElevatedCard(onClick = { openLesson(lesson) }, modifier = Modifier.fillMaxWidth()) {
           Column(Modifier.padding(16.dp)) {
            Text("${lesson.level} • ${lesson.title}", style = MaterialTheme.typography.titleMedium)
            Text(lesson.urduTitle)
            Text("Start lesson →", color = teal)
           }
          }
         }
         Button(onClick = { section = "Courses" }, modifier = Modifier.fillMaxWidth()) { Text("Explore all courses") }
        }
        "Courses" -> {
         Text("Course library", style = MaterialTheme.typography.headlineSmall, color = navy)
         Text("Choose a level and build real-life communication skills.")
         listOf("A1", "A2", "B1", "B2", "C1", "C2").forEach { level ->
          Text(level + " • " + when(level) { "A1" -> "Beginner"; "A2" -> "Elementary"; "B1" -> "Intermediate"; "B2" -> "Upper intermediate"; "C1" -> "Advanced"; else -> "Proficient" },
           style = MaterialTheme.typography.titleLarge, color = navy)
          val levelLessons = lessons.filter { it.level == level }
          if (levelLessons.isEmpty()) Text("More lessons are being prepared for this level.")
          levelLessons.forEach { lesson ->
           ElevatedCard(onClick = { openLesson(lesson) }, modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(15.dp)) {
             Text(lesson.title + if (lesson.id in completed) " ✓" else "", style = MaterialTheme.typography.titleMedium)
             Text(lesson.urduTitle)
             Text("${lesson.dialogue.size} speaking lines • ${lesson.questions.size} questions", color = teal)
            }
           }
          }
         }
        }
        "Speaking Practice" -> {
         Text("Speak out loud", style = MaterialTheme.typography.headlineSmall)
         Text("Listen to a model sentence, repeat it, then use the microphone to compare your words. Recognition availability depends on your device and may need internet.")
         lessons.take(8).forEach { lesson ->
          OutlinedButton(onClick = { openLesson(lesson) }, modifier = Modifier.fillMaxWidth()) { Text(lesson.title + " →") }
         }
        }
        "Vocabulary" -> {
         Text("Vocabulary notebook", style = MaterialTheme.typography.headlineSmall)
         lessons.flatMap { it.vocabulary }.distinctBy { it.word.lowercase() }.forEach { word ->
          ElevatedCard(Modifier.fillMaxWidth()) { Column(Modifier.padding(12.dp)) {
           Text(word.word, color = teal, style = MaterialTheme.typography.titleMedium)
           Text(word.urdu)
           Text(word.example)
          } }
         }
        }
        "My Progress" -> {
         Text("My learning progress", style = MaterialTheme.typography.headlineSmall)
         Text("Completed lessons: ${completed.size} / ${lessons.size}")
         Text("Reward coins: $coinBalance")
         LinearProgressIndicator(progress = { completed.size.toFloat() / lessons.size.coerceAtLeast(1) }, modifier = Modifier.fillMaxWidth())
         lessons.forEach { Text((if (it.id in completed) "✓ " else "○ ") + it.level + " • " + it.title) }
        }
        "Study Tips" -> {
         Text("Build a speaking habit", style = MaterialTheme.typography.headlineSmall)
         listOf("Listen to each dialogue twice.", "Repeat every sentence aloud.", "Speak slowly and clearly before increasing speed.", "Practice one conversation with a friend.", "Review five useful words every day.", "Use English in real situations: shopping, school, work and travel.").forEachIndexed { i, tip ->
          ElevatedCard(Modifier.fillMaxWidth()) { Text("${i + 1}. $tip", Modifier.padding(16.dp)) }
         }
        }
        "Settings" -> {
         Text("Settings", style = MaterialTheme.typography.headlineSmall)
         Text("Learning language: English with Urdu explanations")
         Text("Lesson progress is stored on this device.")
         Text("Audio playback requires an English text-to-speech voice installed on your device.")
         Text("Speaking recognition uses your device's speech service and may require an internet connection.")
        }
        "Privacy Policy" -> {
         Text("Privacy Policy", style = MaterialTheme.typography.headlineSmall)
         Text("Lama English Speaking Academy stores lesson completion and reward coins locally on your device. The app requests microphone permission only when you choose speaking practice. Speech recognition is handled by the speech service available on your device and may transmit speech to that service provider. The current app does not operate a Lama Studio account server, advertising SDK or payment service. No microphone recordings are intentionally saved by this app. You can deny microphone access and continue text lessons. For questions, visit lamastudio.pk. This summary describes the current test build and must be reviewed before public distribution.")
        }
        "About" -> {
         Text("LAMA English Speaking Academy", style = MaterialTheme.typography.headlineSmall, color = navy)
         Text("Learn • Listen • Speak • Grow")
         Text("A LAMA Studio educational project • lamastudio.pk")
         Text("Offline lesson reading and quizzes, English speech playback, optional device-dependent speaking recognition, Urdu explanations and local progress.")
         Text("Development testing edition. Curriculum levels and features will expand in future builds.")
        }
       }
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
