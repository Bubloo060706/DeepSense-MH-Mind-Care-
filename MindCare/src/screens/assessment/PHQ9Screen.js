import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that others could have noticed — or the opposite, being so fidgety or restless',
  'Thoughts that you would be better off dead or of hurting yourself in some way',
];

const OPTIONS = [
  { label: 'Not at all',         score: 0, color: COLORS.safeGreen },
  { label: 'Several days',       score: 1, color: COLORS.mildYellow },
  { label: 'More than half',     score: 2, color: COLORS.moderateOrange },
  { label: 'Nearly every day',   score: 3, color: COLORS.severeRed },
];

const phqLevel = (total) => {
  if (total <= 4)  return { label: 'Minimal / None',  color: COLORS.safeGreen };
  if (total <= 9)  return { label: 'Mild',             color: COLORS.mildYellow };
  if (total <= 14) return { label: 'Moderate',         color: COLORS.moderateOrange };
  if (total <= 19) return { label: 'Moderately Severe',color: COLORS.severeRed };
  return               { label: 'Severe',              color: COLORS.criticalPurple };
};

const PHQ9Screen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addPhqResult } = useAppState();
  const [answers, setAnswers] = useState(Array(9).fill(null));
  const [step, setStep] = useState(0); // 0–8 = questions, 9 = result
  const [showResult, setShowResult] = useState(false);

  const setAnswer = (qIdx, score) => setAnswers(prev => { const n = [...prev]; n[qIdx] = score; return n; });

  const total = answers.reduce((sum, v) => sum + (v ?? 0), 0);
  const level = phqLevel(total);
  const answered = answers.filter(a => a !== null).length;
  const progress = answered / 9;

  const handleSubmit = () => {
    addPhqResult({ total, level: level.label, answers });
    setShowResult(true);
  };

  const currentQ = QUESTIONS[step];
  const currentAnswer = answers[step];

  if (showResult) {
    return (
      <View style={styles.container}>
        <View style={[styles.resultWrap, { paddingTop: insets.top + SIZES.lg }]}>
          <View style={[styles.resultCircle, { borderColor: level.color }]}>
            <Text style={[styles.resultScore, { color: level.color }]}>{total}</Text>
            <Text style={styles.resultOutOf}>/27</Text>
          </View>
          <Text style={[styles.resultLevel, { color: level.color }]}>{level.label}</Text>
          <Text style={styles.resultDesc}>
            {total <= 4  ? 'Your responses indicate minimal depressive symptoms. Keep maintaining healthy habits!' :
             total <= 9  ? 'Mild depressive symptoms detected. Consider self-care strategies and monitoring.' :
             total <= 14 ? 'Moderate depression symptoms. Speaking with a counsellor is recommended.' :
             total <= 19 ? 'Moderately severe symptoms. Please consider seeking professional support soon.' :
                           'Severe depression symptoms detected. Please contact a mental health professional immediately.'}
          </Text>

          {total >= 10 && (
            <View style={styles.crisisBox}>
              <Text style={styles.crisisTitle}>📞 Support Resources</Text>
              <Text style={styles.crisisLine}>iCall: 9152987821</Text>
              <Text style={styles.crisisLine}>Vandrevala Foundation: 1860-2662-345</Text>
              <Text style={styles.crisisLine}>NIMHANS: 080-46110007</Text>
            </View>
          )}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: level.color }]}
              onPress={() => navigation.navigate('Remedies')}
            >
              <Text style={styles.actionBtnText}>View Wellness Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtnOutline, { borderColor: level.color }]}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={[styles.actionBtnOutlineText, { color: level.color }]}>View History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
              <Text style={styles.backLinkText}>Back to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>PHQ-9 Assessment</Text>
          <Text style={styles.subtitle}>Question {step + 1} of 9</Text>
        </View>
        <Text style={styles.totalSoFar}>{total} pts so far</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: COLORS.safeGreen }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}>
        {/* Over past 2 weeks */}
        <Text style={styles.overLabel}>Over the last 2 weeks, how often have you been bothered by:</Text>

        <View style={styles.questionCard}>
          <Text style={styles.qNumber}>Q{step + 1}</Text>
          <Text style={styles.qText}>{currentQ}</Text>
          {step === 8 && (
            <View style={styles.safetyNote}>
              <Text style={styles.safetyText}>
                If you are having thoughts of self-harm, please reach out immediately: iCall 9152987821
              </Text>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {OPTIONS.map(opt => {
            const chosen = currentAnswer === opt.score;
            return (
              <TouchableOpacity
                key={opt.score}
                style={[styles.optionBtn, chosen && { borderColor: opt.color, backgroundColor: opt.color + '15' }]}
                onPress={() => setAnswer(step, opt.score)}
              >
                <View style={[styles.optionDot, { borderColor: opt.color }, chosen && { backgroundColor: opt.color }]} />
                <Text style={[styles.optionLabel, chosen && { color: opt.color, fontWeight: FONTS.weightBold }]}>{opt.label}</Text>
                <Text style={[styles.optionScore, { color: opt.color }]}>{opt.score}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nav buttons */}
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.prevText}>‹ Previous</Text>
            </TouchableOpacity>
          )}
          {step < 8 ? (
            <TouchableOpacity
              style={[styles.nextBtn, currentAnswer === null && styles.nextDisabled]}
              onPress={() => currentAnswer !== null && setStep(s => s + 1)}
            >
              <Text style={styles.nextText}>Next ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, answers.some(a => a === null) && styles.nextDisabled]}
              onPress={() => !answers.some(a => a === null) && handleSubmit()}
            >
              <Text style={styles.nextText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* All questions overview */}
        <View style={styles.dotRow}>
          {QUESTIONS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setStep(i)}>
              <View style={[
                styles.dot,
                i === step && styles.dotActive,
                answers[i] !== null && styles.dotAnswered,
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingHorizontal: SIZES.screenPadding, paddingBottom: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  back: { padding: 4 },
  backIcon: { fontSize: 30, color: COLORS.textPrimary, lineHeight: 34 },
  title: { fontSize: SIZES.subtitle, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.caption, color: COLORS.textMuted },
  totalSoFar: { fontSize: SIZES.small, color: COLORS.safeGreen, fontWeight: FONTS.weightBold },
  progressTrack: { height: 3, backgroundColor: COLORS.cardBorder },
  progressFill: { height: 3, borderRadius: 2 },
  content: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.lg, gap: SIZES.md },
  overLabel: { fontSize: SIZES.caption, color: COLORS.textMuted, fontStyle: 'italic' },
  questionCard: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.xl, gap: SIZES.sm,
  },
  qNumber: { fontSize: SIZES.caption, color: COLORS.safeGreen, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  qText: { fontSize: SIZES.subtitle, fontWeight: FONTS.weightBold, color: COLORS.textPrimary, lineHeight: 30 },
  safetyNote: {
    backgroundColor: COLORS.severeRedDim, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.severeRed + '50', padding: SIZES.sm, marginTop: SIZES.sm,
  },
  safetyText: { fontSize: SIZES.caption, color: COLORS.severeRed, lineHeight: 18 },
  optionsWrap: { gap: SIZES.sm },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, padding: SIZES.md,
  },
  optionDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  optionLabel: { flex: 1, fontSize: SIZES.small, color: COLORS.textSecondary },
  optionScore: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  navRow: { flexDirection: 'row', gap: SIZES.sm },
  prevBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: SIZES.radiusMd, paddingVertical: SIZES.sm, alignItems: 'center',
  },
  prevText: { fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: FONTS.weightSemiBold },
  nextBtn: {
    flex: 2, backgroundColor: COLORS.safeGreen,
    borderRadius: SIZES.radiusMd, paddingVertical: SIZES.sm, alignItems: 'center',
  },
  nextDisabled: { backgroundColor: COLORS.cardSurface },
  nextText: { fontSize: SIZES.small, color: COLORS.deepSpace, fontWeight: FONTS.weightBold },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: SIZES.sm },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.cardBorder },
  dotActive: { backgroundColor: COLORS.textSecondary, transform: [{ scale: 1.3 }] },
  dotAnswered: { backgroundColor: COLORS.safeGreen },
  // Result styles
  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.screenPadding, gap: SIZES.md },
  resultCircle: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 4,
    backgroundColor: COLORS.navyCard, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', alignItems: 'baseline',
  },
  resultScore: { fontSize: SIZES.mega, fontWeight: FONTS.weightBlack },
  resultOutOf: { fontSize: SIZES.subtitle, color: COLORS.textMuted, marginLeft: 2 },
  resultLevel: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack, textAlign: 'center' },
  resultDesc: { fontSize: SIZES.small, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  crisisBox: {
    backgroundColor: COLORS.severeRedDim, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.severeRed + '50', padding: SIZES.md,
    width: '100%', gap: 4, alignItems: 'center',
  },
  crisisTitle: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.severeRed },
  crisisLine: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  resultActions: { width: '100%', gap: SIZES.sm },
  actionBtn: { borderRadius: SIZES.radiusMd, paddingVertical: SIZES.md, alignItems: 'center' },
  actionBtnText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
  actionBtnOutline: { borderWidth: 1.5, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.sm, alignItems: 'center' },
  actionBtnOutlineText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  backLink: { alignItems: 'center', paddingVertical: SIZES.sm },
  backLinkText: { fontSize: SIZES.small, color: COLORS.textMuted },
});

export default PHQ9Screen;
