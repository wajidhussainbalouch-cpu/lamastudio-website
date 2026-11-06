package pk.lamastudio.iqtest

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.random.Random

/**
 * Offline attention rounds. Correct answers are computed from the actual visible
 * symbol grid, never stored as unchecked labels. No two grids in a session repeat.
 */
internal data class AttentionRound(val grid: List<String>, val target: String, val choices: List<Int>, val correct: Int) {
    init {
        require(grid.size in 20..60 && choices.size == 4 && choices.distinct().size == 4)
        require(choices[correct] == grid.count { it == target })
    }
}

internal fun createAttentionRounds(seed: Int = 20261106): List<AttentionRound> {
    val rng = Random(seed)
    val symbols = listOf("◆", "●", "▲", "■", "★", "⬟")
    val seen = mutableSetOf<String>()
    return (0 until 10).map { round ->
        val target = symbols[round % symbols.size]
        val size = 25 + round * 3
        var grid: List<String>
        do {
            grid = List(size) { symbols[rng.nextInt(symbols.size)] }
        } while (!seen.add(grid.joinToString("")))
        val answer = grid.count { it == target }
        val alternatives = (0..size).filter { it != answer }.shuffled(rng).take(3)
        val options = (alternatives + answer).shuffled(rng)
        AttentionRound(grid, target, options, options.indexOf(answer))
    }
}

@Composable
fun AttentionChallengeScreen(onExit: () -> Unit) {
    val rounds = remember { createAttentionRounds() }
    var index by remember { mutableIntStateOf(0) }
    var selected by remember(index) { mutableIntStateOf(-1) }
    var hint by remember(index) { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    val accent = Color(0xFFB49AFF)
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        TextButton(onClick = onExit) { Text("‹ Modules") }
        if (index == rounds.size) {
            Text("Attention practice complete", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Bold)
            Text("$score / 10", color = accent, fontSize = 34.sp)
            Text("Practice score, not a standardized IQ measurement.", color = Color.LightGray)
            Button(onClick = onExit) { Text("Back to modules") }
        } else {
            val round = rounds[index]
            Text("Attention • ${index + 1}/10", color = accent, fontWeight = FontWeight.Bold)
            LinearProgressIndicator(progress = { index / 10f }, modifier = Modifier.fillMaxWidth())
            Text("How many ${round.target} symbols can you find?", color = Color.White, fontSize = 21.sp)
            Surface(color = Color(0xFF202B55), shape = RoundedCornerShape(18.dp)) {
                Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    round.grid.chunked(5).forEach { line ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            line.forEach { Text(it, color = Color.White, fontSize = 24.sp) }
                        }
                    }
                }
            }
            round.choices.forEachIndexed { option, value ->
                val correct = selected == option
                OutlinedButton(
                    enabled = selected == -1,
                    onClick = { if (selected == -1) { if (option == round.correct) { selected = option; score++ } else hint = true } },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = if (correct) Color(0xFF14532D) else Color.Transparent)
                ) { Text((if (correct) "✓ " else "") + value, color = if (correct) Color(0xFF86EFAC) else Color.White) }
            }
            if (hint && selected == -1) Text("Hint: scan each row from left to right, then count again.", color = Color(0xFFFDE68A))
            if (selected >= 0) {
                Text("✓ Correct!", color = Color(0xFF86EFAC))
                Button(onClick = { index++ }, modifier = Modifier.align(Alignment.End)) { Text(if (index == 9) "Results" else "Next") }
            }
        }
    }
}
