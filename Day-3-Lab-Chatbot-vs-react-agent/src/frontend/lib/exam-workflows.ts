import {
  BIOLOGY_GRADE_12_LESSON_THEORY,
  BIOLOGY_GRADE_12_TOPIC,
  allQuestionBank,
  biologyQuestionBank,
} from "./biology-question-bank"
import type {
  AgentTraceStep,
  CognitiveLevel,
  Exam,
  ExamBlueprint,
  ExamConfig,
  ExamValidation,
  GradingResult,
  Question,
  WorkflowResult,
} from "./types"

const LEVEL_LABELS: Record<CognitiveLevel, string> = {
  recognition: "Nhận biết",
  understanding: "Thông hiểu",
  application: "Vận dụng",
  advanced: "Vận dụng cao",
}

const BLUEPRINT_RATIOS: Record<string, Record<CognitiveLevel, number>> = {
  easy: {
    recognition: 0.7,
    understanding: 0.2,
    application: 0.1,
    advanced: 0,
  },
  medium: {
    recognition: 0.5,
    understanding: 0.1,
    application: 0.2,
    advanced: 0.2,
  },
  hard: {
    recognition: 0.2,
    understanding: 0.2,
    application: 0.3,
    advanced: 0.3,
  },
}

const TEACHER_CONTEXT =
  "Agent đóng vai trò giáo viên phổ thông, không phải giảng viên. Ưu tiên giáo dục, động viên và hướng dẫn học sinh trước; kiến thức được đưa ra từ tốn, dễ hiểu, không phán xét."

export class NoQuestionDataError extends Error {
  constructor(public readonly config: ExamConfig) {
    super("Chưa có dữ liệu môn này. Em thử chọn Sinh học lớp 12 chủ đề DNA, gen, mã di truyền và nhân đôi DNA nhé.")
    this.name = "NoQuestionDataError"
  }
}

export const AGENT_RULES = [
  "Luôn đóng vai giáo viên phổ thông, không xưng hoặc hành xử như giảng viên đại học.",
  "Ưu tiên cảm giác an toàn học tập của học sinh: động viên trước, hướng dẫn sau.",
  "Không chê bai, không phán xét, không dùng giọng gây áp lực khi học sinh làm sai hoặc điểm thấp.",
  "Dùng văn phong gần gũi với học sinh: 'em có thể...', 'không sao đâu...', 'mình thử lại từng bước nhé'.",
  "Chỉ dùng dữ liệu cục bộ gồm lesson theory và question bank; không tự bịa kiến thức ngoài phạm vi demo.",
  "Đề thi phải bám blueprint nhận thức; kể cả đề khó vẫn phải có câu nền tảng.",
  "Chấm điểm bằng đáp án có sẵn, deterministic, không thay đổi đáp án đúng theo diễn giải tự do.",
  "Mỗi câu sai chỉ đưa một lời khuyên ngắn, cụ thể, giúp học sinh biết nên ôn lại phần nào.",
  "Tổng kết cuối bài phải coi điểm số là tín hiệu học tập, không phải đánh giá con người học sinh.",
  "Trace Agent chỉ trình bày các bước workflow Thought-Action-Observation phục vụ minh bạch demo.",
]

function softenAdvice(advice: string): string {
  return `Không sao đâu, em có thể làm thế này: ${advice}`
}

export function getLessonTheory(subject: string, grade: number, topic: string): string {
  if (
    subject === "Biology" &&
    grade === 12 &&
    normalizeTopic(topic) === normalizeTopic(BIOLOGY_GRADE_12_TOPIC)
  ) {
    return BIOLOGY_GRADE_12_LESSON_THEORY.trim()
  }

  return "Chưa có lý thuyết riêng cho chủ đề này trong demo. Agent sẽ chỉ dùng ngân hàng câu hỏi cục bộ để tạo và chấm đề."
}

export function buildExamBlueprint(
  difficulty: string,
  questionCount: number,
): ExamBlueprint {
  const ratios = BLUEPRINT_RATIOS[difficulty] ?? BLUEPRINT_RATIOS.medium
  const distribution = allocateByRatio(questionCount, ratios)

  return {
    difficulty,
    totalQuestions: questionCount,
    distribution,
  }
}

