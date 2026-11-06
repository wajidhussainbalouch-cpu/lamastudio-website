package pk.lamastudio.iqtest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.ui.res.painterResource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import kotlinx.coroutines.launch
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val bg = Color(0xFF080F2B)
private val accent = Color(0xFFAB8BFF)
private val card = Color(0xFF1A2548)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val prefs = getSharedPreferences("iq_progress", MODE_PRIVATE)
        setContent {
            var level by remember { mutableIntStateOf(0) }
            var visualMode by remember { mutableStateOf(false) }
            var selectedModule by remember { mutableStateOf("Number Logic") }
            var infoPage by remember { mutableStateOf("") }
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
            val scope = rememberCoroutineScope()
            val uriHandler = LocalUriHandler.current
            var question by remember { mutableIntStateOf(0) }
            var score by remember { mutableIntStateOf(0) }
            var selected by remember { mutableIntStateOf(-1) }
            var showHint by remember { mutableStateOf(false) }
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
              ModalNavigationDrawer(drawerState = drawerState, drawerContent = {
                ModalDrawerSheet(drawerContainerColor = card, modifier = Modifier.fillMaxWidth(0.88f)) {
                    Row(modifier = Modifier.fillMaxWidth().background(Brush.horizontalGradient(listOf(Color(0xFF30206C), Color(0xFF102C61)))).padding(18.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Image(painterResource(R.drawable.ic_lama_iq), contentDescription = "Lama IQ Test logo", modifier = Modifier.size(60.dp))
                        Column { Text("LAMA IQ TEST", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 19.sp)
                            Text("Brain Training Academy", color = accent, fontSize = 12.sp) }
                    }
                    HorizontalDivider(color = accent.copy(alpha = 0.35f))
                    listOf(Triple("Number Logic", "🔢", "Numbers and sequences"), Triple("Visual Patterns", "🔷", "Shapes and figures"), Triple("Memory", "🧠", "Remember and recall"), Triple("Attention", "🎯", "Focus and accuracy"), Triple("Advanced Reasoning", "💡", "Logic and problem solving")).forEach { (module, symbol, detail) ->
                        NavigationDrawerItem(icon = { Text(symbol, fontSize = 23.sp) }, label = { Column { Text(module, fontWeight = FontWeight.SemiBold); Text(detail, fontSize = 11.sp, color = Color.LightGray) } }, selected = selectedModule == module && infoPage.isEmpty(),
                            onClick = {
                                selectedModule = module; infoPage = ""; visualMode = module == "Visual Patterns";
                                level = 0; question = 0; selected = -1; score = 0
                                scope.launch { drawerState.close() }
                            })
                    }
                    HorizontalDivider()
                    listOf("Privacy" to "🛡️", "About" to "ℹ️", "Version" to "🔄", "Lama Studio Website" to "🌐").forEach { (item, symbol) ->
                        NavigationDrawerItem(icon = { Text(symbol, fontSize = 20.sp) }, label = { Text(if (item == "Version") "Version & Updates" else item) }, selected = infoPage == item, onClick = {
                            if (item == "Lama Studio Website") uriHandler.openUri("https://www.lamastudio.pk/")
                            else { infoPage = item; visualMode = false; level = 0 }
                            scope.launch { drawerState.close() }
                        })
                    }
                    HorizontalDivider(color = accent.copy(alpha = 0.3f))
                    Text("A project of LAMA STUDIO", color = accent, fontSize = 12.sp, modifier = Modifier.padding(start = 20.dp, top = 12.dp))
                    Text("Software • Education • Innovation", color = Color.LightGray, fontSize = 11.sp, modifier = Modifier.padding(start = 20.dp))
                }
              }) {
                Column(
                    Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF111C48), bg, bg))).verticalScroll(rememberScrollState()).padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    FilledTonalButton(onClick = { scope.launch { drawerState.open() } }, colors = ButtonDefaults.filledTonalButtonColors(containerColor = Color(0xFF30245F))) { Text("☰  Modules & Settings", color = Color.White) }
                    Column(modifier = Modifier.fillMaxWidth().background(Brush.linearGradient(listOf(Color(0xFF28316E), Color(0xFF17234E), Color(0xFF301A63))), RoundedCornerShape(24.dp)).padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Image(painterResource(R.drawable.ic_lama_iq), contentDescription = "Lama IQ Test logo", modifier = Modifier.size(72.dp))
                            Column {
                                Text("LAMA STUDIO", color = accent, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Brain Training Academy", color = Color.LightGray, fontSize = 12.sp)
                            }
                        }
                        Text("Lama IQ Test", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                        Text("Brain training • Logic • Patterns", color = Color(0xFFE3DAFF), fontSize = 14.sp)
                    }
                    when {
                        infoPage.isNotEmpty() -> {
                            Text(infoPage, color = Color.White, fontSize = 25.sp)
                            Text(when(infoPage) {
                                "Privacy" -> "This offline test build stores level progress on your device. It does not require an account or upload answers. No advertising SDK is included in this build. A full public privacy policy is required before release."
                                "About" -> "Lama IQ Test is an educational brain-training practice app from Lama Studio. Scores are not clinical or standardized IQ measurements."
                                else -> "Version 0.1.0 • Debug testing build. App updates are provided through verified GitHub builds until an official release."
                            }, color = Color.LightGray)
                            Button(onClick = { infoPage = "" }) { Text("Back to modules") }
                        }
                        visualMode -> VisualChallengeScreen(level = if (level == 0) 1 else level, onExit = { visualMode = false; selectedModule = "Number Logic"; level = 0 })
                        selectedModule == "Memory" -> MemoryChallengeScreen(onExit = { selectedModule = "Number Logic"; level = 0 })
                        level == 0 -> {
                            Text(selectedModule, color = accent, fontSize = 20.sp)
                            if (selectedModule != "Number Logic") {
                                Text("This module is being prepared with reviewed, non-repeating questions. It is not yet available in this testing build.", color = Color.LightGray)
                            } else {
                            Text("Choose a level", color = Color.White, fontSize = 22.sp)
                            Button(onClick = { visualMode = true }, modifier = Modifier.fillMaxWidth()) { Text("Play visual pattern challenges • 5 languages") }
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
                                            if (index == item.correct) { selected = index; score++ }
                                            else showHint = true
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(containerColor = if (selected == index) Color(0xFF14532D) else Color.Transparent)
                                ) { Text((if (selected == index) "✓  " else "") + answer, modifier = Modifier.padding(vertical = 6.dp), color = if (selected == index) Color(0xFF86EFAC) else Color.White) }
                            }
                            if (showHint && selected == -1) Text("Hint: consider the relationship between the clues, then try another choice.", color = Color(0xFFFDE68A))
                            if (selected >= 0) {
                                Text("✓ Correct!", color = Color(0xFF86EFAC), fontWeight = FontWeight.Bold)
                                Text(item.explanation, color = Color.LightGray)
                                Button(onClick = { question++; selected = -1; showHint = false }, modifier = Modifier.align(Alignment.End)) {
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
}
