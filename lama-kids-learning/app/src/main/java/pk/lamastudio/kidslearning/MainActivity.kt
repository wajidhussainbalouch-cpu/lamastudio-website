package pk.lamastudio.kidslearning

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private val grades = listOf("Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8")
private val subjects = listOf("English", "Urdu", "Mathematics", "Science")

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                var selectedGrade by remember { mutableStateOf("Class 1") }
                var selectedSubject by remember { mutableStateOf<String?>(null) }
                Scaffold(topBar = { Surface(tonalElevation = 3.dp) { Text("Lama Kids Learning", modifier = Modifier.fillMaxWidth().padding(20.dp), style = MaterialTheme.typography.titleLarge) } }) { padding ->
                    LazyColumn(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        item { Text("Learn, play and grow!", style = MaterialTheme.typography.headlineSmall) }
                        item { Text("Choose your class") }
                        items(grades.size) { index ->
                            val grade = grades[index]
                            OutlinedButton(onClick = { selectedGrade = grade; selectedSubject = null }, modifier = Modifier.fillMaxWidth()) { Text(if (grade == selectedGrade) "✓ $grade" else grade) }
                        }
                        item { Text("Subjects for $selectedGrade", style = MaterialTheme.typography.titleMedium) }
                        items(subjects.size) { index ->
                            val subject = subjects[index]
                            Button(onClick = { selectedSubject = subject }, modifier = Modifier.fillMaxWidth()) { Text(subject) }
                        }
                        selectedSubject?.let { subject -> item { Text("$subject lessons for $selectedGrade are being prepared. No student data is collected.") } }
                    }
                }
            }
        }
    }
}
