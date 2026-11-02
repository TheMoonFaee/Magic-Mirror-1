
// ==========================================
// MAGIC MIRROR - VIRTUAL MATHEMATICS LAB
// Interactive JavaScript
// ==========================================

// 1. NAVIGASI MENU
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function openTab(tabName) {
  tabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  panels.forEach(panel => {
    panel.classList.toggle("active", panel.id === "p-" + tabName);
  });

  if (tabName === "simulation") {
    setTimeout(drawGraph, 50);
  }
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    openTab(tab.dataset.tab);
    playSound(600);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    openTab(button.dataset.go);
    playSound(700);
  });
});

// 2. EFEK SUARA
let soundEnabled = true;
let audioContext = null;

function playSound(frequency = 600) {
  if (!soundEnabled) return;

  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.12
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (error) {
    console.log("Audio tidak tersedia.");
  }
}

const soundBtn = document.getElementById("soundBtn");

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "♫ ON" : "♫ OFF";

  if (soundEnabled) playSound(700);
});

// 3. SIMULASI GRAFIK FUNGSI KUADRAT
const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const inputA = document.getElementById("a");
const inputB = document.getElementById("b");
const inputC = document.getElementById("c");

const originalText = document.getElementById("original");
const resultText = document.getElementById("result");
const explainText = document.getElementById("explain");

let reflection = null;

function getCoefficients() {
  const a = Number(inputA.value);
  const b = Number(inputB.value);
  const c = Number(inputC.value);

  return {
    a: Number.isFinite(a) ? a : 1,
    b: Number.isFinite(b) ? b : 0,
    c: Number.isFinite(c) ? c : 0
  };
}

function formatNumber(number) {
  if (Number.isInteger(number)) return String(number);
  return Number(number.toFixed(2)).toString();
}

function formatEquation(a, b, c) {
  let equation = "";

  if (a !== 0) {
    equation += a === 1 ? "x²" :
      a === -1 ? "-x²" : formatNumber(a) + "x²";
  }

  if (b !== 0) {
    const sign = b > 0 ? " + " : " − ";
    const value = Math.abs(b);

    equation += sign + (value === 1 ? "" : formatNumber(value)) + "x";
  }

  if (c !== 0) {
    equation += (c > 0 ? " + " : " − ") + formatNumber(Math.abs(c));
  }

  return equation || "0";
}

function getFunction(x, coefficients) {
  return coefficients.a * x * x +
    coefficients.b * x +
    coefficients.c;
}

function getReflectedCoefficients(coefficients) {
  const { a, b, c } = coefficients;

  if (reflection === "x") {
    return {
      a: -a,
      b: -b,
      c: -c
    };
  }

  if (reflection === "y") {
    return {
      a: a,
      b: -b,
      c: c
    };
  }

  return null;
}

function updateEquation() {
  const coefficients = getCoefficients();

  originalText.textContent =
    "f(x) = " + formatEquation(
      coefficients.a,
      coefficients.b,
      coefficients.c
    );

  const reflected = getReflectedCoefficients(coefficients);

  if (!reflected) {
    resultText.textContent = "Belum dicerminkan";
    explainText.textContent =
      "Pilih refleksi sumbu X atau Y untuk melihat hasilnya.";
    return;
  }

  resultText.textContent =
    "g(x) = " + formatEquation(
      reflected.a,
      reflected.b,
      reflected.c
    );

  if (reflection === "x") {
    explainText.textContent =
      "Refleksi sumbu X: g(x) = −f(x). Semua koefisien berubah tanda.";
  } else {
    explainText.textContent =
      "Refleksi sumbu Y: g(x) = f(−x). Koefisien b berubah tanda.";
  }
}

function drawGraph() {
  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;

  const centerX = width / 2;
  const centerY = height / 2;

  const scale = Math.max(12, Math.min(width / 10, height / 8));

  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#fffafd";
  ctx.fillRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = "#f4dce7";
  ctx.lineWidth = 1;

  for (let x = centerX % scale; x < width; x += scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = centerY % scale; y < height; y += scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Coordinate axes
  ctx.strokeStyle = "#b98ca3";
  ctx.lineWidth = 1.7;

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#a77b92";
  ctx.font = "11px DM Sans";
  ctx.fillText("Y", centerX + 7, 13);
  ctx.fillText("X", width - 13, centerY - 8);

  const coefficients = getCoefficients();

  function plotFunction(coef, color, lineWidth) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    let started = false;

    for (let pixelX = 0; pixelX <= width; pixelX += 2) {
      const x = (pixelX - centerX) / scale;
      const y = getFunction(x, coef);
      const pixelY = centerY - y * scale;

      if (!Number.isFinite(pixelY) || Math.abs(pixelY) > height * 20) {
        started = false;
        continue;
      }

      if (!started) {
        ctx.moveTo(pixelX, pixelY);
        started = true;
      } else {
        ctx.lineTo(pixelX, pixelY);
      }
    }

    ctx.stroke();
  }

  // Original graph
  plotFunction(coefficients, "#e98bad", 3);

  // Reflected graph
  const reflected = getReflectedCoefficients(coefficients);

  if (reflected) {
    plotFunction(reflected, "#a68acb", 3);
  }
}

