package pk.lamastudio.kidslearning

data class Question(val prompt: String, val answers: List<String>, val correctIndex: Int, val explanation: String)
data class Lesson(val id: String, val grade: String, val subject: String, val title: String, val explanation: String, val questions: List<Question>)

object LearningContent {
    val lessons = listOf(
        Lesson("n-en-1","Nursery","English","Letters A and B","A is for apple. B is for ball.", listOf(Question("Which letter begins apple?",listOf("B","A","C"),1,"Apple starts with A."))),
        Lesson("kg-m-1","KG","Mathematics","Counting to ten","Count one object at a time, from 1 to 10.",listOf(Question("What comes after 6?",listOf("7","5","9"),0,"7 comes after 6."))),
        Lesson("1-en-1","Class 1","English","Naming words","A noun names a person, place, animal or thing.",listOf(Question("Which is a noun?",listOf("Run","Cat","Quickly"),1,"Cat is an animal name."))),
        Lesson("2-m-1","Class 2","Mathematics","Addition","Combine two groups to find the total.",listOf(Question("12 + 5 = ?",listOf("15","17","19"),1,"12 plus 5 equals 17."))),
        Lesson("3-s-1","Class 3","Science","Living things","Living things need resources to grow and survive.",listOf(Question("Which is a living thing?",listOf("Rock","Tree","Spoon"),1,"Trees grow and need water."))),
        Lesson("4-m-1","Class 4","Mathematics","Fractions","A fraction represents part of a whole.",listOf(Question("Half of 12 is?",listOf("6","4","8"),0,"12 divided by 2 is 6."))),
        Lesson("5-s-1","Class 5","Science","Water cycle","Water evaporates, condenses and returns as precipitation.",listOf(Question("What forms clouds?",listOf("Condensation","Melting","Burning"),0,"Water vapour cools and condenses."))),
        Lesson("6-en-1","Class 6","English","Adjectives","An adjective describes a noun.",listOf(Question("Which word describes the noun in 'bright star'?",listOf("Star","Bright","The"),1,"Bright describes star."))),
        Lesson("7-m-1","Class 7","Mathematics","Integers","Integers include negative whole numbers, zero and positive whole numbers.",listOf(Question("-3 + 5 = ?",listOf("2","-8","8"),0,"Moving five units right from -3 reaches 2."))),
        Lesson("8-s-1","Class 8","Science","Forces","A force is a push or pull that can change motion.",listOf(Question("What is the SI unit of force?",listOf("Joule","Newton","Watt"),1,"Force is measured in newtons."))),
        Lesson("1-ur-1","Class 1","Urdu","حروف کی پہچان","ا سے انار اور ب سے بکری۔",listOf(Question("انار کا پہلا حرف کون سا ہے؟",listOf("ب","ا","پ"),1,"انار کا پہلا حرف ا ہے۔")))
    )
    fun forGradeAndSubject(grade: String, subject: String): List<Lesson> = lessons.filter { it.grade == grade && it.subject == subject }
}
