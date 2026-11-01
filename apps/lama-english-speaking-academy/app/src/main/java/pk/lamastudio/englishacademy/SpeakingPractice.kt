package pk.lamastudio.englishacademy

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat

@Composable
fun SpeakingPractice(context: Context, sample: String) {
 var transcript by remember(sample) { mutableStateOf("") }
 var status by remember(sample) { mutableStateOf("Listen, repeat, then compare your spoken sentence.") }
 val recognizer = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
  val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
  transcript = matches?.firstOrNull().orEmpty()
  status = if (transcript.isBlank()) "No speech captured. Please try again." else "Speech captured. Compare the text with the example."
 }
 val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { allowed ->
  status = if (allowed) "Microphone enabled. Tap Speak again." else "Microphone access denied. You can still listen and read."
 }
 ElevatedCard(modifier = Modifier.fillMaxWidth()) {
  Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
   Text("Speaking practice", style = MaterialTheme.typography.titleMedium)
   Text("Say: $sample")
   Text("Speech recognition may use an online service depending on your device. Do not speak private information.")
   Button(onClick = {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
     permission.launch(Manifest.permission.RECORD_AUDIO)
    } else {
     val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
      putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
      putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
      putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak in English")
     }
     try { recognizer.launch(intent) } catch (_: ActivityNotFoundException) {
      status = "No speech recognition app is available on this device."
     }
    }
   }) { Text("Speak English") }
   Text(status)
   if (transcript.isNotBlank()) Text("Recognized: $transcript")
  }
 }
}
