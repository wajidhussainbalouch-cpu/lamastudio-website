package pk.lamastudio.iqtest

data class Challenge(
    val id: String,
    val level: Int,
    val category: String,
    val question: String,
    val choices: List<String>,
    val correct: Int,
    val explanation: String
)

object ChallengeBank {
    val all = listOf(
        Challenge("p01",1,"Patterns","2, 4, 6, 8, ?",listOf("9","10","12","14"),1,"Add two each time."),
        Challenge("p02",1,"Patterns","1, 2, 4, 8, ?",listOf("10","12","16","18"),2,"Double the previous number."),
        Challenge("p03",1,"Patterns","5, 10, 15, 20, ?",listOf("22","25","30","35"),1,"Add five."),
        Challenge("p04",1,"Patterns","A, B, C, D, ?",listOf("F","G","E","H"),2,"The next letter is E."),
        Challenge("p05",1,"Patterns","10, 9, 8, 7, ?",listOf("6","5","4","3"),0,"Subtract one."),
        Challenge("l01",1,"Logic","Which is not a shape?",listOf("Circle","Triangle","Blue","Square"),2,"Blue is a color."),
        Challenge("l02",1,"Logic","Which number is even?",listOf("3","7","8","9"),2,"Eight divides evenly by two."),
        Challenge("l03",1,"Logic","Which has three sides?",listOf("Square","Triangle","Circle","Pentagon"),1,"A triangle has three sides."),
        Challenge("l04",1,"Logic","Which is largest?",listOf("12","21","19","18"),1,"21 is the greatest value."),
        Challenge("l05",1,"Logic","If today is Monday, tomorrow is?",listOf("Sunday","Tuesday","Friday","Saturday"),1,"Tuesday follows Monday."),
        Challenge("p06",2,"Patterns","3, 6, 12, 24, ?",listOf("30","36","48","54"),2,"Each value doubles."),
        Challenge("p07",2,"Patterns","1, 4, 9, 16, ?",listOf("20","24","25","36"),2,"These are square numbers."),
        Challenge("p08",2,"Patterns","2, 5, 8, 11, ?",listOf("13","14","15","16"),1,"Add three."),
        Challenge("p09",2,"Patterns","Z, X, V, T, ?",listOf("S","R","Q","P"),1,"Move back two letters."),
        Challenge("p10",2,"Patterns","1, 1, 2, 3, 5, ?",listOf("6","7","8","10"),2,"Each number sums the preceding two."),
        Challenge("l06",2,"Logic","All cats are animals. Is every cat an animal?",listOf("Yes","No","Unknown","Sometimes"),0,"This follows from the premise."),
        Challenge("l07",2,"Logic","Which does not belong?",listOf("Apple","Pear","Carrot","Peach"),2,"Carrot is a root vegetable."),
        Challenge("l08",2,"Logic","A clock reads 3:00. What angle is between the hands?",listOf("45°","60°","90°","180°"),2,"Three hour marks span 90 degrees."),
        Challenge("l09",2,"Logic","Which is heavier: 1 kg cotton or 1 kg iron?",listOf("Cotton","Iron","Equal","Unknown"),2,"Both have the same mass."),
        Challenge("l10",2,"Logic","If A is taller than B, and B taller than C, who is tallest?",listOf("A","B","C","Cannot tell"),0,"A is taller than both."),
        Challenge("p11",3,"Patterns","2, 6, 12, 20, 30, ?",listOf("36","40","42","44"),2,"Products n(n+1): 1×2 through 6×7."),
        Challenge("p12",3,"Patterns","4, 7, 13, 22, 34, ?",listOf("46","48","49","52"),2,"Differences grow by three: 3, 6, 9, 12, 15."),
        Challenge("p13",3,"Patterns","A, C, F, J, O, ?",listOf("T","U","V","W"),1,"Letter gaps increase from 2 to 6."),
        Challenge("p14",3,"Patterns","81, 27, 9, 3, ?",listOf("0","1","2","-1"),1,"Divide by three."),
        Challenge("p15",3,"Patterns","1, 3, 7, 15, 31, ?",listOf("47","62","63","64"),2,"Double and add one."),
        Challenge("l11",3,"Logic","All Zibs are Loms. All Loms are Nars. All Zibs are Nars?",listOf("Yes","No","Maybe","Only some"),0,"The inclusion relation is transitive."),
        Challenge("l12",3,"Logic","Some birds cannot fly. Does it follow that all birds fly?",listOf("Yes","No","Only at night","Unknown"),1,"The premise gives a counterexample."),
        Challenge("l13",3,"Logic","A bat and ball cost $1.10. Bat costs $1 more. Ball costs?",listOf("$0.05","$0.10","$0.15","$0.20"),0,"$1.05 + $0.05 = $1.10."),
        Challenge("l14",3,"Logic","Three switches are OFF. Turn two ON. How many remain OFF?",listOf("0","1","2","3"),1,"One switch remains off."),
        Challenge("l15",3,"Logic","If P implies Q, and P is true, what must be true?",listOf("Not Q","Q","Not P","Neither"),1,"This is modus ponens."),
        Challenge("p16",4,"Patterns","1, 2, 6, 24, 120, ?",listOf("600","720","840","900"),1,"These are factorials."),
        Challenge("p17",4,"Patterns","2, 3, 5, 8, 13, ?",listOf("18","20","21","22"),2,"Each term sums the previous two."),
        Challenge("p18",4,"Patterns","100, 96, 88, 76, 60, ?",listOf("36","40","42","44"),1,"Subtract 4, 8, 12, 16, then 20."),
        Challenge("p19",4,"Patterns","3, 9, 27, 81, ?",listOf("162","189","243","324"),2,"Multiply by three."),
        Challenge("p20",4,"Patterns","7, 10, 16, 25, 37, ?",listOf("49","50","52","55"),2,"Add 3, 6, 9, 12, 15."),
        Challenge("l16",4,"Logic","Exactly one of A and B is true. A is false. B is?",listOf("True","False","Unknown","Both"),0,"Exactly one must be true."),
        Challenge("l17",4,"Logic","No squares are circles. This figure is a square. Is it a circle?",listOf("Yes","No","Maybe","Both"),1,"The categories are disjoint by premise."),
        Challenge("l18",4,"Logic","A train travels 60 km in 1 hour. At constant speed, 150 km takes?",listOf("2 h","2.5 h","3 h","3.5 h"),1,"150 divided by 60 is 2.5."),
        Challenge("l19",4,"Logic","Two coins are tossed. Probability of two heads?",listOf("1/2","1/3","1/4","3/4"),2,"One of four equally likely outcomes."),
        Challenge("l20",4,"Logic","Five machines make five items in five minutes. 100 machines make 100 items in?",listOf("5 min","20 min","100 min","500 min"),0,"Each machine makes one item in five minutes."),
        Challenge("p21",5,"Patterns","2, 3, 5, 7, 11, 13, ?",listOf("15","16","17","19"),2,"Next prime number is 17."),
        Challenge("p22",5,"Patterns","1, 4, 10, 20, 35, ?",listOf("50","54","56","60"),2,"Differences are 3, 6, 10, 15, 21."),
        Challenge("p23",5,"Patterns","64, 32, 16, 8, ?",listOf("2","4","6","7"),1,"Halve each time."),
        Challenge("p24",5,"Patterns","11, 22, 44, 88, ?",listOf("132","154","176","188"),2,"Double each term."),
        Challenge("p25",5,"Patterns","1, 8, 27, 64, ?",listOf("100","121","125","144"),2,"These are cubes."),
        Challenge("l21",5,"Logic","If all A are B, does it follow all B are A?",listOf("Yes","No","Always","Only if A empty"),1,"The converse is not guaranteed."),
        Challenge("l22",5,"Logic","Three fair coins tossed. Probability of exactly two heads?",listOf("1/8","1/4","3/8","1/2"),2,"Three of eight equally likely outcomes."),
        Challenge("l23",5,"Logic","If 4 workers finish a task in 6 days, 8 equally productive workers take?",listOf("2 days","3 days","4 days","12 days"),1,"Twice the workers halve the time."),
        Challenge("l24",5,"Logic","A cube has how many edges?",listOf("6","8","12","16"),2,"A cube has twelve edges."),
        Challenge("l25",5,"Logic","What is the next day after 100 days from Monday?",listOf("Monday","Tuesday","Wednesday","Thursday"),2,"100 mod 7 = 2 days after Monday.")
    )
    val levels = 1..5
    fun forLevel(level: Int): List<Challenge> = all.filter { it.level == level }
    fun validate(): Boolean = all.size == 50 && all.map { it.id }.distinct().size == all.size &&
        all.all { it.level in levels && it.choices.size == 4 && it.correct in 0..3 && it.explanation.isNotBlank() }
}
