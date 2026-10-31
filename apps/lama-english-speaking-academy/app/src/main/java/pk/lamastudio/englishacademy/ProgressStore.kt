package pk.lamastudio.englishacademy

import android.content.Context

/** Local-only first iteration. Room migration is planned before release. */
class ProgressStore(context: Context) {
 private val preferences = context.getSharedPreferences("learning_progress", Context.MODE_PRIVATE)
 fun completed(lessonId: String): Boolean = preferences.getBoolean("completed_$lessonId", false)
 fun markCompleted(lessonId: String) { preferences.edit().putBoolean("completed_$lessonId", true).apply() }
}
