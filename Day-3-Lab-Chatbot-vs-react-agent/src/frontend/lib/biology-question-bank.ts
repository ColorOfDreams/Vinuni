import agentQuestionJson from "../cau_hoi_trac_nghiem_agent.json"
import naturalScienceExamJson from "../bo_de_on_thi_khoa_hoc_tu_nhien_2026.json"
import naturalScienceExamCopyJson from "../bo_de_on_thi_khoa_hoc_tu_nhien_2026 (1).json"
import type { CognitiveLevel, Question } from "./types"

export const BIOLOGY_GRADE_12_TOPIC = "DNA, gen, mã di truyền và nhân đôi DNA"

export const BIOLOGY_GRADE_12_LESSON_THEORY = `
DNA là phân tử mang thông tin di truyền, có cấu trúc xoắn kép gồm hai mạch
polinucleotit ngược chiều nhau. Mỗi nucleotit gồm đường đêoxiribôzơ, nhóm
phôtphat và một bazơ nitơ. Trong DNA, A liên kết bổ sung với T, G liên kết bổ
sung với C.

Gen là một đoạn DNA mang thông tin mã hóa cho một sản phẩm xác định, thường là
chuỗi polipeptit hoặc RNA. Thông tin di truyền nằm trong trình tự các nucleotit
trên mạch DNA.

Mã di truyền được đọc theo từng bộ ba nucleotit gọi là codon. Mã di truyền có
tính bộ ba, tính đặc hiệu, tính phổ biến và tính thoái hóa. AUG thường là bộ ba
mở đầu, còn UAA, UAG và UGA là các bộ ba kết thúc.

Nhân đôi DNA diễn ra theo nguyên tắc bổ sung và bán bảo tồn. Mỗi phân tử DNA con
có một mạch cũ và một mạch mới. Helicase tháo xoắn, primase tổng hợp mồi RNA,
DNA polymerase kéo dài mạch mới theo chiều 5' đến 3', còn ligase nối các đoạn
Okazaki trên mạch gián đoạn.
`

const levelLabels: Record<CognitiveLevel, string> = {
  recognition: "Nhận biết",
  understanding: "Thông hiểu",
  application: "Vận dụng",
  advanced: "Vận dụng cao",
}

function makeQuestion(
  id: number,
  level: CognitiveLevel,
  question: string,
  options: Question["options"],
  correctOption: Question["correctOption"],
  explanation: string,
  wrongAdvice: string,
): Question {
  return {
    id,
    subject: "Biology",
    grade: 12,
    topic: BIOLOGY_GRADE_12_TOPIC,
    level,
    questionType: "multiple-choice",
    question,
    text: question,
    options,
    correctOption,
    correctAnswer: correctOption,
    explanation,
    wrongAdvice,
  }
}

type ExternalQuestion = {
  id: string
  subject: string
  grade: number
  topic: string
  level: string
  questionType: string
  question: string
  options: Question["options"]
  correctOption: string
  explanation: string
  wrongAdvice: string
}

const externalQuestionSources = [
  ...agentQuestionJson,
  ...naturalScienceExamJson,
  ...naturalScienceExamCopyJson,
] as ExternalQuestion[]

function isCognitiveLevel(level: string): level is CognitiveLevel {
  return ["recognition", "understanding", "application", "advanced"].includes(level)
}

function isAnswerOption(option: string): option is Question["correctOption"] {
  return ["A", "B", "C", "D"].includes(option)
}

function normalizeExternalQuestion(rawQuestion: ExternalQuestion, index: number): Question | null {
  if (
    rawQuestion.grade !== 12 ||
    !isCognitiveLevel(rawQuestion.level) ||
    !isAnswerOption(rawQuestion.correctOption)
  ) {
    return null
  }

  return {
    id: index + 1,
    subject: rawQuestion.subject,
    grade: 12,
    topic: rawQuestion.topic,
    level: rawQuestion.level,
    questionType: "multiple-choice",
    question: rawQuestion.question,
    text: rawQuestion.question,
    options: rawQuestion.options,
    correctOption: rawQuestion.correctOption,
    correctAnswer: rawQuestion.correctOption,
    explanation: rawQuestion.explanation,
    wrongAdvice: rawQuestion.wrongAdvice,
  }
}

function uniqueQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>()

  return questions
    .filter((question) => {
      const key = question.question.trim().toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .map((question, index) => ({
      ...question,
      id: index + 1,
      text: question.question,
      correctAnswer: question.correctOption,
    }))
}

const externalBiologyQuestionBank = externalQuestionSources
  .map((question, index) => normalizeExternalQuestion(question, index))
  .filter((question): question is Question => question !== null)

const curatedBiologyQuestionBank: Question[] = [
  makeQuestion(
    1,
    "recognition",
    "Trong DNA, bazơ nitơ nào liên kết bổ sung với adenine?",
    { A: "Uracil", B: "Thymine", C: "Guanine", D: "Cytosine" },
    "B",
    "Trong DNA, adenine liên kết bổ sung với thymine bằng liên kết hiđrô.",
    "Ôn lại quy tắc bổ sung: A-T và G-C.",
  ),
  makeQuestion(
    2,
    "recognition",
    "Một nucleotit của DNA gồm những thành phần nào?",
    { A: "Axit amin, đường, phôtphat", B: "Bazơ, ribôzơ, lipid", C: "Bazơ nitơ, đường đêoxiribôzơ, nhóm phôtphat", D: "Protein, ATP, phôtphat" },
    "C",
    "Nucleotit DNA gồm bazơ nitơ, đường đêoxiribôzơ và nhóm phôtphat.",
    "Ghi nhớ ba thành phần của nucleotit trước khi so sánh DNA với RNA.",
  ),
  makeQuestion(
    3,
    "recognition",
    "Gen là gì?",
    { A: "Một đoạn DNA mang thông tin cho một sản phẩm xác định", B: "Một cặp nhiễm sắc thể hoàn chỉnh", C: "Một loại ribosome", D: "Một phân tử đường trong DNA" },
    "A",
    "Gen là đoạn DNA chứa thông tin mã hóa cho RNA hoặc protein.",
    "Tập trung vào ý: gen là đoạn DNA mang thông tin di truyền.",
  ),
  makeQuestion(
    4,
    "recognition",
    "Mã di truyền được đọc theo đơn vị nào?",
    { A: "Codon/bộ ba", B: "Nucleosome", C: "Tâm động", D: "Alen" },
    "A",
    "Mã di truyền được đọc theo từng bộ ba nucleotit gọi là codon.",
    "Nhớ rằng một codon gồm ba nucleotit liên tiếp.",
  ),
  makeQuestion(
    5,
    "recognition",
    "Enzyme nào tháo xoắn và tách hai mạch DNA khi nhân đôi?",
    { A: "Ligase", B: "Helicase", C: "Amylase", D: "Peptidase" },
    "B",
    "Helicase phá vỡ liên kết hiđrô giữa các cặp bazơ để mở xoắn kép DNA.",
    "Liên hệ helicase với hành động tháo xoắn hoặc mở khóa DNA.",
  ),
  makeQuestion(
    6,
    "recognition",
    "DNA polymerase tổng hợp mạch mới theo chiều nào?",
    { A: "3' đến 5'", B: "5' đến 3'", C: "Cả hai chiều như nhau", D: "Từ protein sang DNA" },
    "B",
    "DNA polymerase chỉ gắn nucleotit vào đầu 3', nên mạch mới kéo dài theo chiều 5' đến 3'.",
    "Luyện lại quy tắc: mạch DNA mới luôn được tổng hợp 5' đến 3'.",
  ),
  makeQuestion(
    7,
    "understanding",
    "Vì sao nhân đôi DNA được gọi là bán bảo tồn?",
    { A: "Hai mạch cũ đều bị phá hủy", B: "Mỗi DNA con có một mạch cũ và một mạch mới", C: "Chỉ một nửa hệ gen được sao chép", D: "DNA chỉ được tổng hợp trên một mạch" },
    "B",
    "Bán bảo tồn nghĩa là mỗi phân tử DNA con giữ lại một mạch từ DNA mẹ.",
    "Gắn khái niệm bán bảo tồn với một mạch cũ và một mạch mới.",
  ),
  makeQuestion(
    8,
    "understanding",
    "Vì sao mạch gián đoạn tạo các đoạn Okazaki?",
    { A: "DNA polymerase chỉ tổng hợp 5' đến 3' trong khi hai mạch DNA ngược chiều", B: "Helicase cắt DNA ngẫu nhiên", C: "Mạch gián đoạn không có bazơ", D: "Mồi RNA không bám được vào DNA" },
    "A",
    "Do hai mạch DNA ngược chiều và polymerase chỉ tổng hợp 5' đến 3', mạch gián đoạn phải được tạo thành từng đoạn.",
    "Ôn lại tính ngược chiều của DNA và chiều hoạt động của DNA polymerase.",
  ),
  makeQuestion(
    9,
    "understanding",
    "Tính thoái hóa của mã di truyền có nghĩa là gì?",
    { A: "Một codon mã hóa nhiều axit amin", B: "Nhiều codon có thể cùng mã hóa một axit amin", C: "Codon được đọc ngược", D: "Chỉ có codon kết thúc" },
    "B",
    "Tính thoái hóa nghĩa là một axit amin có thể được mã hóa bởi nhiều codon khác nhau.",
    "Đừng nhầm thoái hóa với mơ hồ: mỗi codon vẫn có nghĩa xác định.",
  ),
  makeQuestion(
    10,
    "understanding",
    "Vì sao nguyên tắc bổ sung giúp truyền đạt thông tin di truyền chính xác?",
    { A: "Mỗi mạch DNA có thể làm khuôn cho mạch còn lại", B: "Nó tự loại bỏ mọi đột biến", C: "Nó biến DNA trực tiếp thành protein", D: "Nó ngăn DNA nhân đôi" },
    "A",
    "Mỗi mạch cũ định hướng trình tự nucleotit của mạch mới theo nguyên tắc bổ sung.",
    "Hãy hình dung mỗi mạch DNA là một khuôn để lắp mạch bổ sung.",
  ),
  makeQuestion(
    11,
    "understanding",
    "Vai trò chính của DNA ligase trong nhân đôi DNA là gì?",
    { A: "Mở xoắn kép", B: "Nối các đoạn Okazaki thành mạch liên tục", C: "Gắn axit amin vào protein", D: "Tách nhiễm sắc thể khỏi nhân" },
    "B",
    "Ligase nối các đoạn Okazaki trên mạch gián đoạn bằng cách hàn kín các chỗ hở.",
    "Nhớ ligase là enzyme nối hoặc hàn các đoạn DNA.",
  ),
  makeQuestion(
    12,
    "understanding",
    "Vì sao trình tự gen có thể ảnh hưởng đến cấu trúc protein?",
    { A: "Trình tự bazơ quyết định codon, codon quyết định trình tự axit amin", B: "Mọi gen tạo cùng một protein", C: "Bazơ DNA chính là axit amin", D: "Protein sao chép DNA trước khi nhân đôi" },
    "A",
    "Trình tự nucleotit tạo nên các codon, từ đó quy định trình tự axit amin của protein.",
    "Theo dõi dòng thông tin: DNA -> codon -> axit amin.",
  ),
  makeQuestion(
    13,
    "application",
    "Mạch khuôn DNA có trình tự 3'-TAC GGA CTT-5'. Mạch DNA mới bổ sung là gì?",
    { A: "5'-ATG CCT GAA-3'", B: "5'-UAC GGA CUU-3'", C: "3'-ATG CCT GAA-5'", D: "5'-TAC GGA CTT-3'" },
    "A",
    "Áp dụng A-T, G-C và tính ngược chiều, mạch mới là 5'-ATG CCT GAA-3'.",
    "Viết bazơ bổ sung rồi kiểm tra chiều 5' và 3'.",
  ),
  makeQuestion(
    14,
    "application",
    "Một phân tử DNA có 30% adenine. Tỉ lệ cytosine là bao nhiêu?",
    { A: "20%", B: "30%", C: "40%", D: "70%" },
    "A",
    "A=T nên T=30%, A+T=60%, còn G+C=40%. Vì G=C nên C=20%.",
    "Dùng quy tắc Chargaff: A=T, G=C và tổng bằng 100%.",
  ),
  makeQuestion(
    15,
    "application",
    "Trên mạch khuôn, bộ ba TAC bị biến đổi thành TAA. Điều gì có thể xảy ra với codon mở đầu trên mRNA?",
    { A: "AUG thành AUU nên có thể mất tín hiệu mở đầu", B: "AUG thành UAA nên protein dài hơn", C: "Không thể tạo mRNA", D: "Codon vẫn mã hóa methionine" },
    "A",
    "TAC trên mạch khuôn tạo AUG. Nếu thành TAA thì mRNA tương ứng là AUU, không phải codon mở đầu chuẩn.",
    "Hãy phiên mã mạch khuôn sang mRNA trước khi kết luận.",
  ),
  makeQuestion(
    16,
    "application",
    "Sau khi mồi RNA trên mạch gián đoạn bị loại bỏ, bước nào giúp duy trì mạch DNA liên tục?",
    { A: "DNA lấp chỗ trống rồi ligase nối kín vết hở", B: "Helicase phá hủy mạch mẹ", C: "Ribosome gắn axit amin", D: "Nhiễm sắc thể dừng nhân đôi vĩnh viễn" },
    "A",
    "Sau khi mồi được thay bằng DNA, ligase nối kín các chỗ hở giữa các đoạn.",
    "Ôn thứ tự: bỏ mồi, thay bằng DNA, rồi ligase nối.",
  ),
  makeQuestion(
    17,
    "application",
    "Một vùng mã hóa của gen có 900 nucleotit. Bỏ qua codon kết thúc, vùng này mã hóa khoảng bao nhiêu axit amin?",
    { A: "100", B: "300", C: "450", D: "900" },
    "B",
    "Ba nucleotit tạo một codon, nên 900 nucleotit mã hóa khoảng 300 axit amin.",
    "Chia số nucleotit cho 3 vì mã di truyền là mã bộ ba.",
  ),
  makeQuestion(
    18,
    "application",
    "Nếu DNA ligase bị ức chế, mạch nào bị ảnh hưởng trực tiếp nhất?",
    { A: "Mạch gián đoạn vì các đoạn Okazaki không được nối", B: "Mạch liên tục vì helicase ngừng hoạt động", C: "Cả hai mạch vì bazơ không thể bắt cặp", D: "Không mạch nào vì ligase chỉ dùng trong dịch mã" },
    "A",
    "Ligase đặc biệt quan trọng trên mạch gián đoạn vì nó nối các đoạn Okazaki.",
    "Liên hệ ligase với việc nối đoạn Okazaki trên mạch gián đoạn.",
  ),
  makeQuestion(
    19,
    "advanced",
    "Một chạc tái bản đi qua vùng DNA giàu G-C. So với vùng giàu A-T, điều gì có khả năng xảy ra?",
    { A: "Cần nhiều năng lượng hơn để tách hai mạch", B: "Không cần helicase", C: "Mã di truyền không còn là mã bộ ba", D: "DNA polymerase đổi chiều hoạt động" },
    "A",
    "Cặp G-C có ba liên kết hiđrô, bền hơn cặp A-T có hai liên kết hiđrô.",
    "Nhớ G-C có ba liên kết hiđrô, A-T có hai.",
  ),
  makeQuestion(
    20,
    "advanced",
    "Đột biến điểm làm mRNA đổi từ GAA thành GAG nhưng vẫn mã hóa glutamic acid. Tính chất nào giải thích hiện tượng này?",
    { A: "Tính phổ biến", B: "Tính thoái hóa", C: "Tính không gối lên nhau", D: "Nhân đôi bán bảo tồn" },
    "B",
    "Tính thoái hóa cho phép nhiều codon khác nhau cùng mã hóa một axit amin.",
    "Khi nhiều codon cùng mã hóa một axit amin, hãy nghĩ đến tính thoái hóa.",
  ),
  makeQuestion(
    21,
    "advanced",
    "Nếu DNA polymerase mất khả năng sửa sai, hậu quả nào dễ xảy ra nhất?",
    { A: "Tần số đột biến sau nhân đôi tăng", B: "Toàn bộ DNA biến thành RNA", C: "Helicase không còn dùng ATP", D: "Codon chỉ còn hai bazơ" },
    "A",
    "Chức năng sửa sai giúp giảm lỗi nhân đôi; mất chức năng này làm tăng đột biến.",
    "Liên hệ proofreading của polymerase với việc giảm sai sót khi nhân đôi.",
  ),
  makeQuestion(
    22,
    "advanced",
    "Vì sao đột biến lệch khung gần đầu gen thường nghiêm trọng hơn thay thế một cặp bazơ?",
    { A: "Nó làm thay đổi cách đọc nhiều codon phía sau", B: "Nó luôn cải thiện protein", C: "Nó chỉ ảnh hưởng đúng một codon", D: "Nó làm DNA mất nhóm phôtphat" },
    "A",
    "Thêm hoặc mất một bazơ làm thay đổi khung đọc, kéo theo nhiều codon phía sau bị đổi.",
    "Hình dung codon được chia theo nhóm ba; thêm hoặc mất một bazơ sẽ xô lệch các nhóm sau.",
  ),
  makeQuestion(
    23,
    "advanced",
    "Sau một thế hệ trong thí nghiệm, DNA mới gồm một mạch cũ nặng và một mạch mới nhẹ. Mô hình nào được ủng hộ?",
    { A: "Bảo tồn", B: "Phân tán hoàn toàn", C: "Bán bảo tồn", D: "Dịch mã" },
    "C",
    "Một mạch cũ đi cùng một mạch mới là bằng chứng cho cơ chế nhân đôi bán bảo tồn.",
    "Gắn kết quả thí nghiệm với mô hình một mạch cũ và một mạch mới.",
  ),
  makeQuestion(
    24,
    "advanced",
    "Một thuốc ức chế primase trong nhân đôi DNA. Quá trình nào thất bại trước tiên?",
    { A: "DNA polymerase khó khởi đầu tổng hợp mạch mới", B: "Ligase bắt đầu tạo codon RNA", C: "Mã di truyền mất tính phổ biến", D: "Adenine không còn bắt cặp với thymine" },
    "A",
    "Primase tạo mồi RNA để DNA polymerase có điểm khởi đầu kéo dài mạch mới.",
    "Nhớ DNA polymerase cần mồi; primase là enzyme tạo mồi.",
  ),
]

export const biologyQuestionBank = uniqueQuestions([
  ...externalBiologyQuestionBank.filter(
    (question) =>
      question.subject === "Biology" &&
      question.topic === "DNA, Gene, Genetic Code, and DNA Replication",
  ),
  ...curatedBiologyQuestionBank,
])

export const allQuestionBank = uniqueQuestions([
  ...externalBiologyQuestionBank,
  ...curatedBiologyQuestionBank,
])

export function getLevelLabel(level: CognitiveLevel): string {
  return levelLabels[level]
}