function refreshSimulation() {
  updateEquation();
  drawGraph();
}

[inputA, inputB, inputC].forEach(input => {
  input.addEventListener("input", refreshSimulation);
});

document.getElementById("reflectX").addEventListener("click", () => {
  reflection = "x";
  refreshSimulation();
  playSound(800);
});

document.getElementById("reflectY").addEventListener("click", () => {
  reflection = "y";
  refreshSimulation();
  playSound(900);
});

document.getElementById("clearReflection").addEventListener("click", () => {
  reflection = null;
  refreshSimulation();
  playSound(500);
});

function resetSimulation() {
  inputA.value = 1;
  inputB.value = 0;
  inputC.value = 0;
  reflection = null;
  refreshSimulation();
}

document.getElementById("simReset").addEventListener("click", () => {
  resetSimulation();
  playSound(500);
});

// 4. CONTOH SOAL
const examples = [
  {
    question: "Diketahui f(x) = x² + 4x + 3. Tentukan hasil refleksi terhadap sumbu X.",
    answer: "g(x) = −x² − 4x − 3",
    explanation: "Langkah 1: Gunakan rumus refleksi sumbu X, yaitu g(x) = −f(x). Langkah 2: Masukkan fungsi awal. g(x) = −(x² + 4x + 3). Langkah 3: Kalikan semua suku dengan −1. Hasilnya adalah −x² − 4x − 3."
  },
  {
    question: "Diketahui f(x) = 2x² + 6x + 5. Tentukan hasil refleksi terhadap sumbu Y.",
    answer: "g(x) = 2x² − 6x + 5",
    explanation: "Langkah 1: Gunakan rumus g(x) = f(−x). Langkah 2: Ganti setiap x dengan −x. g(x) = 2(−x)² + 6(−x) + 5. Langkah 3: Sederhanakan. Karena (−x)² = x², hasilnya 2x² − 6x + 5."
  },
  {
    question: "Grafik y = x² − 2x + 1 dicerminkan terhadap sumbu X. Berapa persamaan bayangannya?",
    answer: "y = −x² + 2x − 1",
    explanation: "Langkah 1: Refleksi sumbu X menggunakan y = −f(x). Langkah 2: y = −(x² − 2x + 1). Langkah 3: Distribusikan tanda negatif. Jadi, y = −x² + 2x − 1."
  }
];

let exampleIndex = 0;

function renderExample() {
  const example = examples[exampleIndex];

  document.getElementById("exampleCount").textContent =
    `Soal ${exampleIndex + 1} dari ${examples.length}`;

  document.getElementById("exampleCard").innerHTML = `
    <div class="small">QUESTION ${exampleIndex + 1}</div>
    <div style="font-size:clamp(15px,2vw,20px);font-weight:800;line-height:1.6">
      ${example.question}
    </div>
    <button class="pinkbtn" id="showAnswer" style="align-self:flex-start">
      Lihat Pembahasan ✧
    </button>
    <div id="answerBox" hidden>
      <div class="card" style="background:#fff0f6;margin-top:8px">
        <div class="small">JAWABAN</div>
        <div style="font-size:19px;font-weight:900;color:#c66d91;margin:8px 0">
          ${example.answer}
        </div>
        <div style="font-size:12px;line-height:1.8;color:#79596b">
          ${example.explanation}
        </div>
      </div>
    </div>
  `;

  document.getElementById("showAnswer").addEventListener("click", () => {
    const box = document.getElementById("answerBox");
    box.hidden = !box.hidden;

    document.getElementById("showAnswer").textContent =
      box.hidden ? "Lihat Pembahasan ✧" : "Tutup Pembahasan ↑";

    playSound(700);
  });

  document.getElementById("prevEx").disabled = exampleIndex === 0;
  document.getElementById("nextEx").disabled =
    exampleIndex === examples.length - 1;
}

document.getElementById("prevEx").addEventListener("click", () => {
  if (exampleIndex > 0) {
    exampleIndex--;
    renderExample();
    playSound(500);
  }
});

