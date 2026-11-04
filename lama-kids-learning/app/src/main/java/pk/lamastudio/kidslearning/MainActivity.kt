package pk.lamastudio.kidslearning

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

private val grades = listOf("Nursery", "KG") + (1..8).map { "Class " + it }
private val subjects = listOf("English", "Urdu", "Mathematics", "Science")
private val ink = Color(0xFF19335A)
private val ocean = Color(0xFF2776D2)
private val cream = Color(0xFFF6F9FF)

class MainActivity : ComponentActivity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val store = ProgressStore(this)
  val tone = ToneGenerator(AudioManager.STREAM_MUSIC, 45)
  setContent {
   DisposableEffect(Unit) { onDispose { tone.release() } }
   var grade by remember { mutableStateOf("Class 1") }
   var subject by remember { mutableStateOf("English") }
   var page by remember { mutableStateOf("home") }
   var currentLesson by remember { mutableStateOf<Lesson?>(null) }
   var answer by remember { mutableIntStateOf(-1) }
   var questionIndex by remember { mutableIntStateOf(0) }
   var correctCount by remember { mutableIntStateOf(0) }
   var stars by remember { mutableIntStateOf(store.totalStars()) }
   var sound by remember { mutableStateOf(store.soundEnabled()) }
   var parentUnlocked by remember { mutableStateOf(false) }
   var challenge by remember { mutableStateOf(ParentChallenge.generate()) }
   var parentInput by remember { mutableStateOf("") }
   var game by remember { mutableStateOf<MathChallenge?>(null) }
   var gameInput by remember { mutableStateOf("") }
   var gameFeedback by remember { mutableStateOf("") }
   val drawer = rememberDrawerState(DrawerValue.Closed)
   val scope = rememberCoroutineScope()
   fun goHome() { page = "home"; currentLesson = null; answer = -1; questionIndex = 0; correctCount = 0; parentUnlocked = false }
   fun feedback(correct: Boolean) {
    if (sound) tone.startTone(if (correct) ToneGenerator.TONE_PROP_ACK else ToneGenerator.TONE_PROP_NACK, 130)
   }
   BackHandler(enabled = page != "home") {
    if (page == "quiz") { page = "topics"; currentLesson = null }
    else goHome()
   }
   MaterialTheme(colorScheme = lightColorScheme(primary = ocean, background = cream, surface = Color.White)) {
    ModalNavigationDrawer(
     drawerState = drawer,
     drawerContent = {
      ModalDrawerSheet {
       Text("🌈 Lama Kids", Modifier.padding(22.dp), style = MaterialTheme.typography.headlineSmall, color = ink)
       listOf("🏠 Home" to "home", "📚 Topics" to "topics", "🎮 Math game" to "game", "🏆 My rewards" to "rewards", "⚙ Settings" to "settings", "👨‍👩‍👧 Parent area" to "parent").forEach { (label, destination) ->
        NavigationDrawerItem(label = { Text(label) }, selected = page == destination, onClick = {
         page = destination
         if (destination == "game") { game = MathGames.generate(grade); gameInput = ""; gameFeedback = "" }
         if (destination == "parent") { parentUnlocked = false; challenge = ParentChallenge.generate(); parentInput = "" }
         scope.launch { drawer.close() }
        }, modifier = Modifier.padding(horizontal = 12.dp, vertical = 3.dp))
       }
      }
     }
    ) {
     Scaffold(
      topBar = {
       Surface(shadowElevation = 3.dp) {
        Row(Modifier.fillMaxWidth().background(Color.White).padding(horizontal = 12.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
         Text("☰", Modifier.clickable { scope.launch { drawer.open() } }.padding(10.dp), style = MaterialTheme.typography.headlineSmall, color = ink)
         Column(Modifier.weight(1f)) {
          Text("Lama Kids Learning", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = ink)
          Text(grade + " • " + subject, style = MaterialTheme.typography.labelSmall, color = ocean)
         }
         Text("⭐ " + stars, style = MaterialTheme.typography.titleMedium, color = ink)
        }
       }
      }
     ) { inner ->
      LazyColumn(
       modifier = Modifier.fillMaxSize().background(cream).padding(inner).padding(horizontal = 16.dp),
       verticalArrangement = Arrangement.spacedBy(12.dp),
       contentPadding = PaddingValues(vertical = 16.dp)
      ) {
       if (page == "home") {
        item { Hero("🚀 Ready to learn?", "Pick your class, choose a subject and explore fun topics!") }
        item { Section("🎒 Choose your class") }
        item {
         Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          grades.chunked(4).forEach { group ->
           Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            group.forEach { choice ->
             val active = grade == choice
             Surface(
              modifier = Modifier.weight(1f).clickable { grade = choice },
              shape = RoundedCornerShape(14.dp),
              color = if (active) ocean else Color.White,
              shadowElevation = if (active) 3.dp else 1.dp
             ) {
              Text(choice.replace("Class ", "C"), Modifier.padding(vertical = 14.dp, horizontal = 3.dp), color = if (active) Color.White else ink, style = MaterialTheme.typography.labelMedium, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
             }
            }
           }
          }
         }
        }
        item { Section("📖 Pick a subject") }
        item {
         Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          subjects.chunked(2).forEach { group ->
           Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            group.forEach { choice ->
             val symbol = when (choice) { "English" -> "🔤"; "Urdu" -> "✍️"; "Mathematics" -> "🔢"; else -> "🔬" }
             Card(onClick = { subject = choice; page = "topics" }, modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color.White), elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)) {
              Column(Modifier.fillMaxWidth().padding(18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
               Text(symbol, style = MaterialTheme.typography.headlineMedium)
               Spacer(Modifier.height(8.dp))
               Text(choice, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = ink)
              }
             }
            }
           }
          }
         }
        }
        item { Button(onClick = { page = "game"; game = MathGames.generate(grade); gameInput = ""; gameFeedback = "" }, modifier = Modifier.fillMaxWidth()) { Text("🎮 Play Math Challenge") } }
       } else if (page == "topics") {
        item { Hero("📚 " + subject + " topics", grade + " • Choose a topic to start a lesson") }
        val available = LearningContent.forGradeAndSubject(grade, subject)
        items(available) { lesson ->
         Card(onClick = { currentLesson = lesson; questionIndex = 0; correctCount = 0; answer = -1; page = "quiz" }, colors = CardDefaults.cardColors(containerColor = Color.White)) {
          Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
           Text("📘", style = MaterialTheme.typography.headlineMedium)
           Spacer(Modifier.width(12.dp))
           Column(Modifier.weight(1f)) {
            Text(lesson.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = ink)
            Text(lesson.questions.size.toString() + " practice questions", style = MaterialTheme.typography.bodySmall)
           }
           Text("⭐" + store.stars(lesson.id))
          }
         }
        }
        item { Text("Topic practice is available offline. More age-specific activities are in development.", style = MaterialTheme.typography.bodySmall) }
        item { OutlinedButton(onClick = { page = "home" }) { Text("← Classes and subjects") } }
       } else if (page == "quiz") {
        val lesson = currentLesson
        if (lesson != null) {
         val question = lesson.questions[questionIndex]
         item { Hero("📖 " + lesson.title, lesson.explanation) }
         item { LinearProgressIndicator(progress = { (questionIndex + 1).toFloat() / lesson.questions.size }, modifier = Modifier.fillMaxWidth()) }
         item { Section("Question " + (questionIndex + 1) + " / " + lesson.questions.size) }
         item { Text(question.prompt, style = MaterialTheme.typography.titleLarge, color = ink) }
         items(question.answers.size) { i ->
          val chosen = answer == i
          OutlinedButton(
           onClick = { if (answer == -1) { answer = i; feedback(QuizEngine.isCorrect(question, i)) } },
           modifier = Modifier.fillMaxWidth(),
           colors = ButtonDefaults.outlinedButtonColors(containerColor = if (chosen) Color(0xFFDCEEFF) else Color.White),
           shape = RoundedCornerShape(16.dp)
          ) { Text(question.answers[i], Modifier.padding(6.dp)) }
         }
         if (answer >= 0) {
          item { Text((if (QuizEngine.isCorrect(question, answer)) "🎉 Correct! " else "💡 Let's learn: ") + question.explanation) }
          item {
           Button(onClick = {
            val score = correctCount + if (QuizEngine.isCorrect(question, answer)) 1 else 0
            if (questionIndex + 1 < lesson.questions.size) {
             correctCount = score; questionIndex += 1; answer = -1
            } else {
             store.completeWithScore(lesson.id, score, lesson.questions.size)
             stars = store.totalStars()
             page = "topics"; currentLesson = null; questionIndex = 0; correctCount = 0; answer = -1
            }
           }, modifier = Modifier.fillMaxWidth()) { Text(if (questionIndex + 1 == lesson.questions.size) "🏅 Finish lesson" else "Next question →") }
          }
         }
         item { OutlinedButton(onClick = { page = "topics"; currentLesson = null }) { Text("← Topics") } }
        }
       } else if (page == "game") {
        val current = game ?: MathGames.generate(grade).also { game = it }
        item { Hero("🎮 Math Challenge", "Solve a new puzzle at your own pace!") }
        item { Section(current.question()) }
        item { OutlinedTextField(gameInput, { gameInput = it.filter(Char::isDigit).take(5) }, label = { Text("Your answer") }, singleLine = true, modifier = Modifier.fillMaxWidth()) }
        item { Button(onClick = {
         val correct = MathGames.isCorrect(current, gameInput)
         feedback(correct); gameFeedback = if (correct) "🎉 Well done!" else "💡 Try another answer."
        }, modifier = Modifier.fillMaxWidth()) { Text("Check answer") } }
        if (gameFeedback.isNotBlank()) item { Text(gameFeedback) }
        item { OutlinedButton(onClick = { game = MathGames.generate(grade); gameInput = ""; gameFeedback = "" }, modifier = Modifier.fillMaxWidth()) { Text("Next puzzle →") } }
       } else if (page == "rewards") {
        item { Hero("🏆 My rewards", "Every lesson is a new achievement!") }
        item { Section("⭐ " + stars + " stars collected") }
        item { Text("Stars are saved on this device. Replay topics to improve your best score.") }
        item { Text("Completed topics: " + LearningContent.allLessons.count { store.stars(it.id) > 0 }) }
       } else if (page == "settings") {
        item { Hero("⚙ Settings", "Make learning comfortable") }
        item {
         Card(colors = CardDefaults.cardColors(containerColor = Color.White)) {
          Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
           Column(Modifier.weight(1f)) {
            Text("🔊 Answer sounds", style = MaterialTheme.typography.titleMedium)
            Text("Short original feedback tones. No background music yet.", style = MaterialTheme.typography.bodySmall)
           }
           Switch(checked = sound, onCheckedChange = { sound = it; store.setSoundEnabled(it) })
          }
         }
        }
        item { Text("Works offline. No child account or internet permission.", style = MaterialTheme.typography.bodyMedium) }
        item { OutlinedButton(onClick = { page = "parent"; parentUnlocked = false }) { Text("👨‍👩‍👧 Parent area") } }
       } else if (page == "parent") {
        item { Hero("👨‍👩‍👧 Parent area", "Adults only • local learning information") }
        if (!parentUnlocked) {
         item { Text("Please solve: " + challenge.first + " + " + challenge.second + " = ?", style = MaterialTheme.typography.titleLarge) }
         item { OutlinedTextField(parentInput, { parentInput = it.filter(Char::isDigit).take(3) }, label = { Text("Answer") }, singleLine = true) }
         item { Button(onClick = {
          parentUnlocked = parentInput.toIntOrNull() == challenge.answer
          if (!parentUnlocked) { challenge = ParentChallenge.generate(); parentInput = "" }
         }) { Text("Unlock parent information") } }
        } else {
         item { Section("Learning overview") }
         item { Text("Total stars: " + stars) }
         item { Text("Completed topics: " + LearningContent.allLessons.count { store.stars(it.id) > 0 }) }
         item { Text("Progress is stored only on this device. This arithmetic gate is not a secure adult identity check.") }
        }
        item { OutlinedButton(onClick = { goHome() }) { Text("← Home") } }
       }
      }
     }
    }
   }
  }
 }
}

@Composable
private fun Hero(title: String, subtitle: String) {
 Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFE0EDFF)), shape = RoundedCornerShape(22.dp)) {
  Column(Modifier.fillMaxWidth().padding(20.dp)) {
   Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = ink)
   Spacer(Modifier.height(7.dp))
   Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = ink)
  }
 }
}

@Composable
private fun Section(title: String) {
 Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = ink)
}
