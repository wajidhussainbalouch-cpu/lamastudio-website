package pk.lamastudio.englishacademy

import android.content.Context

/** Device-local progress; rewards are educational points, never cash or currency. */
class ProgressStore(context: Context) {
 private val preferences = context.getSharedPreferences("learning_progress", Context.MODE_PRIVATE)
 fun completed(lessonId: String): Boolean = preferences.getBoolean("completed_$lessonId", false)
 fun coins(): Int = preferences.getInt("reward_coins", 0)
 fun markCompleted(lessonId: String): Int {
  if (completed(lessonId)) return 0
  preferences.edit().putBoolean("completed_$lessonId", true)
   .putInt("reward_coins", coins() + RewardPolicy.FIRST_PASS_COINS).apply()
  return RewardPolicy.FIRST_PASS_COINS
 }
}