document.getElementById("nextEx").addEventListener("click", () => {
  if (exampleIndex < examples.length - 1) {
    exampleIndex++;
    renderExample();
    playSound(700);
  }
});

// 5. LATIHAN / QUIZ
const questions = [
  {
    question: "Jika f(x) = x² + 3x + 2 dicerminkan terhadap sumbu X, hasilnya adalah ...",
    options: [
      "x² − 3x + 2",
      "−x² − 3x − 2",
      "−x² + 3x + 2",
      "x² + 3x − 2"
    ],
    answer: 1,
    explanation: "Refleksi sumbu X menggunakan g(x) = −f(x). Jadi seluruh tanda suku berubah."
  },
  {
    question: "Jika f(x) = 3x² + 4x + 1 dicerminkan terhadap sumbu Y, hasilnya adalah ...",
    options: [
      "3x² − 4x + 1",
      "−3x² − 4x − 1",
      "3x² + 4x − 1",
      "−3x² + 4x + 1"
    ],
    answer: 0,
    explanation: "Refleksi sumbu Y menggunakan f(−x). Koefisien b berubah tanda, sedangkan a dan c tetap."
  },
  {
    question: "Titik (2, 5) dicerminkan terhadap sumbu X. Koordinat bayangannya adalah ...",
    options: [
      "(−2, 5)",
      "(2, −5)",
      "(−2, −5)",
      "(5, 2)"
    ],
    answer: 1,
    explanation: "Refleksi sumbu X mengubah koordinat (x,y) menjadi (x,−y)."
  },
  {
    question: "Titik (−3, 4) dicerminkan terhadap sumbu Y. Koordinat bayangannya adalah ...",
    options: [
      "(3, 4)",
      "(−3, −4)",
      "(3, −4)",
      "(4, −3)"
    ],
    answer: 0,
    explanation: "Refleksi sumbu Y mengubah koordinat (x,y) menjadi (−x,y)."
  },
  {
    question: "Grafik f(x) = 2x² − 4x + 3 dicerminkan terhadap sumbu X. Koefisien x² pada bayangannya adalah ...",
    options: [
      "2",
      "4",
      "−2",
      "−4"
    ],
    answer: 2,
    explanation: "Refleksi sumbu X membuat g(x) = −2x² + 4x − 3. Koefisien x² menjadi −2."
  }
];

let questionIndex = 0;
let selectedAnswers = Array(questions.length).fill(null);
let checkedAnswers = Array(questions.length).fill(false);

function renderQuiz() {
  const question = questions[questionIndex];

  document.getElementById("progress").textContent =
    `${questionIndex + 1} / ${questions.length}`;

  document.getElementById("progressBar").style.width =
    `${((questionIndex + 1) / questions.length) * 100}%`;

  document.getElementById("quizResult").textContent = "";

  const card = document.getElementById("quizCard");

  card.innerHTML = `
    <div class="small">QUESTION ${questionIndex + 1}</div>
    <div style="font-size:clamp(15px,2vw,19px);font-weight:800;line-height:1.6">
      ${question.question}
    </div>
    <div id="options"></div>
    <div id="feedback" style="font-size:12px;line-height:1.7"></div>
  `;

  const optionsContainer = document.getElementById("options");

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

    if (selectedAnswers[questionIndex] === index) {
      button.classList.add("selected");
    }

    if (checkedAnswers[questionIndex]) {
      button.disabled = true;

      if (index === question.answer) {
        button.classList.add("correct");
      } else if (index === selectedAnswers[questionIndex]) {
        button.classList.add("wrong");
      }
    }

    button.addEventListener("click", () => {
      if (checkedAnswers[questionIndex]) return;

      selectedAnswers[questionIndex] = index;
      playSound(650);
      renderQuiz();
    });

    optionsContainer.appendChild(button);
  });

  if (checkedAnswers[questionIndex]) {
    const isCorrect =
      selectedAnswers[questionIndex] === question.answer;

    document.getElementById("feedback").innerHTML = `
      <div style="font-weight:900;color:${isCorrect ? "#528b62" : "#c56b78"}">
        ${isCorrect ? "✓ Jawaban benar!" : "✗ Belum tepat!"}
      </div>
      <div>${question.explanation}</div>
    `;
  }

  document.getElementById("prevQ").disabled = questionIndex === 0;

  document.getElementById("nextQ").textContent =
    questionIndex === questions.length - 1 ? "Hasil Akhir →" : "Lanjut →";
}