export function selectQuestionsByBlueprint(
  blueprint: ExamBlueprint,
  questionBank: Question[] = biologyQuestionBank,
): Question[] {
  const selected: Question[] = []

  ;(["recognition", "understanding", "application", "advanced"] as CognitiveLevel[]).forEach(
    (level) => {
      const count = blueprint.distribution[level]
      selected.push(...questionBank.filter((question) => question.level === level).slice(0, count))
    },
  )

  if (selected.length < blueprint.totalQuestions) {
    const selectedTexts = new Set(selected.map((question) => question.question))
    selected.push(
      ...questionBank
        .filter((question) => !selectedTexts.has(question.question))
        .slice(0, blueprint.totalQuestions - selected.length),
    )
  }

  return selected.map((question, index) => ({
    ...question,
    id: index + 1,
    text: question.question,
    correctAnswer: question.correctOption,
  }))
}

export function validateExam(exam: Exam): ExamValidation {
  const messages: string[] = []
  const expectedTotal = exam.blueprint?.totalQuestions ?? exam.questions.length

  if (exam.questions.length !== expectedTotal) {
    messages.push(`Cần ${expectedTotal} câu hỏi, hiện có ${exam.questions.length} câu.`)
  }

  const duplicateTexts = new Set<string>()
  const seenTexts = new Set<string>()
  exam.questions.forEach((question) => {
    if (seenTexts.has(question.question)) {
      duplicateTexts.add(question.question)
    }
    seenTexts.add(question.question)
  })
  if (duplicateTexts.size > 0) {
    messages.push("Phát hiện câu hỏi bị trùng.")
  }

  if (exam.mode === "agent" && exam.blueprint) {
    ;(["recognition", "understanding", "application", "advanced"] as CognitiveLevel[]).forEach(
      (level) => {
        const expected = exam.blueprint?.distribution[level] ?? 0
        const actual = exam.questions.filter((question) => question.level === level).length
        if (actual !== expected) {
          messages.push(`${LEVEL_LABELS[level]} cần ${expected} câu, hiện có ${actual} câu.`)
        }
      },
    )

    const foundationalCount = exam.questions.filter(
      (question) => question.level === "recognition",
    ).length
    if (foundationalCount === 0) {
      messages.push("Đề trung bình/khó vẫn phải có câu nền tảng thuộc mức nhận biết.")
    }
  }

  const isValid = messages.length === 0
  return {
    isValid,
    messages: isValid ? ["Cấu trúc đề đã được kiểm chứng thành công."] : messages,
  }
}

export function gradeExam(exam: Exam, answers: Record<number, string>): GradingResult {
  const questionResults = exam.questions.map((question) => {
    const userAnswer = answers[question.id] ?? null
    const isCorrect = userAnswer === question.correctOption

    return {
      questionId: question.id,
      isCorrect,
      userAnswer,
      correctAnswer: question.correctOption,
      explanation: question.explanation,
      advice: isCorrect ? undefined : generateMistakeAdvice(question),
      level: question.level,
      topic: question.topic,
    }
  })

  const correctCount = questionResults.filter((result) => result.isCorrect).length
  const percentage = Math.round((correctCount / exam.questions.length) * 100)
  const weakAreas = analyzeAreas(exam, questionResults, "weak")
  const strongAreas = analyzeAreas(exam, questionResults, "strong")
  const mistakeAdvice = questionResults
    .filter((result) => !result.isCorrect && result.advice)
    .map((result) => `Câu ${result.questionId}: ${result.advice}`)
  const finalSummary = generateFinalSummary(exam, questionResults, percentage)

  return {
    score: correctCount,
    totalQuestions: exam.questions.length,
    percentage,
    questionResults,
    studyAdvice: buildStudyAdvice(percentage, weakAreas, exam.mode ?? "llm"),
    weakAreas,
    strongAreas,
    mistakeAdvice,
    finalSummary,
  }
}

export function generateMistakeAdvice(question: Question): string {
  return softenAdvice(question.wrongAdvice)
}

