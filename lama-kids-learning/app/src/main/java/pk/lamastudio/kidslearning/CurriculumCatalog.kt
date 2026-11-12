package pk.lamastudio.kidslearning

data class CurriculumUnit(val grade: String, val subject: String, val topics: List<String>)
object CurriculumCatalog {
    val grades = listOf("Nursery", "KG") + (1..8).map { "Class $it" }
    val subjects = listOf("English", "Urdu", "Mathematics", "Science")
    val units: List<CurriculumUnit> = grades.flatMap { grade ->
        subjects.map { subject ->
            val topics = when(subject) {
                "English" -> if (grade in listOf("Nursery","KG")) listOf("Letters","Sounds","Words") else listOf("Reading","Grammar","Writing")
                "Urdu" -> if (grade in listOf("Nursery","KG")) listOf("حروف","الفاظ","آوازیں") else listOf("مطالعہ","قواعد","تحریر")
                "Mathematics" -> if (grade in listOf("Nursery","KG")) listOf("Counting","Shapes","Patterns") else listOf("Numbers","Operations","Geometry")
                else -> if (grade in listOf("Nursery","KG")) listOf("My Body","Plants","Weather") else listOf("Living Things","Matter","Earth")
            }
            CurriculumUnit(grade,subject,topics)
        }
    }
    fun coverage(lessons: List<Lesson>): Pair<Int,Int> =
        units.count { unit -> lessons.any { it.grade == unit.grade && it.subject == unit.subject } } to units.size
}
