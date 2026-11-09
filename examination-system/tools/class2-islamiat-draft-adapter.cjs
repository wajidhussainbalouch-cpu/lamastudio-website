/**
 * Class 2 Islamiat draft adapter (CommonJS).
 * REVIEW ONLY. This module does not authorize publishing or auto-grading.
 */
"use strict";
const ANSWER_FIELDS = ["expectedAnswer", "correctAnswer"];
function normalizeDraftQuestion(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("Question must be an object");
  const id = typeof raw.questionId === "string" ? raw.questionId.trim() : "";
  const prompt = typeof raw.questionText === "string" ? raw.questionText.trim() : "";
  const answer = ANSWER_FIELDS.map(k => raw[k]).find(v => typeof v === "string" && v.trim());
  if (!id || !prompt || !answer) throw new Error("Missing question ID, text, or answer");
  if (raw.class !== "Class 2" || raw.subject !== "Islamiat") throw new Error("Unexpected class/subject");
  if (raw.approved !== false || raw.onlineReady !== false || raw.reviewStatus !== "draft") {
    throw new Error("Only explicitly unapproved draft questions are accepted");
  }
  return Object.freeze({
    id, class: raw.class, subject: raw.subject,
    language: raw.language || "Urdu",
    batch: raw.batch, topic: raw.topic || "Unmapped",
    type: raw.questionType, prompt,
    expectedAnswer: answer.trim(), marks: raw.marks,
    textbookPage: Number.isInteger(raw.sourcePdfPage) ? raw.sourcePdfPage : null,
    sourceBasis: raw.sourceBasis || "unverified",
    reviewStatus: "draft", approved: false, onlineReady: false,
    requiresTeacherReview: true,
    autoGradeEligible: false
  });
}
function normalizeDraftBatch(batch) {
  if (!batch || !Array.isArray(batch.questions)) throw new TypeError("Expected batch.questions array");
  const ids = new Set();
  return batch.questions.map(q => {
    const normalized = normalizeDraftQuestion(q);
    if (ids.has(normalized.id)) throw new Error("Duplicate question ID: " + normalized.id);
    ids.add(normalized.id);
    return normalized;
  });
}
/** Safe student projection: rejects drafts and omits the answer key. */
function toStudentQuestion(question) {
  if (!question || question.approved !== true || question.onlineReady !== true ||
      question.reviewStatus !== "approved" || question.requiresTeacherReview === true) {
    throw new Error("Question is not approved for student delivery");
  }
  const {id, class: schoolClass, subject, topic, type, prompt, marks} = question;
  return {id, class: schoolClass, subject, topic, type, prompt, marks};
}
module.exports = {normalizeDraftQuestion, normalizeDraftBatch, toStudentQuestion};
