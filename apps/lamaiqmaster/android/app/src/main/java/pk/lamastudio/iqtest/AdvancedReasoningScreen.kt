package pk.lamastudio.iqtest

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.random.Random

internal data class ReasoningRound(
    val id: String,
    val prompt: String,
    val choices: List<String>,
    val correctIndex: Int,
    val hint: String,
    val explanation: String
) {
    init {
        require(id.isNotBlank() && choices.size == 4 && choices.distinct().size == 4)
        require(correctIndex in 0..3 && hint.isNotBlank() && explanation.isNotBlank())
    }
}

private fun makeRound(id: String, prompt: String, answer: String, wrong: List<String>, hint: String, explanation: String, rng: Random): ReasoningRound {
    require(wrong.distinct().size >= 3 && answer !in wrong)
    val choices = (wrong.take(3) + answer).shuffled(rng)
    return ReasoningRound(id, prompt, choices, choices.indexOf(answer), hint, explanation)
}

/** Ten different reasoning mechanisms; answers are derived from each generated premise. */
internal fun createReasoningRounds(seed: Int = 20261106): List<ReasoningRound> {
    val r = Random(seed)
    val a = r.nextInt(3, 9)
    val b = r.nextInt(2, 7)
    val distance = r.nextInt(3, 10)
    val people = r.nextInt(4, 9)
    val all = r.nextInt(12, 25)
    val both = r.nextInt(2, 6)
    val left = r.nextInt(both + 2, both + 7)
    val right = r.nextInt(both + 2, both + 7)
    val sides = r.nextInt(4, 9)
    val blocks = r.nextInt(3, 8)
    val start = r.nextInt(10, 30)
    val step = r.nextInt(2, 7)
    val cycle = r.nextInt(2, 6)
    val price = r.nextInt(4, 11)
    val count = r.nextInt(2, 7)
    val ratio = r.nextInt(2, 6)
    val base = r.nextInt(3, 10)
    return listOf(
        makeRound("sum-product-$a-$b", "A machine doubles a number and then adds $b. It outputs ${2 * a + b}. What was the input?", "$a", listOf("${a+1}", "${a+2}", "${a-1}"), "Reverse the addition first, then reverse doubling.", "(${2*a+b} − $b) ÷ 2 = $a.", r),
        makeRound("route-$distance", "Walk $distance blocks north, then $distance blocks east. Which direction is the starting point from your destination?", "Southwest", listOf("Northeast", "Southeast", "Northwest"), "Reverse both movements.", "The start is south and west of the destination.", r),
        makeRound("rank-$people", "$people students stand in a row. Ali is third from the front. What is Ali's position from the back?", "${people-2}", listOf("${people-1}", "${people-3}", "$people"), "Positions from both ends add up to the total plus one.", "$people − 3 + 1 = ${people-2}.", r),
        makeRound("sets-$left-$right-$both", "$left children like apples, $right like oranges, and $both like both. How many like at least one?", "${left+right-both}", listOf("${left+right}", "${left+right-2*both}", "${left+right-both+1}"), "Children who like both were counted twice.", "$left + $right − $both = ${left+right-both}.", r),
        makeRound("polygon-$sides", "A polygon has $sides sides. How many diagonals does it have?", "${sides*(sides-3)/2}", listOf("${sides*(sides-1)/2}", "${sides*(sides-2)/2}", "${sides*(sides-3)/2+sides}"), "Each vertex connects to all except itself and its two neighbours; divide by two.", "$sides × ($sides − 3) ÷ 2 = ${sides*(sides-3)/2}.", r),
        makeRound("handshakes-$blocks", "$blocks people each shake hands once with every other person. How many handshakes occur?", "${blocks*(blocks-1)/2}", listOf("${blocks*(blocks-1)}", "${blocks*blocks}", "${blocks*(blocks+1)/2}"), "Each handshake involves two people.", "$blocks × ${blocks-1} ÷ 2 = ${blocks*(blocks-1)/2}.", r),
        makeRound("series-$start-$step", "Find the next number: $start, ${start+step}, ${start+2*step}, ${start+3*step}, ?", "${start+4*step}", listOf("${start+3*step}", "${start+5*step}", "${start+4*step+1}"), "Compare the differences between adjacent numbers.", "The difference is always $step.", r),
        makeRound("modular-$cycle-$base", "A lamp repeats a cycle of $cycle colours. If it starts at colour 1, what colour number is shown at position ${cycle*base+2}?", "2", listOf("1", "3", "$cycle"), "A complete cycle returns to the first colour.", "${cycle*base} is divisible by $cycle, so the remainder is 2.", r),
        makeRound("unit-$price-$count", "$count notebooks cost ${count*price} coins. How many coins do ${count+2} notebooks cost at the same rate?", "${(count+2)*price}", listOf("${count*price}", "${(count+1)*price}", "${(count+3)*price}"), "Find the price of one notebook first.", "Each notebook costs $price coins; ${count+2} cost ${(count+2)*price}.", r),
        makeRound("ratio-$ratio-$a", "Red and blue beads are in a $ratio:1 ratio. If there are $a blue beads, how many beads are there in total?", "${(ratio+1)*a}", listOf("${ratio*a}", "${(ratio+2)*a}", "${(ratio+1)*a+1}"), "Count both red and blue parts.", "There are ${ratio*a} red and $a blue beads, totaling ${(ratio+1)*a}.", r)
    )
}

@Composable
fun AdvancedReasoningScreen(onExit: () -> Unit) {
    val rounds = remember { createReasoningRounds() }
    var index by remember { mutableIntStateOf(0) }
    var selected by remember(index) { mutableIntStateOf(-1) }
    var showHint by remember(index) { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    val accent = Color(0xFFB49AFF)
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        TextButton(onClick = onExit) { Text("‹ Modules") }
        if (index >= rounds.size) {
            Text("Reasoning practice complete", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Bold)
            Text("$score / ${rounds.size}", color = accent, fontSize = 34.sp)
            Text("Practice score; not a standardized IQ measurement.", color = Color.LightGray)
            Button(onClick = onExit) { Text("Back to modules") }
        } else {
            val round = rounds[index]
            Text("Advanced Reasoning • ${index+1}/10", color = accent, fontWeight = FontWeight.Bold)
            LinearProgressIndicator(progress = { index / 10f }, modifier = Modifier.fillMaxWidth())
            Surface(color = Color(0xFF202B55), shape = RoundedCornerShape(18.dp)) {
                Text(round.prompt, color = Color.White, fontSize = 21.sp, modifier = Modifier.padding(18.dp))
            }
            round.choices.forEachIndexed { choice, answer ->
                OutlinedButton(
                    onClick = { if (selected == -1) { if (choice == round.correctIndex) { selected = choice; score++ } else showHint = true } },
                    enabled = selected == -1,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = if (selected == choice) Color(0xFF14532D) else Color.Transparent)
                ) { Text((if (selected == choice) "✓ " else "") + answer, color = if (selected == choice) Color(0xFF86EFAC) else Color.White) }
            }
            if (showHint && selected == -1) Text("Hint: ${round.hint}", color = Color(0xFFFDE68A))
            if (selected != -1) {
                Text("✓ Correct!", color = Color(0xFF86EFAC))
                Text(round.explanation, color = Color.LightGray)
                Button(onClick = { index++ }) { Text(if (index == 9) "Results" else "Next") }
            }
        }
    }
}
