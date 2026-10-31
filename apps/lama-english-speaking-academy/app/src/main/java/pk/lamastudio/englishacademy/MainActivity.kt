package pk.lamastudio.englishacademy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  setContent {
   var selected by remember { mutableStateOf("Beginner") }
   MaterialTheme {
    Scaffold(topBar = { Surface(tonalElevation = 3.dp) { Text("Lama English Speaking Academy", modifier = Modifier.padding(20.dp), style = MaterialTheme.typography.titleLarge) } }) { padding ->
     Column(Modifier.padding(padding).padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
      Text("Learn English with confidence", style = MaterialTheme.typography.headlineSmall)
      Text("انگریزی سیکھیں، اعتماد کے ساتھ بولیں")
      Text("Choose your learning level")
      listOf("Beginner", "Intermediate", "Advanced").forEach { level ->
       OutlinedButton(onClick = { selected = level }, modifier = Modifier.fillMaxWidth()) { Text(level) }
      }
      Text("Selected level: $selected")
      Text("Offline lessons and speaking practice are under development.")
     }
    }
   }
  }
 }
}
