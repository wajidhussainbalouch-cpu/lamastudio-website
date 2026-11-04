package pk.lamastudio.iqtest

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

@Composable
fun VisualChallengeScreen(level: Int, onExit: () -> Unit) {
    var language by remember { mutableStateOf(GameLanguage.ENGLISH) }
    var index by remember(level) { mutableIntStateOf(0) }
    var selected by remember(level) { mutableIntStateOf(-1) }
    var score by remember(level) { mutableIntStateOf(0) }
    var hint by remember(level) { mutableStateOf(false) }
    val puzzles = remember(level) { VisualPuzzleFactory.create(level, count = 10, seed = 1207) }
    val tr: (String) -> String = { GameText.get(it, language) }
    Column(Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text(tr("language"), color = Color.LightGray)
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            GameLanguage.entries.take(3).forEach { lang ->
                TextButton(onClick = { language = lang }, contentPadding = PaddingValues(horizontal = 4.dp)) {
                    Text(lang.label, fontSize = 11.sp, color = if (language == lang) Color(0xFFAB8BFF) else Color.LightGray)
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            GameLanguage.entries.drop(3).forEach { lang ->
                TextButton(onClick = { language = lang }) { Text(lang.label, fontSize = 12.sp, color = if (language == lang) Color(0xFFAB8BFF) else Color.LightGray) }
            }
        }
        if (index >= puzzles.size) {
            Text("${tr("score")}: $score / ${puzzles.size}", color = Color.White, fontSize = 28.sp)
            Button(onClick = onExit) { Text(tr("back")) }
        } else {
            val p = puzzles[index]
            Text("${tr("visual")} • ${index + 1}/${puzzles.size}", color = Color(0xFFAB8BFF), fontWeight = FontWeight.Bold)
            Text(tr("next"), color = Color.White, fontSize = 23.sp)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) {
                p.sequence.forEach { shape ->
                    Text(shape, color = Color.White, fontSize = 32.sp)
                }
                Text("?", color = Color(0xFFAB8BFF), fontSize = 32.sp)
            }
            p.choices.forEachIndexed { i, choice ->
                val isCorrect = selected == i && i == p.answer
                val isWrong = selected == i && i != p.answer
                OutlinedButton(onClick = {
                    if (selected == -1) {
                        if (i == p.answer) { selected = i; score++ } else { hint = true }
                    }
                },
                    enabled = selected == -1, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = if (isCorrect) Color(0xFF14532D) else Color.Transparent)) {
                    Text((if (isCorrect) "✓  " else "") + choice, fontSize = 28.sp, textAlign = TextAlign.Center,
                        color = if (isCorrect) Color(0xFF86EFAC) else Color.White)
                }
            }
            if (hint && selected == -1) {
                Text("Hint: look for the order, direction or repeating cycle. Try again.", color = Color(0xFFFDE68A))
            }
            if (selected >= 0) {
                Text("✓ " + tr("correct"), color = Color(0xFF86EFAC))
                Text(tr(p.explanationKey), color = Color.LightGray)
                Button(onClick = { index++; selected = -1; hint = false }, modifier = Modifier.align(Alignment.End)) { Text(tr("continue")) }
            }
            TextButton(onClick = onExit) { Text(tr("back")) }
        }
    }
}