export function generateFinalSummary(
  exam: Exam,
  questionResults: GradingResult["questionResults"],
  percentage: number,
): string {
  const missedLevels = new Set(
    questionResults
      .filter((result) => !result.isCorrect && result.level)
      .map((result) => LEVEL_LABELS[result.level as CognitiveLevel]),
  )
  const missedLevelText = missedLevels.size > 0 ? Array.from(missedLevels).join(", ") : "không có"

  if (exam.mode === "llm") {
    return `Tổng kết cơ bản: em đạt ${percentage}%. Nếu còn sai vài câu thì cũng không sao, em hãy xem lại phần giải thích và thử làm lại từng câu một cách chậm rãi.`
  }

  if (percentage < 50) {
    return `Tổng kết của giáo viên AI: điểm lần này còn thấp (${percentage}%), nhưng điều đó không sao cả. Em đang có dữ liệu rất tốt để biết mình cần bắt đầu từ đâu. Trước mắt, em chỉ cần ôn lại mức ${missedLevelText}, học chậm phần cấu trúc DNA, quy tắc bổ sung và enzyme nhân đôi, rồi làm lại các câu nhận biết trước.`
  }

  return `Tổng kết của giáo viên AI: em đạt ${percentage}%. Mức nhận thức nên ôn lại là ${missedLevelText}. Em có thể học lại cấu trúc DNA, tính chất mã di truyền và enzyme nhân đôi, sau đó làm lại câu nền tảng trước khi chuyển sang câu vận dụng cao.`
}

export function runAgentWorkflow(config: ExamConfig): WorkflowResult {
  const normalizedConfig = resolveExamConfig(config)
  const questionBank = getQuestionBankForConfig(normalizedConfig)
  if (questionBank.length === 0) {
    throw new NoQuestionDataError(normalizedConfig)
  }
  const trace: AgentTraceStep[] = []
  const now = Date.now()

  trace.push({
    type: "thought",
    content: `${TEACHER_CONTEXT} Quy tắc đang áp dụng: ${formatAgentRules()}. Cần tạo đề Sinh học 12 về ${normalizedConfig.topic}. Trước hết lấy lý thuyết, sau đó lập ma trận nhận thức phù hợp để học sinh không bị quá tải.`,
    timestamp: new Date(now - 5000),
  })

  const lessonTheory = getLessonTheory(normalizedConfig.subject, 12, normalizedConfig.topic)
  trace.push({
    type: "action",
    content: "getLessonTheory(môn='Sinh học', lớp=12, chủ đề='DNA, gen, mã di truyền và nhân đôi DNA')",
    timestamp: new Date(now - 4500),
  })
  trace.push({
    type: "observation",
    content: "Đã lấy lý thuyết về cấu trúc DNA, gen, codon và cơ chế nhân đôi bán bảo tồn. Phần này sẽ được dùng như nền tảng để chọn câu hỏi vừa sức.",
    timestamp: new Date(now - 4000),
    status: "success",
  })

  const blueprint = buildExamBlueprint(normalizedConfig.difficulty, normalizedConfig.questionCount)
  trace.push({
    type: "action",
    content: `buildExamBlueprint(độ_khó='${getDifficultyLabel(normalizedConfig.difficulty)}', số_câu=${normalizedConfig.questionCount})`,
    timestamp: new Date(now - 3500),
  })
  trace.push({
    type: "observation",
    content: formatBlueprint(blueprint),
    timestamp: new Date(now - 3000),
  })

  const questions = selectQuestionsByBlueprint(blueprint, questionBank)
  trace.push({
    type: "action",
    content: `selectQuestionsByBlueprint(ma_trận_đề, ngân_hàng_câu_hỏi_${normalizedConfig.subject}_12)`,
    timestamp: new Date(now - 2500),
  })
  trace.push({
    type: "observation",
    content: `Đã chọn ${questions.length} câu cố định từ ${questionBank.length} câu phù hợp với prompt/môn/chủ đề. Đề vẫn có câu nền tảng để học sinh có điểm tựa trước khi gặp câu khó.`,
    timestamp: new Date(now - 2000),
  })

  const exam: Exam = {
    id: `agent-exam-${Date.now()}`,
    subject: normalizedConfig.subject,
    grade: 12,
    topic: normalizedConfig.topic,
    difficulty: normalizedConfig.difficulty,
    questions,
    createdAt: new Date(),
    mode: "agent",
    lessonTheory,
    blueprint,
  }

  const validation = validateExam(exam)
  exam.validation = validation
  trace.push({
    type: "validation",
    content: validation.messages.join(" "),
    timestamp: new Date(now - 1500),
    status: validation.isValid ? "success" : "warning",
  })

  return { exam, trace }
}

