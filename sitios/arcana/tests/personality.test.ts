import { describe, it, expect } from "vitest";
import { buildPersonalityProfile, selectQuestions, scoreAnswers } from "@/lib/personality/scoring";
import { PERSONALITY_QUESTIONS } from "@/lib/personality/questions";
import { GAME } from "@/lib/config";

describe("Personality System", () => {
  it("has at least 80 questions", () => {
    expect(PERSONALITY_QUESTIONS.length).toBeGreaterThanOrEqual(80);
  });

  it("selects between 20 and 30 questions deterministically", () => {
    const q1 = selectQuestions("testseed123");
    const q2 = selectQuestions("testseed123");
    expect(q1.length).toBeGreaterThanOrEqual(GAME.personalityQuestionMin);
    expect(q1.length).toBeLessThanOrEqual(GAME.personalityQuestionMax);
    expect(q1.map((q) => q.id)).toEqual(q2.map((q) => q.id));
  });

  it("produces consistent profile from same seed and answers", () => {
    const seed = "abc123def456";
    const questions = selectQuestions(seed);
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      optionIndex: i % q.options.length,
    }));
    const profile1 = buildPersonalityProfile(seed, answers);
    const profile2 = buildPersonalityProfile(seed, answers);
    expect(profile1.primaryArchetype).toBe(profile2.primaryArchetype);
    expect(profile1.gameSeed).toBe(profile2.gameSeed);
    expect(profile1.tarotCard).toBe(profile2.tarotCard);
  });

  it("produces different profiles for different answer patterns", () => {
    const seed = "xyz789";
    const questions = selectQuestions(seed);
    const impulsiveAnswers = questions.map((q) => ({
      questionId: q.id,
      optionIndex: 0,
    }));
    const patientAnswers = questions.map((q) => ({
      questionId: q.id,
      optionIndex: q.options.length - 1,
    }));
    const impulsive = buildPersonalityProfile(seed, impulsiveAnswers);
    const patient = buildPersonalityProfile(seed, patientAnswers);
    expect(impulsive.scores).not.toEqual(patient.scores);
  });

  it("assigns contrary modifiers", () => {
    const seed = "modtest12345";
    const questions = selectQuestions(seed);
    const answers = questions.map((q) => ({ questionId: q.id, optionIndex: 0 }));
    const profile = buildPersonalityProfile(seed, answers);
    expect(profile.contraryModifiers.length).toBeGreaterThan(0);
  });
});

describe("Scoring", () => {
  it("accumulates dimension scores", () => {
    const scores = scoreAnswers([
      { questionId: "q01", optionIndex: 0 },
      { questionId: "q02", optionIndex: 2 },
    ]);
    expect(scores.bondad).toBeGreaterThan(0);
    expect(scores.prudencia).toBeGreaterThan(0);
  });
});
