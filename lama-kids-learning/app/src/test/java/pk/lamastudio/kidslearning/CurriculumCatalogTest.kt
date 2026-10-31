package pk.lamastudio.kidslearning

import org.junit.Assert.*
import org.junit.Test

class CurriculumCatalogTest {
 @Test fun allGradeSubjectPairsPresent() {
  assertEquals(40, CurriculumCatalog.units.size)
  assertEquals(40, CurriculumCatalog.units.map { it.grade to it.subject }.toSet().size)
 }
 @Test fun noEmptyTopics() {
  assertTrue(CurriculumCatalog.units.all { it.topics.isNotEmpty() && it.topics.all(String::isNotBlank) })
 }
 @Test fun coverageCannotExceedTotal() {
  val (ready,total) = CurriculumCatalog.coverage(LearningContent.lessons)
  assertTrue(ready in 0..total)
  assertTrue(ready < total)
 }
}
