package pk.lamastudio.iqtest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val bg = Color(0xFF0C1023)
private val accent = Color(0xFFAB8BFF)
private val card = Color(0xFF1B2140)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val prefs = getSharedPreferences("iq_progress", MODE_PRIVATE)
        setContent {
            var level by remember { mutableIntStateOf(0) }
            var question by remember { mutableIntStateOf(0) }
            var score by remember { mutableIntStateOf(0) }
            var selected by remember { mutableIntStateOf(-1) }
            var unlocked by remember { mutableIntStateOf(prefs.getInt("unlocked", 1)) }
            val questions = remember(level) { ChallengeBank.forLevel(level) }
            val finished = level != 0 && question >= questions.size
            LaunchedEffect(finished) {
                if (finished) {
                    val previous = prefs.getInt("best_$level", 0)
                    if (score > previous) prefs.edit().putInt("best_$level", score).apply()
                    if (score >= 7 && level < 5 && unlocked <= level) {
                        unlocked = level + 1
                        prefs.edit().putInt("unlocked", unlocked).apply()
                    }
                }
            }
            MaterialTheme(colorScheme = darkColorScheme(primary = accent, background = bg, surface = card)) {
                Column(
                    Modifier.fillMaxSize().background(bg).verticalScroll(rememberScrollState()).padding(22.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Spacer(Modifier.height(10.dp))
                    Text("LAMA STUDIO", color = accent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text("Lama IQ Test", color = Color.White, fontSize = 31.sp, fontWeight = FontWeight.Bold)
                    Text("Brain training • Logic • Patterns", color = Color(0xFFC7C9DD))
                    when {
                        level == 0 -> {
                            Text("Choose a level", color = Color.White, fontSize = 22.sp)
                            Text("Score at least 7 of 10 to unlock the next level. Your progress is saved offline.", color = Color.LightGray)
                            (1..5).forEach { i ->
                                val best = prefs.getInt("best_$i", 0)
                                Button(
                                    enabled = i <= unlocked,
                                    onClick = { level = i; question = 0; score = 0; selected = -1 },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp)
                                ) {
                                    Column(Modifier.fillMaxWidth().padding(8.dp)) {
                                        Text("Level $i  •  " + listOf("Starter","Explorer","Thinker","Expert","Master")[i-1], fontWeight = FontWeight.Bold)
                                        Text(if (i <= unlocked) "Best: $best / 10" else "Locked — complete previous level")
                                    }
                                }
                            }
                            Text("Practice scores are not standardized or clinical IQ measurements.", color = Color.Gray, fontSize = 12.sp)
                        }
                        finished -> {
                            Surface(color = card, shape = RoundedCornerShape(20.dp)) {
                                Column(Modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Text("Level $level complete", color = Color.White, fontSize = 24.sp)
                                    Text("$score / ${questions.size}", color = accent, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                                    Text(if (score >= 7) "Great work! Next level unlocked (if available)." else "Keep practicing. You need 7 correct answers to advance.", color = Color.White)
                                    Button(onClick = { level = 0; question = 0; score = 0; selected = -1 }, modifier = Modifier.fillMaxWidth()) { Text("Back to levels") }
                                    OutlinedButton(onClick = { question = 0; score = 0; selected = -1 }, modifier = Modifier.fillMaxWidth()) { Text("Try again") }
                                }
                            }
                        }
                        else -> {
                            val item = questions[question]
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                TextButton(onClick = { level = 0; selected = -1 }) { Text("‹ Levels") }
                                Text("Level $level • ${question + 1}/${questions.size}", color = Color.White)
                            }
                            LinearProgressIndicator(progress = { question.toFloat() / questions.size }, modifier = Modifier.fillMaxWidth())
                            Text(item.category.uppercase(), color = accent, fontWeight = FontWeight.Bold)
                            Text(item.question, color = Color.White, fontSize = 23.sp, lineHeight = 30.sp)
                            item.choices.forEachIndexed { index, answer ->
                                OutlinedButton(
                                    enabled = selected == -1,
                                    onClick = {
                                        if (selected == -1) {
                                            selected = index
                                            if (index == item.correct) score++
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp)
                                ) { Text(answer, modifier = Modifier.padding(vertical = 6.dp)) }
                            }
                            if (selected >= 0) {
                                Text(if (selected == item.correct) "Correct!" else "Incorrect — the correct answer is ${item.choices[item.correct]}.", color = accent, fontWeight = FontWeight.Bold)
                                Text(item.explanation, color = Color.LightGray)
                                Button(onClick = { question++; selected = -1 }, modifier = Modifier.align(Alignment.End)) {
                                    Text(if (question == questions.lastIndex) "See results" else "Next question")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
