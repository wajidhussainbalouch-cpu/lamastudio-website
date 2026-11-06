package pk.lamastudio.iqtest

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.random.Random

/** Two-phase offline memory practice: the digits are hidden before any answers appear. */
private data class MemoryRound(val digits: String, val position: Int, val options: List<String>, val correct: Int)

private fun memoryRounds(seed: Int): List<MemoryRound> {
    val random = Random(seed)
    return (0 until 10).map { round ->
        val size = 4 + round / 3
        val digits = (0 until size).map { random.nextInt(10) }.joinToString("")
        val position = random.nextInt(size)
        val answer = digits[position].digitToInt()
        val distractors = (0..9).filter { it != answer }.shuffled(random).take(3)
        val options = (distractors + answer).shuffled(random).map(Int::toString)
        MemoryRound(digits, position + 1, options, options.indexOf(answer.toString()))
    }
}

@Composable
fun MemoryChallengeScreen(onExit: () -> Unit) {
    val rounds = remember { memoryRounds(20261106) }
    var index by remember { mutableIntStateOf(0) }
    var showingDigits by remember(index) { mutableStateOf(true) }
    var selected by remember(index) { mutableIntStateOf(-1) }
    var hint by remember(index) { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    val purple = Color(0xFFAB8BFF)
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        TextButton(onClick = onExit) { Text("‹ Modules") }
        if (index == rounds.size) {
            Text("Memory practice complete", color = Color.White, fontSize = 24.sp)
            Text("Score: $score / 10", color = purple, fontSize = 30.sp)
            Text("Practice improves familiarity with memory tasks; this is not a clinical IQ measurement.", color = Color.LightGray)
            Button(onClick = onExit) { Text("Back to modules") }
        } else {
            val round = rounds[index]
            Text("Memory • "+(index + 1)+"/10", color = purple, fontWeight = FontWeight.Bold)
            LinearProgressIndicator(progress = { index / 10f }, modifier = Modifier.fillMaxWidth())
            if (showingDigits) {
                Text("Memorize this number, then hide it before answering.", color = Color.White)
                Text(round.digits, fontSize = 34.sp, color = Color.White, letterSpacing = 5.sp)
                Button(onClick = { showingDigits = false }, modifier = Modifier.fillMaxWidth()) { Text("I've memorized it — hide number") }
            } else {
                Text("What digit was at position "+round.position+" (from the left)?", color = Color.White, fontSize = 21.sp)
                round.options.forEachIndexed { option, value ->
                    val correct = selected == option && option == round.correct
                    OutlinedButton(
                        enabled = selected == -1,
                        onClick = {
                            if (selected == -1) {
                                if (option == round.correct) { selected = option; score++ }
                                else hint = true
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = if (correct) Color(0xFF14532D) else Color.Transparent)
                    ) {
                        Text((if (correct) "✓ " else "") + value, color = if (correct) Color(0xFF86EFAC) else Color.White)
                    }
                }
                if (hint && selected == -1) Text("Hint: picture the digits from left to right and count positions carefully. Try again.", color = Color(0xFFFDE68A))
                if (selected >= 0) {
                    Text("✓ Correct!", color = Color(0xFF86EFAC))
                    Button(onClick = { index++ }, modifier = Modifier.align(Alignment.End)) { Text(if (index == 9) "See results" else "Next") }
                }
            }
        }
    }
}
