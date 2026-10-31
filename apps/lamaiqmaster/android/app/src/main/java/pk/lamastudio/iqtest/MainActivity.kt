package pk.lamastudio.iqtest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class Puzzle(val prompt: String, val options: List<String>, val answer: Int, val explanation: String)

private val puzzles = listOf(
    Puzzle("Which number completes the sequence? 2, 4, 8, 16, ?", listOf("24", "30", "32", "36"), 2, "Each number doubles."),
    Puzzle("Which item is different?", listOf("Square", "Triangle", "Circle", "Cube"), 3, "A cube is three-dimensional."),
    Puzzle("If all Zibs are Loms and all Loms are Nars, are all Zibs Nars?", listOf("Yes", "No", "Not enough information", "Only sometimes"), 0, "The group relationships are transitive."),
    Puzzle("What comes next? A, C, F, J, O, ?", listOf("S", "T", "U", "V"), 2, "Letter positions increase by 2, 3, 4, 5, then 6."),
    Puzzle("Which number is missing? 3, 6, 11, 18, ?", listOf("25", "27", "29", "31"), 1, "Differences increase by two: 3, 5, 7, 9.")
)

private val navy = Color(0xFF0C1023)
private val violet = Color(0xFF9B79FF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { IQApp() }
    }
}

@Composable
fun IQApp() {
    var started by remember { mutableStateOf(false) }
    var index by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var selected by remember { mutableIntStateOf(-1) }
    val complete = started && index >= puzzles.size
    MaterialTheme(colorScheme = darkColorScheme(primary = violet, background = navy, surface = Color(0xFF1B2140))) {
        Column(
            Modifier.fillMaxSize().background(navy).padding(22.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Spacer(Modifier.height(18.dp))
            Text("LAMA STUDIO", color = violet, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Text("Lama IQ Test", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
            Text("Train your brain. Challenge your speed.", color = Color(0xFFBFC4DC))
            when {
                !started -> {
                    Surface(shape = RoundedCornerShape(24.dp), color = Color(0xFF1B2140)) {
                        Column(Modifier.fillMaxWidth().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            Text("BRAIN CHALLENGE", color = violet, fontWeight = FontWeight.Bold)
                            Text("5 quick reasoning puzzles", fontSize = 24.sp, color = Color.White)
                            Text("Practice patterns, logic and attention. Scores reflect only this in-app challenge, not clinical IQ.", color = Color(0xFFCED2E5))
                            Button(onClick = { started = true; index = 0; score = 0; selected = -1 }, modifier = Modifier.fillMaxWidth()) { Text("Start challenge") }
                        }
                    }
                }
                complete -> {
                    Text("Challenge complete!", fontSize = 25.sp, color = Color.White)
                    Text("Your score: $score / ${puzzles.size}", fontSize = 22.sp, color = violet)
                    Text("This is a practice score, not a standardized IQ result.", color = Color.LightGray)
                    Button(onClick = { started = false; index = 0; score = 0; selected = -1 }) { Text("Play again") }
                }
                else -> {
                    val puzzle = puzzles[index]
                    LinearProgressIndicator(progress = { index.toFloat() / puzzles.size }, modifier = Modifier.fillMaxWidth())
                    Text("QUESTION ${index + 1} OF ${puzzles.size}", color = violet)
                    Text(puzzle.prompt, color = Color.White, fontSize = 23.sp, lineHeight = 30.sp)
                    puzzle.options.forEachIndexed { i, option ->
                        OutlinedButton(
                            onClick = { if (selected == -1) { selected = i; if (i == puzzle.answer) score++ } },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = selected == -1,
                            shape = RoundedCornerShape(12.dp)
                        ) { Text(option, modifier = Modifier.padding(6.dp), textAlign = TextAlign.Center) }
                    }
                    if (selected != -1) {
                        Text(if (selected == puzzle.answer) "Correct!" else "Not quite.", color = violet, fontWeight = FontWeight.Bold)
                        Text(puzzle.explanation, color = Color.LightGray)
                        Button(onClick = { index++; selected = -1 }, modifier = Modifier.align(Alignment.End)) {
                            Text(if (index == puzzles.lastIndex) "See results" else "Next")
                        }
                    }
                }
            }
        }
    }
}
