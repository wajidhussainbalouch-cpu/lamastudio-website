package pk.lamastudio.iqtest

import kotlin.random.Random

/**
 * Deterministic, offline visual-sequence puzzles.
 * Symbols are vector-like Unicode shapes, so no image download or network is needed.
 * Four choices always have distinct patterns and exactly one correct answer.
 */
data class VisualPuzzle(
    val id: String,
    val level: Int,
    val sequence: List<String>,
    val choices: List<String>,
    val answer: Int,
    val explanationKey: String
)

object VisualPuzzleFactory {
    private val shapes = listOf("●", "■", "▲", "◆", "★", "⬟")
    private val colors = listOf("🔴", "🟡", "🟢", "🔵", "🟣", "🟠")
    private val arrows = listOf("↑", "→", "↓", "←")
    private val sizes = listOf("●", "⬤", "●●", "⬤⬤", "●●●", "⬤⬤⬤")
    private fun choiceSet(correct: String, pool: List<String>, rng: Random): Pair<List<String>, Int> {
        val others = pool.distinct().filter { it != correct }.shuffled(rng).take(3)
        require(others.size == 3)
        val choices = (others + correct).shuffled(rng)
        return choices to choices.indexOf(correct)
    }
    fun create(level: Int, count: Int = 10, seed: Int = 2026): List<VisualPuzzle> {
        require(level in 1..5 && count in 1..1000)
        val rng = Random(seed + level * 1009)
        return (0 until count).map { i ->
            val mode = (i + level) % 4
            val pool = when (mode) { 0 -> shapes; 1 -> colors; 2 -> arrows; else -> sizes }
            val start = rng.nextInt(pool.size)
            val step = when (mode) {
                2 -> if (level >= 3) 2 else 1
                else -> if (level >= 4) 2 else 1
            }
            val seq = (0..3).map { pool[(start + it * step) % pool.size] }
            val correct = pool[(start + 4 * step) % pool.size]
            val (options, answer) = choiceSet(correct, pool, rng)
            VisualPuzzle("v_${level}_${seed}_$i", level, seq, options, answer,
                if (mode == 2) "rotation" else "cycle")
        }
    }
    fun validate(items: List<VisualPuzzle>): Boolean = items.all {
        it.sequence.size == 4 && it.choices.size == 4 &&
        it.choices.distinct().size == 4 && it.answer in 0..3
    }
}
