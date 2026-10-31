package pk.lamastudio.kidslearning

import android.content.Context

class ProgressStore(context: Context) {
    private val prefs = context.getSharedPreferences("local_learning_progress", Context.MODE_PRIVATE)
    fun stars(lessonId: String): Int = prefs.getInt("stars_$lessonId", 0)
    fun totalStars(): Int = LearningContent.lessons.sumOf { stars(it.id) }
    fun complete(lessonId: String, correct: Boolean) {
        val newStars = if (correct) 3 else 1
        if (newStars > stars(lessonId)) prefs.edit().putInt("stars_$lessonId", newStars).apply()
    }
    fun soundEnabled(): Boolean = prefs.getBoolean("sound_enabled", true)
    fun setSoundEnabled(value: Boolean) = prefs.edit().putBoolean("sound_enabled", value).apply()
}
