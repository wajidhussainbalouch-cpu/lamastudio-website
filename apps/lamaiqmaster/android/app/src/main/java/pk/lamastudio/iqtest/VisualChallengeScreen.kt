package pk.lamastudio.iqtest

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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VisualChallengeScreen(level: Int, onExit: () -> Unit) {
    var language by remember { mutableStateOf(GameLanguage.ENGLISH) }
    var index by remember(level) { mutableIntStateOf(0) }
    var selected by remember(level) { mutableIntStateOf(-1) }
    var score by remember(level) { mutableIntStateOf(0) }
    val puzzles = remember(level) { VisualPuzzleFactory.create(level, count = 10, seed = 1207) }
    val tr: (String) -> String = { GameText.get(it, language) }
    Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
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
                OutlinedButton(onClick = { if (selected == -1) { selected = i; if (i == p.answer) score++ } },
                    enabled = selected == -1, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp)) {
                    Text(choice, fontSize = 28.sp, textAlign = TextAlign.Center)
                }
            }
            if (selected >= 0) {
                Text(tr(if (selected == p.answer) "correct" else "wrong"), color = Color(0xFFAB8BFF))
                Text(tr(p.explanationKey), color = Color.LightGray)
                Button(onClick = { index++; selected = -1 }, modifier = Modifier.align(Alignment.End)) { Text(tr("continue")) }
            }
            TextButton(onClick = onExit) { Text(tr("back")) }
        }
    }
}
