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
,
        Lesson("supp-1","Nursery","Urdu","حرف ا","ا اردو حروفِ تہجی کا ایک حرف ہے۔",listOf(Question("انار کا پہلا حرف کیا ہے؟",listOf("ا","م","ب"),0,"انار ا سے شروع ہوتا ہے۔"))),
        Lesson("supp-2","Nursery","Mathematics","One and two","One means a single item; two means a pair.",listOf(Question("How many eyes do most people have?",listOf("1","2","3"),1,"Most people have two eyes."))),
        Lesson("supp-3","Nursery","Science","Our senses","We use our eyes to see and ears to hear.",listOf(Question("What helps us hear?",listOf("Ears","Feet","Hands"),0,"Ears help us hear sounds."))),
        Lesson("supp-4","KG","English","Capital letters","A, B and C are capital letters.",listOf(Question("Which is a capital letter?",listOf("b","A","c"),1,"A is uppercase."))),
        Lesson("supp-5","KG","Urdu","حرف ب","ب سے بکری اور بادل بنتے ہیں۔",listOf(Question("بکری کا پہلا حرف کون سا ہے؟",listOf("ا","ب","د"),1,"بکری ب سے شروع ہوتی ہے۔"))),
        Lesson("supp-6","KG","Science","Plants need water","Plants need water and light to grow.",listOf(Question("What do plants need?",listOf("Plastic","Water","Glass"),1,"Plants need water."))),
        Lesson("supp-7","Class 1","Mathematics","Subtraction","Subtracting means taking away.",listOf(Question("9 - 4 = ?",listOf("5","6","4"),0,"Nine minus four equals five."))),
        Lesson("supp-8","Class 1","Science","Parts of a plant","Roots absorb water; leaves make food using light.",listOf(Question("Which part absorbs water?",listOf("Roots","Flowers","Fruit"),0,"Roots take in water."))),
        Lesson("supp-9","Class 2","English","Action words","Verbs describe actions such as jump and read.",listOf(Question("Which word is a verb?",listOf("Blue","Jump","Table"),1,"Jump is an action."))),
        Lesson("supp-10","Class 2","Urdu","اسم","اسم کسی شخص، جگہ یا چیز کا نام ہے۔",listOf(Question("کون سا لفظ اسم ہے؟",listOf("دوڑنا","کتاب","جلدی"),1,"کتاب ایک چیز کا نام ہے۔"))),
        Lesson("supp-11","Class 2","Science","Healthy habits","Washing hands with soap helps remove germs.",listOf(Question("When should we wash hands?",listOf("Before eating","Only once a week","Never"),0,"Wash hands before eating."))),
        Lesson("supp-12","Class 3","English","Plural nouns","Many nouns form plurals by adding s.",listOf(Question("Plural of book?",listOf("Books","Bookes","Booking"),0,"Book becomes books."))),
        Lesson("supp-13","Class 3","Urdu","واحد اور جمع","واحد ایک اور جمع ایک سے زیادہ کے لیے استعمال ہوتا ہے۔",listOf(Question("کتاب کی جمع کیا ہے؟",listOf("کتابیں","قلم","لکھنا"),0,"کتاب کی جمع کتابیں ہے۔"))),
        Lesson("supp-14","Class 3","Mathematics","Multiplication","Multiplication can represent equal groups.",listOf(Question("4 × 3 = ?",listOf("7","12","14"),1,"Four groups of three make twelve."))),
        Lesson("supp-15","Class 4","English","Pronouns","A pronoun can replace a noun.",listOf(Question("Which is a pronoun?",listOf("She","School","Blue"),0,"She is a pronoun."))),
        Lesson("supp-16","Class 4","Urdu","فعل","فعل کسی کام کے ہونے یا کرنے کو ظاہر کرتا ہے۔",listOf(Question("کون سا لفظ فعل ہے؟",listOf("پڑھنا","کرسی","درخت"),0,"پڑھنا ایک کام ہے۔"))),
        Lesson("supp-17","Class 4","Science","States of matter","Matter commonly occurs as solid, liquid or gas.",listOf(Question("Ice is usually a?",listOf("Gas","Solid","Liquid"),1,"Ice is solid water."))),
        Lesson("supp-18","Class 5","English","Past tense","Many regular verbs use -ed in the past.",listOf(Question("Past tense of walk?",listOf("Walked","Walking","Walks"),0,"Walked is past tense."))),
        Lesson("supp-19","Class 5","Urdu","متضاد الفاظ","متضاد الفاظ ایک دوسرے کے الٹ معنی رکھتے ہیں۔",listOf(Question("دن کا متضاد کیا ہے؟",listOf("روشنی","رات","صبح"),1,"دن کا متضاد رات ہے۔"))),
        Lesson("supp-20","Class 5","Mathematics","Decimals","A decimal point separates whole and fractional parts.",listOf(Question("0.5 equals?",listOf("One half","Five wholes","One quarter"),0,"0.5 is one half."))),
        Lesson("supp-21","Class 6","Urdu","مترادف الفاظ","مترادف الفاظ کے معنی قریب ہوتے ہیں۔",listOf(Question("خوش کا قریب المعنی لفظ؟",listOf("مسرور","اداس","ناراض"),0,"مسرور کا معنی خوش ہے۔"))),
        Lesson("supp-22","Class 6","Mathematics","Percentages","Percent means per hundred.",listOf(Question("25% of 100 = ?",listOf("25","50","75"),0,"25 per hundred equals 25."))),
        Lesson("supp-23","Class 6","Science","Food chains","Food chains show how energy passes between organisms.",listOf(Question("What is usually a producer?",listOf("Green plant","Lion","Eagle"),0,"Green plants produce food using sunlight."))),
        Lesson("supp-24","Class 7","English","Conjunctions","Conjunctions connect words and clauses.",listOf(Question("Which word is a conjunction?",listOf("And","Bright","House"),0,"And joins words or clauses."))),
        Lesson("supp-25","Class 7","Urdu","جملے کی اقسام","سوالیہ جملہ سوال پوچھنے کے لیے ہوتا ہے۔",listOf(Question("کون سا جملہ سوالیہ ہے؟",listOf("آپ کیسے ہیں؟","وہ آیا۔","دروازہ بند کرو۔"),0,"سوالیہ جملہ سوال کرتا ہے۔"))),
        Lesson("supp-26","Class 7","Science","Photosynthesis","Plants use light energy to make sugars from water and carbon dioxide.",listOf(Question("What provides energy for photosynthesis?",listOf("Sunlight","Sound","Wind"),0,"Sunlight provides the energy."))),
        Lesson("supp-27","Class 8","English","Active voice","In active voice the subject performs the action.",listOf(Question("Which is active voice?",listOf("Sara wrote a letter.","A letter was written by Sara.","A letter is being written."),0,"Sara is the subject performing the action."))),
        Lesson("supp-28","Class 8","Urdu","تشبیہ","تشبیہ میں ایک چیز کو کسی دوسری چیز سے مشابہ قرار دیا جاتا ہے۔",listOf(Question("کون سی مثال تشبیہ ہے؟",listOf("وہ شیر کی طرح بہادر ہے۔","وہ گھر گیا۔","کتاب میز پر ہے۔"),0,"کی طرح تشبیہ ظاہر کرتا ہے۔"))),
        Lesson("supp-29","Class 8","Mathematics","Linear equations","Solve an equation by keeping both sides balanced.",listOf(Question("If x + 7 = 12, x = ?",listOf("5","7","19"),0,"Subtract 7 from both sides.")))
    )
    fun forGradeAndSubject(grade: String, subject: String): List<Lesson> = lessons.filter { it.grade == grade && it.subject == subject }
}