export function runLLMWorkflow(config: ExamConfig): WorkflowResult {
  const normalizedConfig = resolveExamConfig(config)
  const questionBank = getQuestionBankForConfig(normalizedConfig)
  if (questionBank.length === 0) {
    throw new NoQuestionDataError(normalizedConfig)
  }
  const selectedQuestions = questionBank.slice(0, normalizedConfig.questionCount).map(
    (question, index) => ({
      ...question,
      id: index + 1,
      text: question.question,
      correctAnswer: question.correctOption,
    }),
  )

  return {
    exam: {
      id: `llm-exam-${Date.now()}`,
      subject: normalizedConfig.subject,
      grade: 12,
      topic: normalizedConfig.topic,
      difficulty: normalizedConfig.difficulty,
      questions: selectedQuestions,
      createdAt: new Date(),
      mode: "llm",
    },
    trace: [],
  }
}

export function runAgentGradingTrace(
  exam: Exam,
  answers: Record<number, string>,
  result: GradingResult,
): AgentTraceStep[] {
  const now = Date.now()
  return [
    {
      type: "thought",
      content: `Chấm ${exam.questions.length} câu trả lời bằng đáp án cục bộ. Quy tắc đang áp dụng: ${formatAgentRules()}. Khi phản hồi, giáo viên AI sẽ nói nhẹ nhàng, động viên trước rồi mới hướng dẫn lỗi sai.`,
      timestamp: new Date(now - 3500),
    },
    {
      type: "action",
      content: "gradeExam(đề_thi, câu_trả_lời_học_sinh)",
      timestamp: new Date(now - 3000),
    },
    {
      type: "observation",
      content: `Đã nhận ${Object.keys(answers).length}/${exam.questions.length} câu trả lời. Điểm: ${result.score}/${result.totalQuestions} (${result.percentage}%).`,
      timestamp: new Date(now - 2500),
      status: result.percentage >= 70 ? "success" : result.percentage >= 50 ? "warning" : "error",
    },
    {
      type: "action",
      content: "generateMistakeAdvice() cho từng câu sai",
      timestamp: new Date(now - 2000),
    },
    {
      type: "observation",
      content:
        result.mistakeAdvice.length > 0
          ? `Đã tạo ${result.mistakeAdvice.length} lời khuyên ngắn cho câu sai theo giọng giáo viên phổ thông: từ tốn, không phán xét.`
          : "Không phát hiện câu trả lời sai. Có thể khen học sinh và khuyến khích duy trì nhịp ôn tập.",
      timestamp: new Date(now - 1500),
      status: "success",
    },
    {
      type: "validation",
      content: "Đã tạo tổng kết ôn tập theo hướng động viên: điểm số là tín hiệu học tập, không phải lời phán xét học sinh.",
      timestamp: new Date(now - 1000),
      status: "success",
    },
  ]
}

function formatAgentRules(): string {
  return AGENT_RULES.map((rule, index) => `${index + 1}. ${rule}`).join(" ")
}

function normalizeTopic(topic: string): string {
  return normalizeText(topic)
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "")
}

function resolveExamConfig(config: ExamConfig): ExamConfig {
  const promptConfig = parsePromptConfig(config.prompt ?? "")

  return {
    ...config,
    ...promptConfig,
    difficulty: promptConfig.difficulty ?? config.difficulty,
    questionCount: promptConfig.questionCount ?? config.questionCount,
    subject: promptConfig.subject ?? config.subject,
    topic: promptConfig.topic ?? config.topic,
  }
}

