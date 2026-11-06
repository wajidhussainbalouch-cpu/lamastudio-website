/* LAMA Headmaster Paper 10 — English, ICT and science Q076–100. */
window.LAMA_PPSC_HM10_4=[
 {
  "id": "HM10-076",
  "subject": "English Grammar",
  "topic": "Proximity agreement",
  "q": "Which sentence correctly uses subject–verb agreement with 'neither ... nor' in a school circular?",
  "options": [
   "Neither the principal nor the teachers is available tomorrow.",
   "Neither the principal nor the teachers are available tomorrow.",
   "Neither the principal nor the teachers was availability tomorrow.",
   "Neither the principal nor the teachers has available tomorrow."
  ],
  "answer": 1,
  "explanation": "With 'neither ... nor', the plural subject closest to the verb commonly takes a plural verb: 'teachers are available.'",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-077",
  "subject": "English Usage",
  "topic": "Ambiguity from only",
  "q": "A notice intends to say that the supervisor will check only examination IDs, not other documents. Which sentence most clearly expresses that meaning?",
  "options": [
   "Only the supervisor will check examination IDs.",
   "The supervisor will only check examination IDs.",
   "The supervisor will check only examination IDs.",
   "The supervisor will check examination IDs only in the morning."
  ],
  "answer": 2,
  "explanation": "Placing 'only' directly before 'examination IDs' restricts the objects to be checked rather than ambiguously restricting the person, action or time.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-078",
  "subject": "English Writing",
  "topic": "Concise active voice",
  "q": "A report says, 'An assessment of the drinking-water facilities was carried out by the school team.' Which revision is most direct?",
  "options": [
   "The school team assessed the drinking-water facilities.",
   "Drinking-water facilities an assessment by team.",
   "An assessment was being carried out by the carried team.",
   "Facilities of water were of assessment and carried."
  ],
  "answer": 0,
  "explanation": "An active subject and precise verb convey the same action more clearly: the school team assessed the facilities.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-079",
  "subject": "English Grammar",
  "topic": "Future perfect by deadline",
  "q": "A school expects all answer scripts to be checked before the ceremony starts next Friday. Which sentence uses future perfect correctly?",
  "options": [
   "All scripts were checked by next Friday.",
   "All scripts are checking before next Friday.",
   "All scripts will have check by next Friday.",
   "All scripts will have been checked by next Friday."
  ],
  "answer": 3,
  "explanation": "'Will have been checked' is future perfect passive and appropriately describes a completed action before a future deadline.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-080",
  "subject": "English Comprehension",
  "topic": "Claim versus evidence",
  "q": "A paragraph states, 'The library's opening hours expanded, and visits rose from 500 to 700. Other school changes occurred at the same time.' Which claim is safest?",
  "options": [
   "Expanding opening hours definitely caused every additional visit.",
   "Visits increased, but the separate effect of longer hours cannot be isolated from the information given.",
   "Library visits decreased sharply.",
   "Other school changes cannot affect library use."
  ],
  "answer": 1,
  "explanation": "The figures support an increase in visits but do not identify its sole cause when other conditions also changed.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-081",
  "subject": "English Grammar",
  "topic": "Participle agreement",
  "q": "Which sentence avoids a dangling introductory participle?",
  "options": [
   "Walking through the corridor, the noticeboard was inspected.",
   "Walking through the corridor, the bell was heard.",
   "Walking through the corridor, the teacher noticed the loose ceiling tile.",
   "Walking through the corridor, the wall looked freshly painted."
  ],
  "answer": 2,
  "explanation": "The introductory participial phrase must describe the subject who was walking. Only 'the teacher' can logically perform that action.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-082",
  "subject": "English Vocabulary",
  "topic": "Connotation and neutrality",
  "q": "Which word best completes a neutral report about a policy that has been questioned by several staff members: 'The change remains ____ pending review'?",
  "options": [
   "contested",
   "ridiculous",
   "disastrous",
   "brilliant"
  ],
  "answer": 0,
  "explanation": "'Contested' reports that there is disagreement without importing a strong unsupported judgment about the merits of the policy.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-083",
  "subject": "English Grammar",
  "topic": "Each of agreement",
  "q": "A school notice uses the singular subject 'each' to describe completion of examiner reports. Which sentence has the correct formal subject–verb agreement?",
  "options": [
   "Each of the examiners have signed their report.",
   "Each of the examiners were signed a report.",
   "Each of the examiners are sign reports.",
   "Each of the examiners has signed a report."
  ],
  "answer": 3,
  "explanation": "The head of the subject 'each' is singular, so the verb normally takes the singular form 'has signed'.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-084",
  "subject": "ICT",
  "topic": "Cross-site request forgery protection",
  "q": "A school administration portal uses session cookies for fee changes. Which control directly helps prevent an external website from silently submitting a fee change on behalf of a signed-in admin?",
  "options": [
   "Give every external site the admin cookie",
   "Use suitable anti-CSRF checks, cookie restrictions and server-side authorization",
   "Disable all fee transaction logs",
   "Place the Save button at the bottom of the page"
  ],
  "answer": 1,
  "explanation": "State-changing cookie-authenticated requests need defenses such as CSRF tokens and appropriate SameSite cookie handling, in addition to authorization.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-085",
  "subject": "ICT",
  "topic": "Idempotency key for exam submission",
  "q": "A candidate taps Submit twice during slow network conditions. What backend design best prevents two separate final attempts being recorded?",
  "options": [
   "Record a new official attempt on every tap",
   "Ignore all later responses and delete the first",
   "Treat duplicate requests carrying a stable submission key as the same operation",
   "Ask the candidate to create a different student ID for each retry"
  ],
  "answer": 2,
  "explanation": "A stable idempotency key lets the server recognize retries of one submission and return the original outcome rather than creating duplicate final records.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-086",
  "subject": "ICT",
  "topic": "HTTP cache validation",
  "q": "A school's notice page keeps showing outdated notices, even though its server knows when content changes. Which HTTP mechanism can help the client verify whether a cached resource is still current?",
  "options": [
   "An ETag with conditional requests and suitable cache-control policy",
   "An animation played whenever the page loads",
   "A longer file extension",
   "A random school slogan in the footer"
  ],
  "answer": 0,
  "explanation": "Validators such as ETags support conditional fetches and help browsers identify unchanged content while refreshing resources that have been updated.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-087",
  "subject": "Digital Security",
  "topic": "Password reset token storage",
  "q": "A password reset email contains a one-time URL. What security practice should the server apply to the associated reset token?",
  "options": [
   "Allow the token to work indefinitely",
   "Use the same token for every user",
   "Log the entire reset URL in public analytics",
   "Expire it quickly, make it single-use and store or verify it securely"
  ],
  "answer": 3,
  "explanation": "Time-limited, single-use recovery tokens reduce the exposure if a reset link is copied or intercepted and should not be leaked through public logs.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-088",
  "subject": "Information Systems",
  "topic": "Unique constraints",
  "q": "A school database allows the same enrollment number to be assigned to two active pupils within the same school. Which database measure most directly guards against this?",
  "options": [
   "Changing the background color of the student form",
   "A uniqueness constraint on the school identifier plus active enrollment key, consistent with business rules",
   "More frequent manual spelling checks only",
   "Storing enrollment numbers in a free-text comment field"
  ],
  "answer": 1,
  "explanation": "A database-level unique constraint can enforce the intended identity rule even when multiple forms or requests submit at nearly the same time.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-089",
  "subject": "Spreadsheet Skills",
  "topic": "SUMIF criteria",
  "q": "Column A lists fee categories and Column B contains collected amounts. Which Excel formula totals only rows whose category equals 'Tuition'?",
  "options": [
   "=COUNT(A2:A200,\"Tuition\")",
   "=SUM(B2:B200,\"Tuition\")",
   "=SUMIF(A2:A200,\"Tuition\",B2:B200)",
   "=MATCH(\"Tuition\",A2:A200)"
  ],
  "answer": 2,
  "explanation": "SUMIF evaluates the category range against 'Tuition' and adds corresponding values from the amount range.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-090",
  "subject": "ICT",
  "topic": "Audit-clock integrity",
  "q": "A headteacher notices that attendance edits show timestamps from teachers' mobile clocks, some set two days ahead. What should the system change?",
  "options": [
   "Use trusted server-side timestamps for authoritative audit events, retaining client times only as context",
   "Delete all timestamps after each edit",
   "Require teachers to type any timestamp manually",
   "Treat mobile settings as the final source of audit time"
  ],
  "answer": 0,
  "explanation": "Server-controlled audit timestamps provide a reliable sequence of changes and reduce manipulation or accidental clock errors in official records.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-091",
  "subject": "Digital Literacy",
  "topic": "QR identifier risk",
  "q": "A printed student card contains a QR code with the student's name, date of birth and guardian phone number in plain text. What design would better protect privacy?",
  "options": [
   "Print a larger QR code with the same details",
   "Share the QR payload on the public website",
   "Require guardians to scan it in every public place",
   "Use a limited opaque identifier and retrieve authorized details only after server-side access checks"
  ],
  "answer": 3,
  "explanation": "An opaque token minimizes information exposed by anyone photographing the card, while server authorization controls access to personal records.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-092",
  "subject": "Physics",
  "topic": "Momentum conservation",
  "q": "Two identical low-friction carts collide head-on with equal speeds in opposite directions and stick together. What is their final velocity in an ideal isolated system?",
  "options": [
   "Equal to either initial speed",
   "Zero, because the initial total momentum is zero",
   "Twice the initial speed",
   "In the direction of the heavier cart"
  ],
  "answer": 1,
  "explanation": "Their momenta are equal and opposite, so total initial momentum is zero. Momentum conservation requires the stuck carts to have zero final velocity.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-093",
  "subject": "General Science",
  "topic": "Electric energy units",
  "q": "A 100-watt fan operates for five hours. How much electrical energy does it use in kilowatt-hours?",
  "options": [
   "0.05 kWh",
   "5 kWh",
   "0.5 kWh",
   "500 kWh"
  ],
  "answer": 2,
  "explanation": "Power is 0.1 kW, and energy is power multiplied by time: 0.1 × 5 = 0.5 kilowatt-hours.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-094",
  "subject": "Chemistry",
  "topic": "Neutralization products",
  "q": "When an ordinary aqueous acid reacts completely with a suitable base, what products are typically formed in a neutralization reaction?",
  "options": [
   "A salt and water",
   "A second acid and pure oxygen",
   "Only hydrogen gas",
   "New atoms without conserving mass"
  ],
  "answer": 0,
  "explanation": "An acid–base neutralization commonly yields a salt and water, though details depend on the species and reaction conditions.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-095",
  "subject": "Biology",
  "topic": "Enzyme active-site specificity",
  "q": "Why might an enzyme work rapidly on one substrate but not another that is chemically similar?",
  "options": [
   "All enzymes react with all molecules equally",
   "Substrates never bind to proteins",
   "Every enzyme is permanently consumed after one reaction",
   "The active site's shape and chemical properties favor particular substrate interactions"
  ],
  "answer": 3,
  "explanation": "Enzyme specificity depends on complementarity between substrate and active-site features, affecting binding and catalytic efficiency.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-096",
  "subject": "Earth Science",
  "topic": "Tectonic plate boundary",
  "q": "Two tectonic plates move horizontally past one another along a major fault. Which type of boundary does this describe?",
  "options": [
   "Divergent boundary with new crust formation",
   "Transform boundary dominated by lateral sliding",
   "Convergent boundary with obligatory subduction",
   "A boundary formed only by glaciers"
  ],
  "answer": 1,
  "explanation": "Transform boundaries accommodate horizontal relative movement. Stress may accumulate and be released as earthquakes along the fault.",
  "difficulty": "intermediate"
 },
 {
  "id": "HM10-097",
  "subject": "Environmental Science",
  "topic": "Biochemical oxygen demand",
  "q": "A downstream water sample shows very high biochemical oxygen demand after untreated organic waste enters a stream. What does a high value indicate?",
  "options": [
   "The sample contains no microorganisms",
   "The water can never contain dissolved oxygen",
   "Microbial decomposition may require substantial oxygen, potentially stressing aquatic life",
   "The water has become chemically pure"
  ],
  "answer": 2,
  "explanation": "High biochemical oxygen demand reflects oxygen needed for microbial breakdown of biodegradable material, which can deplete oxygen available to organisms.",
  "difficulty": "advanced"
 },
 {
  "id": "HM10-098",
  "subject": "Physics",
  "topic": "Thermal expansion of metals",
  "q": "A long metal rail is installed with no room for expansion on a hot day. What structural problem may arise as temperature rises?",
  "options": [
   "Thermal expansion can produce compressive stress and buckling",
   "The rail necessarily loses all mass",
   "Heat prevents atoms from moving",
   "All metals shrink when warmed"
  ],
  "answer": 0,
  "explanation": "Heating generally increases the dimensions of metals; if the expansion is constrained, stress can develop and potentially deform the rail.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-099",
  "subject": "Biology",
  "topic": "Photosynthetic gas exchange",
  "q": "In daylight, a healthy green plant generally takes in which gas as a raw material for photosynthesis?",
  "options": [
   "Nitrogen alone",
   "Helium",
   "Ozone only",
   "Carbon dioxide"
  ],
  "answer": 3,
  "explanation": "Photosynthesis uses carbon dioxide to build organic compounds; oxygen is released as a product of the light-driven process.",
  "difficulty": "foundation"
 },
 {
  "id": "HM10-100",
  "subject": "General Science",
  "topic": "Serial dilution",
  "q": "A laboratory uses 10 mL of a stock solution and adds enough water to make a final volume of 100 mL. What is the dilution factor based on final-to-aliquot volume?",
  "options": [
   "2",
   "10",
   "90",
   "100"
  ],
  "answer": 1,
  "explanation": "The dilution factor is final volume divided by the stock aliquot: 100/10 = 10. The diluted concentration is one-tenth of the original under the stated assumptions.",
  "difficulty": "intermediate"
 }
];
