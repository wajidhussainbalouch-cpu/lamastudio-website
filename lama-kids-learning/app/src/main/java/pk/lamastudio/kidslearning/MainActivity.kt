package pk.lamastudio.kidslearning
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private val grades = listOf("Nursery","KG") + (1..8).map { "Class " + it }
private val subjects = listOf("English","Urdu","Mathematics","Science")
class MainActivity : ComponentActivity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val store = ProgressStore(this)
  setContent {
   MaterialTheme {
    var grade by remember { mutableStateOf("Class 1") }
    var subject by remember { mutableStateOf("English") }
    var lesson by remember { mutableStateOf<Lesson?>(null) }
    var answer by remember { mutableIntStateOf(-1) }
    var stars by remember { mutableIntStateOf(store.totalStars()) }
    var parentOpen by remember { mutableStateOf(false) }
    var unlocked by remember { mutableStateOf(false) }
    var challenge by remember { mutableStateOf(ParentChallenge.generate()) }
    var parentInput by remember { mutableStateOf("") }
    var game by remember { mutableStateOf<MathChallenge?>(null) }
    var gameInput by remember { mutableStateOf("") }
    var gameFeedback by remember { mutableStateOf("") }
    Scaffold(topBar = { Surface(tonalElevation = 3.dp) { Text("Lama Kids Learning - Stars: " + stars, Modifier.fillMaxWidth().padding(18.dp), style = MaterialTheme.typography.titleLarge) } }) { padding ->
     LazyColumn(Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
      if (parentOpen) {
       item { Text("Parent area", style = MaterialTheme.typography.headlineSmall) }
       if (!unlocked) {
        item { Text("Adults: " + challenge.first + " + " + challenge.second + " = ?") }
        item { OutlinedTextField(parentInput, { parentInput = it.filter(Char::isDigit).take(3) }, label = { Text("Answer") }) }
        item { Button(onClick = {
         unlocked = parentInput.toIntOrNull() == challenge.answer
         if (!unlocked) { challenge = ParentChallenge.generate(); parentInput = "" }
        }) { Text("Unlock") } }
       } else {
        item { Text("Total stars: " + stars) }
        item { Text("Progress stays on this device. No child account or internet access.") }
       }
       item { OutlinedButton(onClick = { parentOpen = false; unlocked = false; parentInput = ""; challenge = ParentChallenge.generate() }) { Text("Back") } }
      } else if (game != null) {
       val currentGame = game!!
       item { Text("Math Challenge", style = MaterialTheme.typography.headlineSmall) }
       item { Text(currentGame.question(), style = MaterialTheme.typography.titleLarge) }
       item { OutlinedTextField(gameInput, { gameInput = it.filter(Char::isDigit).take(5) }, label = { Text("Your answer") }) }
       item { Button(onClick = { gameFeedback = if (MathGames.isCorrect(currentGame,gameInput)) "Great work!" else "Try again!" }) { Text("Check answer") } }
       if (gameFeedback.isNotBlank()) item { Text(gameFeedback) }
       item { Button(onClick = { game = MathGames.generate(grade); gameInput = ""; gameFeedback = "" }) { Text("Next challenge") } }
       item { OutlinedButton(onClick = { game = null; gameInput = ""; gameFeedback = "" }) { Text("Back") } }
      } else if (lesson != null) {
       val current = lesson!!
       val question = current.questions.first()
       item { Text(current.title, style = MaterialTheme.typography.headlineSmall) }
       item { Text(current.explanation) }
       item { Text(question.prompt, style = MaterialTheme.typography.titleMedium) }
       items(question.answers.size) { i ->
        OutlinedButton(onClick = { answer = i }, Modifier.fillMaxWidth()) { Text((if (answer == i) "Selected: " else "") + question.answers[i]) }
       }
       if (answer >= 0) {
        item { Text((if (QuizEngine.isCorrect(question,answer)) "Correct! " else "Review: ") + question.explanation) }
        item { Button(onClick = {
         store.complete(current.id, QuizEngine.isCorrect(question,answer))
         stars = store.totalStars(); lesson = null; answer = -1
        }) { Text("Save progress") } }
       }
       item { OutlinedButton(onClick = { lesson = null; answer = -1 }) { Text("Back") } }
      } else {
       item { Text("Learn, play and grow!", style = MaterialTheme.typography.headlineSmall) }
       item { Text("Choose class") }
       items(grades.size) { i -> OutlinedButton(onClick = { grade = grades[i] }, Modifier.fillMaxWidth()) { Text((if (grade == grades[i]) "Selected: " else "") + grades[i]) } }
       item { Text("Choose subject") }
       items(subjects.size) { i -> OutlinedButton(onClick = { subject = subjects[i] }, Modifier.fillMaxWidth()) { Text((if (subject == subjects[i]) "Selected: " else "") + subjects[i]) } }
       val available = LearningContent.forGradeAndSubject(grade,subject)
       item { Text("Lessons", style = MaterialTheme.typography.titleLarge) }
       if (available.isEmpty()) item { Text("Lessons for this selection are being prepared.") }
       items(available.size) { i ->
        val current = available[i]
        Button(onClick = { lesson = current; answer = -1 }, Modifier.fillMaxWidth()) { Text(current.title + " - Stars: " + store.stars(current.id)) }
       }
       item { Button(onClick = { game = MathGames.generate(grade); gameInput = ""; gameFeedback = "" }, Modifier.fillMaxWidth()) { Text("Play Math Challenge") } }
       item { OutlinedButton(onClick = { parentOpen = true }, Modifier.fillMaxWidth()) { Text("Parent area") } }
      }
     }
    }
   }
  }
 }
}
