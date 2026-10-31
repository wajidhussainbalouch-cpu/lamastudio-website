package pk.lamastudio.iqtest

enum class GameLanguage(val label: String, val tag: String) {
    ENGLISH("English", "en"),
    URDU("اردو", "ur"),
    ARABIC("العربية", "ar"),
    HINDI("हिन्दी", "hi"),
    SPANISH("Español", "es")
}

/** Explicitly translated interface strings; do not auto-translate puzzle logic. */
object GameText {
    private val entries = mapOf(
        "title" to listOf("Lama IQ Test", "لاما آئی کیو ٹیسٹ", "اختبار لاما للذكاء", "लामा आईक्यू टेस्ट", "Prueba de CI Lama"),
        "choose" to listOf("Choose a level", "لیول منتخب کریں", "اختر المستوى", "स्तर चुनें", "Elige un nivel"),
        "visual" to listOf("Visual patterns", "تصویری نمونے", "الأنماط البصرية", "दृश्य पैटर्न", "Patrones visuales"),
        "next" to listOf("What comes next?", "اگلی شکل کون سی ہے؟", "ما الشكل التالي؟", "अगली आकृति क्या है?", "¿Qué figura sigue?"),
        "correct" to listOf("Correct!", "درست!", "صحيح!", "सही!", "¡Correcto!"),
        "wrong" to listOf("Try again next time", "اگلی بار دوبارہ کوشش کریں", "حاول مرة أخرى", "अगली बार फिर कोशिश करें", "Inténtalo de nuevo"),
        "continue" to listOf("Continue", "آگے بڑھیں", "متابعة", "आगे बढ़ें", "Continuar"),
        "levels" to listOf("Levels", "لیولز", "المستويات", "स्तर", "Niveles"),
        "score" to listOf("Score", "اسکور", "النتيجة", "स्कोर", "Puntuación"),
        "language" to listOf("Language", "زبان", "اللغة", "भाषा", "Idioma"),
        "back" to listOf("Back", "واپس", "رجوع", "वापस", "Volver"),
        "cycle" to listOf("The sequence repeats in a regular cycle.", "یہ ترتیب ایک مقررہ چکر میں دہرائی جاتی ہے۔", "يتكرر التسلسل بنمط منتظم.", "यह क्रम नियमित चक्र में दोहराता है।", "La secuencia se repite en un ciclo regular."),
        "rotation" to listOf("The arrow rotates by the same angle each step.", "تیر ہر مرحلے پر ایک ہی زاویے سے گھومتا ہے۔", "يدور السهم بالزاوية نفسها في كل خطوة.", "तीर हर चरण में समान कोण से घूमता है।", "La flecha gira el mismo ángulo en cada paso.")
    )
    fun get(key: String, language: GameLanguage): String =
        entries[key]?.get(language.ordinal) ?: key
}