document.getElementById("checkQ").addEventListener("click", () => {
  if (selectedAnswers[questionIndex] === null) {
    document.getElementById("quizResult").textContent =
      "Pilih salah satu jawaban terlebih dahulu!";
    return;
  }

  checkedAnswers[questionIndex] = true;
  renderQuiz();
  playSound(800);
});

document.getElementById("prevQ").addEventListener("click", () => {
  if (questionIndex > 0) {
    questionIndex--;
    renderQuiz();
    playSound(500);
  }
});

document.getElementById("nextQ").addEventListener("click", () => {
  if (questionIndex < questions.length - 1) {
    questionIndex++;
    renderQuiz();
    playSound(700);
  } else {
    showFinalScore();
  }
});

function showFinalScore() {
  const answered = checkedAnswers.every(Boolean);

  if (!answered) {
    const firstUnchecked = checkedAnswers.findIndex(value => !value);
    questionIndex = firstUnchecked;
    renderQuiz();

    document.getElementById("quizResult").textContent =
      "Selesaikan dan periksa semua soal terlebih dahulu!";
    return;
  }

  const score = questions.reduce((total, question, index) => {
    return total + (selectedAnswers[index] === question.answer ? 1 : 0);
  }, 0);

  const percentage = Math.round(score / questions.length * 100);

  document.getElementById("quizCard").innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:55px">${percentage >= 80 ? "🏆" : "🌸"}</div>
      <div style="font-size:25px;font-weight:900;color:#c66d91">
        ${percentage} / 100
      </div>
      <h2 style="margin:10px">Challenge Completed!</h2>
      <p>Kamu menjawab benar ${score} dari ${questions.length} soal.</p>
      <p style="margin-top:10px;font-size:12px">
        ${percentage >= 80
          ? "Excellent! Kamu sudah memahami refleksi fungsi kuadrat."
          : "Tetap semangat! Pelajari kembali teori dan pembahasannya."}
      </p>
      <button class="pinkbtn" id="retryQuiz" style="margin-top:20px">
        Coba Lagi ↻
      </button>
    </div>
  `;

  document.getElementById("progress").textContent = "Completed";
  document.getElementById("progressBar").style.width = "100%";
  document.getElementById("quizResult").textContent = "";

  document.getElementById("retryQuiz").addEventListener("click", resetQuiz);

  playSound(900);
}

function resetQuiz() {
  questionIndex = 0;
  selectedAnswers = Array(questions.length).fill(null);
  checkedAnswers = Array(questions.length).fill(false);

  renderQuiz();
  playSound(600);
}

// 6. RESET SELURUH APLIKASI
document.getElementById("resetBtn").addEventListener("click", () => {
  const confirmReset = confirm("Reset simulasi dan latihan ke kondisi awal?");

  if (!confirmReset) return;

  resetSimulation();

  exampleIndex = 0;
  renderExample();

  resetQuiz();

  openTab("home");
  playSound(500);
});

// 7. RESPONSIVE CANVAS
window.addEventListener("resize", () => {
  if (document.getElementById("p-simulation").classList.contains("active")) {
    drawGraph();
  }
});

// 8. INITIALIZATION
renderExample();
renderQuiz();
refreshSimulation();
openTab("home");

console.log("Magic Mirror berhasil dijalankan! 🪞");


/* PINK MAGICAL RIPPLE EFFECT */

document.addEventListener("click", function(event) {
  const target = event.target.closest(
    "button, .card, .quiz-option, .tab"
  );

  if (!target) return;

  const x = event.clientX;
  const y = event.clientY;

  // Glow burst
  const ripple = document.createElement("span");
  ripple.className = "magic-ripple";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  document.body.appendChild(ripple);

  setTimeout(() => ripple.remove(), 700);

  // Tiny magical sparkles
  for (let i = 0; i < 4; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "magic-sparkle";
    sparkle.textContent = "✦";

    sparkle.style.left = (x + Math.random() * 50 - 25) + "px";
    sparkle.style.top = (y + Math.random() * 50 - 25) + "px";

    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 600);
  }
});

// AMBIENT BACKGROUND MUSIC

const ambientMusic = document.getElementById("ambientMusic");
const musicBtn = document.getElementById("musicBtn");

ambientMusic.volume = 0.25;

musicBtn.addEventListener("click", async () => {
    if (ambientMusic.paused) {
        try {
            await ambientMusic.play();
            musicBtn.textContent = "♪ MUSIC ON";
        } catch (error) {
            console.log("Audio belum dapat diputar:", error);
        }
    } else {
        ambientMusic.pause();
        musicBtn.textContent = "♪ MUSIC OFF";
    }
});