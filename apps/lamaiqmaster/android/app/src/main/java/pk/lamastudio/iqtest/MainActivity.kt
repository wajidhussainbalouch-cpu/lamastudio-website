package pk.lamastudio.iqtest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
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
                ModalDrawerSheet(drawerContainerColor = Color(0xFF111B43), modifier = Modifier.fillMaxWidth(0.90f)) {
                    Row(modifier = Modifier.fillMaxWidth().background(Brush.horizontalGradient(listOf(Color(0xFF412181), Color(0xFF0D326F)))).padding(18.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Image(painterResource(R.drawable.ic_lama_iq), contentDescription = "Lama IQ Test logo", modifier = Modifier.size(78.dp))
                        Column { Text("LAMA IQ TEST", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                            Text("Brain Training Academy", color = accent, fontSize = 12.sp) }
                    }
                    HorizontalDivider(color = accent.copy(alpha = 0.35f))
                    listOf(Triple("Number Logic", "🧮", "Numbers • Series • Calculations"), Triple("Visual Patterns", "🧊", "Shapes • Sequences • Figures"), Triple("Memory", "🧠", "Recall • Compare • Remember"), Triple("Attention", "🎯", "Focus • Speed • Accuracy"), Triple("Advanced Reasoning", "💡", "Logic • Analysis • Problem Solving")).forEach { (module, symbol, detail) ->
                        NavigationDrawerItem(icon = { Text(symbol, fontSize = 29.sp) }, label = { Column { Text(module, fontWeight = FontWeight.Bold, fontSize = 16.sp); Text(detail, fontSize = 12.sp, color = Color(0xFFCBD5F5)) } }, selected = selectedModule == module && infoPage.isEmpty(),
                            colors = NavigationDrawerItemDefaults.colors(selectedContainerColor = Color(0xFF6032BD), unselectedContainerColor = Color.Transparent, selectedTextColor = Color.White, unselectedTextColor = Color.White),
                            onClick = {
                                selectedModule = module; infoPage = ""; visualMode = module == "Visual Patterns";
                                level = 0; question = 0; selected = -1; score = 0
                                scope.launch { drawerState.close() }
                            })
                    }
                    HorizontalDivider()
                    listOf("Privacy" to "🛡️", "About" to "ⓘ", "Version" to "🔄", "Lama Studio Website" to "🌐").forEach { (item, symbol) ->
                        NavigationDrawerItem(icon = { Text(symbol, fontSize = 20.sp) }, label = { Text(when(item) { "Privacy" -> "Privacy Policy"; "About" -> "About Lama IQ Test"; "Version" -> "Check for Update"; else -> item }, fontWeight = FontWeight.Medium) }, selected = infoPage == item, onClick = {
                            if (item == "Lama Studio Website") uriHandler.openUri("https://www.lamastudio.pk/")
                            else { infoPage = item; visualMode = false; level = 0 }
                            scope.launch { drawerState.close() }
                        })
                    }
                    HorizontalDivider(color = accent.copy(alpha = 0.3f))
                    Text("A project of LAMA STUDIO", color = accent, fontSize = 12.sp, modifier = Modifier.padding(start = 20.dp, top = 12.dp))
                    Text("Software • Education • Innovation", color = Color.LightGray, fontSize = 11.sp, modifier = Modifier.padding(start = 20.dp))
                    Spacer(Modifier.height(20.dp))
                    Text("🏔️   🦙   LAMA STUDIO", color = Color(0xFFDBB8FF), fontSize = 22.sp, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth().background(Brush.horizontalGradient(listOf(Color(0xFF241548), Color(0xFF3E227A), Color(0xFF111B43))), RoundedCornerShape(18.dp)).padding(20.dp))
                }
              }) {
                Column(
                    Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF111C48), bg, bg))).verticalScroll(rememberScrollState()).padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        FilledTonalButton(onClick = { scope.launch { drawerState.open() } }, colors = ButtonDefaults.filledTonalButtonColors(containerColor = Color(0xFF452282))) { Text("☰  Modules & Settings", color = Color.White) }
                        Text("♧", color = Color(0xFFE9D5FF), fontSize = 25.sp)
                    }
                    Column(modifier = Modifier.fillMaxWidth().background(Brush.linearGradient(listOf(Color(0xFF183E89), Color(0xFF101C50), Color(0xFF4920A0))), RoundedCornerShape(24.dp)).padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Image(painterResource(R.drawable.ic_lama_iq), contentDescription = "Lama IQ Test logo", modifier = Modifier.size(72.dp))
                            Column {
                                Text("LAMA STUDIO", color = accent, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Brain Training Academy", color = Color.LightGray, fontSize = 12.sp)
                            }
                        }
                        Text("Lama IQ Test", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                        Text("Brain training • Logic • Patterns", color = Color(0xFFE3DAFF), fontSize = 14.sp)
                        Text("🧠  Build your reasoning skills", color = Color(0xFF8BE9FF), fontSize = 13.sp)
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
                        selectedModule == "Attention" -> AttentionChallengeScreen(onExit = { selectedModule = "Number Logic"; level = 0 })
                        level == 0 -> {
                            Text(selectedModule, color = accent, fontSize = 20.sp)
                            if (selectedModule != "Number Logic") {
                                Text("This module is being prepared with reviewed, non-repeating questions. It is not yet available in this testing build.", color = Color.LightGray)
                            } else {
                            Text("Choose a level", color = Color.White, fontSize = 22.sp)
                            Button(onClick = { selectedModule = "Visual Patterns"; visualMode = true }, modifier = Modifier.fillMaxWidth().heightIn(min = 60.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C3AED)), shape = RoundedCornerShape(24.dp)) { Text("🎮  Visual pattern challenges     ❯", color = Color.White, fontWeight = FontWeight.Bold) }
                            Text("Score at least 7 of 10 to unlock the next level. Your progress is saved offline.", color = Color.LightGray)
                            (1..5).forEach { i ->
                                val best = prefs.getInt("best_$i", 0)
                                Button(
                                    enabled = i <= unlocked,
                                    onClick = { level = i; question = 0; score = 0; selected = -1 },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(22.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = if (i <= unlocked) Color(0xFFB18AF5) else Color(0xFF252D50), disabledContainerColor = Color(0xFF252D50), contentColor = Color(0xFF10152E), disabledContentColor = Color(0xFFCED2E8))
                                ) {
                                    Row(Modifier.fillMaxWidth().padding(vertical = 9.dp, horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Text(if (i <= unlocked) "🏆" else "🔒", fontSize = 28.sp)
                                        Column(Modifier.weight(1f)) {
                                            Text("Level $i", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                            Text(listOf("Starter","Explorer","Thinker","Expert","Master")[i-1], fontSize = 14.sp)
                                            Text(if (i <= unlocked) "Best: $best / 10" else "Locked", fontSize = 12.sp)
                                        }
                                        Text(if (i <= unlocked) "▶" else "›", fontSize = 23.sp)
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
