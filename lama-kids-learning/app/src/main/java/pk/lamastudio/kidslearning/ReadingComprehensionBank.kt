package pk.lamastudio.kidslearning

/** Offline reading-comprehension exercises: ten questions per grade in two short passages. */
object ReadingComprehensionBank {
 private data class Story(val text: String, val questions: List<Question>)
 private fun q(prompt: String, correct: String, wrongA: String, wrongB: String, reason: String) =
  Question(prompt, listOf(wrongA, correct, wrongB), 1, reason)
 private val stories = listOf(
  listOf(
   Story("Ali has a red ball. He plays in the garden with Sara. Then he puts the ball in a box.", listOf(
    q("What does Ali have?", "A ball", "A kite", "A book", "Ali has a ball."),
    q("What color is the ball?", "Red", "Blue", "Green", "The ball is red."),
    q("Where does Ali play?", "Garden", "Kitchen", "Shop", "He plays in the garden."),
    q("Who plays with Ali?", "Sara", "Ahmed", "A teacher", "Sara plays with Ali."),
    q("Where does Ali put the ball?", "Box", "Bag", "Tree", "He puts it in a box."))),
   Story("Mina sees a little bird. The bird sits on a tree. Mina gives it water in a bowl.", listOf(
    q("What does Mina see?", "A bird", "A cat", "A fish", "Mina sees a bird."),
    q("Is the bird big or little?", "Little", "Big", "Huge", "The bird is little."),
    q("Where is the bird?", "On a tree", "In a car", "Under a bed", "It sits on a tree."),
    q("What does Mina give?", "Water", "Milk", "Bread", "Mina gives water."),
    q("What holds the water?", "A bowl", "A bottle", "A cup", "The water is in a bowl.")))
  ),
  listOf(
   Story("Bilal walks to school with his sister. He carries two pencils and a notebook. Their class begins at eight.", listOf(
    q("Where is Bilal going?", "School", "Market", "Park", "Bilal walks to school."),
    q("Who goes with him?", "His sister", "His uncle", "His friend", "His sister walks with him."),
    q("How many pencils does he carry?", "Two", "Three", "Four", "He carries two pencils."),
    q("What else does he carry?", "Notebook", "Football", "Umbrella", "He carries a notebook."),
    q("When does class begin?", "Eight", "Nine", "Ten", "Class begins at eight."))),
   Story("Ayesha plants three seeds in a pot. She waters them each morning. After a week, two green shoots appear.", listOf(
    q("Who plants the seeds?", "Ayesha", "Sara", "Bilal", "Ayesha plants them."),
    q("How many seeds are planted?", "Three", "Two", "Five", "There are three seeds."),
    q("Where are the seeds planted?", "Pot", "River", "Bag", "The seeds are in a pot."),
    q("When are they watered?", "Each morning", "Each night", "Only Sunday", "She waters them each morning."),
    q("How many shoots appear?", "Two", "Three", "Four", "Two shoots appear.")))
  ),
  listOf(
   Story("A small village has a library near its school. Every Friday, children borrow books. The librarian reminds them to return books after seven days.", listOf(
    q("Where is the library?", "Near the school", "Near the river", "Inside a bus", "The library is near the school."),
    q("What do children borrow?", "Books", "Toys", "Bicycles", "Children borrow books."),
    q("On which day do they borrow books?", "Friday", "Monday", "Sunday", "They borrow on Friday."),
    q("Who reminds the children?", "Librarian", "Driver", "Farmer", "The librarian reminds them."),
    q("When should books be returned?", "After seven days", "After one month", "After two days", "The return period is seven days."))),
   Story("A farmer keeps hens in a clean shelter. He collects eggs every morning and takes them to the market. He saves some eggs for his family.", listOf(
    q("What animals does the farmer keep?", "Hens", "Horses", "Goats", "The farmer keeps hens."),
    q("Where do the hens stay?", "Clean shelter", "Pond", "Classroom", "They stay in a clean shelter."),
    q("What does he collect?", "Eggs", "Honey", "Wool", "He collects eggs."),
    q("When does he collect them?", "Every morning", "Every evening", "Once a year", "He collects eggs every morning."),
    q("Why does he save some eggs?", "For his family", "For the bus", "For planting", "Some eggs are for his family.")))
  ),
  listOf(
   Story("During a school clean-up, students separated paper, plastic and food scraps into different bins. Their teacher explained that sorting waste makes recycling easier.", listOf(
    q("What event took place?", "School clean-up", "Sports day", "Music concert", "Students joined a clean-up."),
    q("Which item was sorted?", "Paper", "Petrol", "Sandstorm", "Paper was separated."),
    q("Where was the waste placed?", "Different bins", "River", "Playground", "They used different bins."),
    q("Who explained the purpose?", "Teacher", "Bus driver", "Doctor", "The teacher explained it."),
    q("What does sorting make easier?", "Recycling", "Driving", "Painting", "Sorting makes recycling easier."))),
   Story("A class measured rainfall for five days. Monday had no rain, Tuesday had light rain, and Wednesday had heavy rain. Thursday and Friday were dry.", listOf(
    q("What did the class measure?", "Rainfall", "Wind speed", "Temperature", "They measured rainfall."),
    q("How many days were observed?", "Five", "Three", "Seven", "They observed five days."),
    q("Which day had light rain?", "Tuesday", "Monday", "Friday", "Tuesday had light rain."),
    q("Which day had heavy rain?", "Wednesday", "Thursday", "Monday", "Wednesday had heavy rain."),
    q("Which pair of days was dry?", "Thursday and Friday", "Tuesday and Wednesday", "Monday and Tuesday", "Thursday and Friday were dry.")))
  ),
  listOf(
   Story("Nadia organized a reading club for her neighborhood. Members chose a different short story each week and discussed the characters, setting and main idea on Saturday.", listOf(
    q("Who organized the club?", "Nadia", "Bilal", "Hamza", "Nadia organized it."),
    q("What kind of club was it?", "Reading", "Cycling", "Cooking", "It was a reading club."),
    q("How often was a story chosen?", "Each week", "Each year", "Each day", "A new story was chosen weekly."),
    q("What did members discuss?", "Characters and setting", "Only prices", "Only weather", "They discussed characters, setting and main idea."),
    q("When did they discuss stories?", "Saturday", "Tuesday", "Thursday", "Discussions were on Saturday."))),
   Story("The science club placed one plant by a window and another in a dark cupboard. Both received equal water. After two weeks, the plant by the window looked healthier.", listOf(
    q("How many plants were used?", "Two", "Four", "Six", "The club used two plants."),
    q("Where was one plant placed?", "By a window", "Underwater", "In a freezer", "One plant was by a window."),
    q("Where was the other plant?", "Dark cupboard", "Garden", "Roof", "The other plant was in a cupboard."),
    q("What did both plants receive equally?", "Water", "Light", "Fertilizer", "Both received equal water."),
    q("Which plant looked healthier?", "Window plant", "Cupboard plant", "Neither plant", "The window plant looked healthier.")))
  ),
  listOf(
   Story("A local council installed rainwater collection tanks at a community garden. Volunteers used the stored water during dry weeks, reducing the need for tap water.", listOf(
    q("Who installed the tanks?", "Local council", "A sports team", "A hospital", "The council installed them."),
    q("What did the tanks collect?", "Rainwater", "Sand", "Fuel", "The tanks collected rainwater."),
    q("Where were the tanks installed?", "Community garden", "Railway station", "Library", "They were installed at a garden."),
    q("When was stored water useful?", "Dry weeks", "Snowstorms", "Night only", "Volunteers used it during dry weeks."),
    q("What was reduced?", "Tap water use", "Plant growth", "Volunteer work", "The system reduced tap water demand."))),
   Story("The debate team compared two proposals for a school garden. One offered more shade; the other cost less. Students selected the shaded design after considering long-term comfort.", listOf(
    q("What were students comparing?", "Garden proposals", "Bus routes", "Exam results", "They compared garden proposals."),
    q("What was the advantage of the first proposal?", "More shade", "Lower cost", "More parking", "The first offered shade."),
    q("What was the advantage of the other?", "Lower cost", "More shade", "More trees", "The other cost less."),
    q("Which proposal was chosen?", "Shaded design", "Cheaper design", "Neither", "They chose the shaded design."),
    q("What influenced their decision?", "Long-term comfort", "A coin toss", "A teacher's birthday", "They considered long-term comfort.")))
  ),
  listOf(
   Story("Researchers observed that seedlings exposed to morning sunlight grew taller than seedlings kept in dim light. Both groups received equal water and soil. They planned to repeat the trial.", listOf(
    q("What did the researchers study?", "Seedling growth", "Fish migration", "Air pollution", "They studied seedlings."),
    q("Which group grew taller?", "Morning sunlight group", "Dim light group", "Neither", "Sunlit seedlings grew taller."),
    q("Which factors were kept equal?", "Water and soil", "Light and height", "Temperature and species", "Both groups had equal water and soil."),
    q("What did researchers plan next?", "Repeat the trial", "Stop measuring", "Change all conditions", "They planned a repeat."),
    q("Why keep water equal?", "Control a variable", "Make plants dry", "Reduce observations", "Controlling variables improves comparison."))),
   Story("The school newspaper published a report about a new pedestrian crossing. The reporter interviewed residents and checked council records before writing. The article included both benefits and concerns.", listOf(
    q("What was the report about?", "Pedestrian crossing", "School uniforms", "A library sale", "The report concerned a crossing."),
    q("Who was interviewed?", "Residents", "Astronauts", "Tourists only", "The reporter interviewed residents."),
    q("What records were checked?", "Council records", "Weather charts", "Sports scores", "Council records were checked."),
    q("What viewpoints appeared?", "Benefits and concerns", "Only praise", "Only criticism", "The article included both."),
    q("What practice improves accuracy?", "Checking records", "Guessing facts", "Ignoring sources", "Source checking supports accuracy.")))
  ),
  listOf(
   Story("A student council surveyed 120 pupils about transport to school. Walking was the most common response, followed by bicycles and buses. The council recommended safer footpaths.", listOf(
    q("Who conducted the survey?", "Student council", "Science laboratory", "Football club", "The student council surveyed pupils."),
    q("How many pupils responded?", "120", "20", "210", "The survey included 120 pupils."),
    q("What was the most common transport?", "Walking", "Bus", "Bicycle", "Walking was most common."),
    q("What came after walking?", "Bicycles", "Cars", "Trains", "Bicycles followed walking."),
    q("What improvement was recommended?", "Safer footpaths", "More parking only", "Longer roads", "The council recommended footpaths."))),
   Story("An environmental group tested water at three river sites. The upstream sample was clearest, while the downstream sample contained the most suspended particles. The group recommended further laboratory testing.", listOf(
    q("How many sites were tested?", "Three", "Two", "Five", "There were three sites."),
    q("Which sample was clearest?", "Upstream", "Downstream", "Middle", "The upstream sample was clearest."),
    q("Which had most suspended particles?", "Downstream", "Upstream", "All equal", "Downstream contained most particles."),
    q("What was recommended?", "Further laboratory testing", "Drinking all samples", "Ignoring results", "More testing was recommended."),
    q("What can suspended particles affect?", "Water clarity", "River length", "Earth's rotation", "Particles make water cloudy.")))
  ),
  listOf(
   Story("A school introduced a digital library with offline access to selected books. Students could download materials at school and read at home without internet. Teachers monitored which resources were most useful.", listOf(
    q("What did the school introduce?", "Digital library", "New bus route", "Swimming pool", "It introduced a digital library."),
    q("What feature supported home reading?", "Offline access", "Live video only", "Daily internet fees", "Downloaded books worked offline."),
    q("Where could materials be downloaded?", "At school", "Only at home", "Only at a shop", "Students downloaded them at school."),
    q("Who monitored resource usefulness?", "Teachers", "Drivers", "Gardeners", "Teachers monitored resources."),
    q("What is a likely benefit?", "Reading without home internet", "Removing all books", "Preventing study", "Offline access helps students without home internet."))),
   Story("A town compared solar panels and diesel generators for a health clinic. Solar panels had higher initial costs but lower operating fuel costs. The committee considered maintenance and reliability before deciding.", listOf(
    q("What two systems were compared?", "Solar and diesel", "Wind and coal", "Gas and wood", "They compared solar panels and diesel generators."),
    q("Which had higher initial costs?", "Solar panels", "Diesel fuel", "Both were free", "Solar panels cost more initially."),
    q("Which had lower operating fuel costs?", "Solar panels", "Diesel generators", "Neither", "Solar panels need no diesel fuel."),
    q("What else did the committee consider?", "Maintenance and reliability", "Paint color only", "Building height", "They considered maintenance and reliability."),
    q("Which statement best describes the decision?", "It involved trade-offs", "Only one cost mattered", "No evidence was needed", "Different costs and reliability matter.")))
  )
 )
 val lessons: List<Lesson> = CurriculumCatalog.grades.flatMapIndexed { index, grade ->
  stories[index].mapIndexed { storyIndex, story ->
   Lesson("reading-${grade.replace(" ", "-")}-$storyIndex", grade, "English",
    "Reading story ${storyIndex + 1}",
    story.text,
    story.questions)
  }
 }
}