function parsePromptConfig(prompt: string): Partial<ExamConfig> {
  const normalizedPrompt = normalizeText(prompt)
  const parsed: Partial<ExamConfig> = {}

  if (!normalizedPrompt) {
    return parsed
  }

  const subjectAliases: Array<{ subject: string; aliases: string[] }> = [
    { subject: "Biology", aliases: ["biology", "sinhhoc", "sinh"] },
    { subject: "Mathematics", aliases: ["mathematics", "math", "toanhoc", "toan"] },
    { subject: "Physics", aliases: ["physics", "vatly", "ly"] },
    { subject: "Chemistry", aliases: ["chemistry", "hoahoc", "hoa"] },
  ]

  const subjectMatch = subjectAliases.find((item) =>
    item.aliases.some((alias) => normalizedPrompt.includes(alias)),
  )
  if (subjectMatch) {
    parsed.subject = subjectMatch.subject
  }

  if (normalizedPrompt.includes("kho") || normalizedPrompt.includes("hard")) {
    parsed.difficulty = "hard"
  } else if (
    normalizedPrompt.includes("de") ||
    normalizedPrompt.includes("easy") ||
    normalizedPrompt.includes("coban")
  ) {
    parsed.difficulty = "easy"
  } else if (normalizedPrompt.includes("trungbinh") || normalizedPrompt.includes("medium")) {
    parsed.difficulty = "medium"
  }

  const countMatch = prompt.match(/(\d+)\s*(câu|cau|questions?|q)\b/i)
  if (countMatch) {
    parsed.questionCount = Math.min(10, Math.max(3, Number(countMatch[1])))
  }

  const availableTopics = Array.from(
    new Set(
      allQuestionBank
        .filter((question) => !parsed.subject || question.subject === parsed.subject)
        .map((question) => question.topic),
    ),
  )
  const topicMatch = availableTopics.find((topic) => normalizedPrompt.includes(normalizeText(topic)))
  if (topicMatch) {
    parsed.topic = topicMatch
  } else {
    const topicAliases: Array<{ topic: string; aliases: string[]; subject?: string }> = [
      {
        subject: "Biology",
        topic: "DNA, Gene, Genetic Code, and DNA Replication",
        aliases: ["dna", "gen", "maditruyen", "nhandoidna", "nhandna"],
      },
      {
        subject: "Biology",
        topic: "Genetics and Evolution",
        aliases: ["ditruyen", "tienhoa", "ditruyenhoctienhoa"],
      },
      {
        subject: "Biology",
        topic: "Ecology",
        aliases: ["sinhthai", "sinhthaihoc"],
      },
      {
        subject: "Mathematics",
        topic: "Calculus and Applications",
        aliases: ["giaitich", "daoham", "tichphan", "ungdung"],
      },
      {
        subject: "Mathematics",
        topic: "Geometry and Vectors",
        aliases: ["hinhhoc", "vector", "vecto", "toado"],
      },
      {
        subject: "Mathematics",
        topic: "Probability and Bayes Theorem",
        aliases: ["xacsuat", "bayes", "thongke"],
      },
      {
        subject: "Physics",
        topic: "Ideal Gas and Thermodynamics",
        aliases: ["khilituong", "nhietdongluc", "nhiet"],
      },
      {
        subject: "Physics",
        topic: "Nuclear Physics and Magnetism",
        aliases: ["hatnhan", "tunhien", "tutruong", "tinhoc"],
      },
      {
        subject: "Physics",
        topic: "Thermal Physics",
        aliases: ["vatlynhiet", "nhietly", "nhiet"],
      },
      {
        subject: "Chemistry",
        topic: "Carbohydrates and Polymers",
        aliases: ["cacbohidrat", "carbohydrate", "polymer", "polime"],
      },
      {
        subject: "Chemistry",
        topic: "Nitrogen Compounds",
        aliases: ["nitrogen", "nito", "hopchatnito", "amin"],
      },
      {
        subject: "Chemistry",
        topic: "Esters and Lipids",
        aliases: ["este", "lipid", "chatbeo"],
      },
    ]
    const aliasMatch = topicAliases.find(
      (item) =>
        (!parsed.subject || item.subject === parsed.subject) &&
        item.aliases.some((alias) => normalizedPrompt.includes(alias)),
    )
    if (aliasMatch) {
      parsed.topic = aliasMatch.topic
      parsed.subject = aliasMatch.subject ?? parsed.subject
    }
  }

  return parsed
}

function getQuestionBankForConfig(config: ExamConfig): Question[] {
  const selected = allQuestionBank.filter(
    (question) =>
      question.subject === config.subject &&
      question.grade === 12 &&
      normalizeTopic(question.topic) === normalizeTopic(config.topic),
  )

  return selected.map((question, index) => ({
    ...question,
    id: index + 1,
    text: question.question,
    correctAnswer: question.correctOption,
  }))
}

function allocateByRatio(
  questionCount: number,
  ratios: Record<CognitiveLevel, number>,
): Record<CognitiveLevel, number> {
  const levels: CognitiveLevel[] = ["recognition", "understanding", "application", "advanced"]
  const raw = levels.map((level) => ({
    level,
    base: Math.floor(questionCount * ratios[level]),
    remainder: questionCount * ratios[level] - Math.floor(questionCount * ratios[level]),
  }))

  let remaining = questionCount - raw.reduce((sum, item) => sum + item.base, 0)
  raw
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (remaining > 0) {
        item.base += 1
        remaining -= 1
      }
    })

  const distribution = Object.fromEntries(raw.map((item) => [item.level, item.base])) as Record<
    CognitiveLevel,
    number
  >

  if (questionCount > 0 && distribution.recognition === 0) {
    const donor = levels
      .filter((level) => level !== "recognition")
      .sort((a, b) => distribution[b] - distribution[a])[0]
    if (donor && distribution[donor] > 0) {
      distribution[donor] -= 1
      distribution.recognition = 1
    }
  }

  return distribution
}

function formatBlueprint(blueprint: ExamBlueprint): string {
  return `Ma trận đề ${getDifficultyLabel(blueprint.difficulty)}: ${LEVEL_LABELS.recognition}=${blueprint.distribution.recognition}, ${LEVEL_LABELS.understanding}=${blueprint.distribution.understanding}, ${LEVEL_LABELS.application}=${blueprint.distribution.application}, ${LEVEL_LABELS.advanced}=${blueprint.distribution.advanced}. Đề vẫn giữ câu nền tảng.`
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
  }
  return labels[difficulty] ?? difficulty
}

function analyzeAreas(
  exam: Exam,
  questionResults: GradingResult["questionResults"],
  mode: "weak" | "strong",
): string[] {
  const levelPerformance: Record<CognitiveLevel, { correct: number; total: number }> = {
    recognition: { correct: 0, total: 0 },
    understanding: { correct: 0, total: 0 },
    application: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
  }

  exam.questions.forEach((question, index) => {
    levelPerformance[question.level].total += 1
    if (questionResults[index]?.isCorrect) {
      levelPerformance[question.level].correct += 1
    }
  })

  return Object.entries(levelPerformance)
    .filter(([, performance]) => performance.total > 0)
    .filter(([, performance]) => {
      const percentage = (performance.correct / performance.total) * 100
      return mode === "weak" ? percentage < 60 : percentage >= 80
    })
    .map(([level]) => LEVEL_LABELS[level as CognitiveLevel])
}

function buildStudyAdvice(percentage: number, weakAreas: string[], mode: "llm" | "agent"): string[] {
  if (mode === "llm") {
    return [
      percentage >= 70
        ? "Em làm khá tốt rồi. Với những câu còn sai, em chỉ cần đọc lại giải thích và thử tự nói lại bằng lời của mình."
        : "Không sao nếu kết quả chưa cao. Em hãy bắt đầu từ kiến thức nền, làm lại từng câu sai và không cần vội.",
    ]
  }

  const weakText = weakAreas.length > 0 ? weakAreas.join(", ") : "không có mức nhận thức yếu rõ rệt"
  if (percentage < 50) {
    return [
      "Điểm thấp không sao cả, vì bài này đang giúp em nhìn rõ phần cần học lại.",
      `Em nên bắt đầu thật nhẹ từ: ${weakText}.`,
      "Hôm nay em chỉ cần ôn lại quy tắc A-T, G-C và vai trò của helicase, DNA polymerase, ligase.",
      "Sau đó em làm lại 2 câu nhận biết trước; khi chắc hơn rồi mới chuyển sang câu vận dụng.",
    ]
  }

  return [
    `Em nên ưu tiên ôn lại: ${weakText}.`,
    "Em có thể củng cố nền tảng trước: bắt cặp bazơ DNA, khái niệm gen, codon và enzyme nhân đôi.",
    "Sau khi xem lỗi sai, em hãy làm lại một câu nhận biết trước khi chuyển sang câu vận dụng hoặc vận dụng cao.",
  ]
}
