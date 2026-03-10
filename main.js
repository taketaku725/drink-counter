let members = [];
let currentMetric = "total";
let nextId = 1;

/* ===== 合計 ===== */
function getTotal(member) {
  return member.dr + member.sh + member.gsh;
}

/* ===== ソート ===== */
function sortMembers(data, metric) {
  const copied = [...data];

  copied.sort((a, b) => {
    if (metric === "total") {
      const totalDiff = getTotal(b) - getTotal(a);
      if (totalDiff !== 0) return totalDiff;

      const shDiff = b.sh - a.sh;
      if (shDiff !== 0) return shDiff;

      return 0;
    }

    const diff = b[metric] - a[metric];
    if (diff !== 0) return diff;

    return 0;
  });

  return copied;
}

/* ===== 飛ばし順位 ===== */
function assignRanks(sortedData, metric) {
  let currentRank = 1;
  let sameCount = 0;

  return sortedData.map((member, index) => {
    if (index === 0) {
      return { ...member, rank: 1 };
    }

    const prev = sortedData[index - 1];

    let isSame = false;

    if (metric === "total") {
      isSame =
        getTotal(member) === getTotal(prev) &&
        member.sh === prev.sh;
    } else {
      isSame = member[metric] === prev[metric];
    }

    if (isSame) {
      sameCount++;
      return { ...member, rank: currentRank };
    } else {
      currentRank += sameCount + 1;
      sameCount = 0;
      return { ...member, rank: currentRank };
    }
  });
}

/* ===== 全体描画 ===== */
function render() {
  renderMembers();
  renderRanking();
  updateMetricButtons();
}

/* ===== メンバー一覧描画 ===== */
function renderMembers() {
  const list = document.getElementById("member-list");
  list.innerHTML = "";

  members.forEach(member => {
    const row = document.createElement("div");
    row.className = "member-row";

    row.innerHTML = `
      <div class="member-main">
        <div class="name">${member.name}</div>

        <div class="member-actions">

          <div class="counter-block dr-block">
            <span class="counter-label">dr</span>
            <button class="dec-btn" data-action="dec-dr" data-id="${member.id}">-</button>
            ${member.dr}
            <button class="inc-btn" data-action="inc-dr" data-id="${member.id}">+</button>
          </div>

          <div class="counter-block sh-block">
            <span class="counter-label">sh</span>
            <button class="dec-btn" data-action="dec-sh" data-id="${member.id}">-</button>
            ${member.sh}
            <button class="inc-btn" data-action="inc-sh" data-id="${member.id}">+</button>
          </div>
        </div>
      </div>

      <button class="delete-btn"
        data-action="delete"
        data-id="${member.id}">削除</button>
    `;

    list.appendChild(row);
  });
}

/* ===== ランキング描画 ===== */
function renderRanking() {
  const list = document.getElementById("ranking-list");
  list.innerHTML = "";

  // ヘッダー
  const header = document.createElement("div");
  header.className = "ranking-row ranking-header";
  header.innerHTML = `
    <div>順位</div>
    <div>名前</div>
    <div>杯数</div>
  `;
  list.appendChild(header);

  const sorted = sortMembers(members, currentMetric);
  const ranked = assignRanks(sorted, currentMetric);

  ranked.forEach(member => {
    const row = document.createElement("div");

    let rankClass = "";
    if (member.rank === 1) rankClass = "rank-1";
    if (member.rank === 2) rankClass = "rank-2";
    if (member.rank === 3) rankClass = "rank-3";

    row.className = `ranking-row ${rankClass}`;

    row.innerHTML = `
      <div>${member.rank}位</div>
      <div class="name">${member.name}</div>
      <div>
        ${member.dr}dr ｜ 
        ${member.sh}sh ｜ 
        ${getTotal(member)}杯
      </div>
    `;

    list.appendChild(row);
  });
}

/* ===== 指標ボタン状態更新 ===== */
function updateMetricButtons() {
  document.querySelectorAll("#metric-switch button").forEach(btn => {
    btn.classList.remove("metric-active");
    if (btn.dataset.metric === currentMetric) {
      btn.classList.add("metric-active");
    }
  });
}

/* ===== クリックイベント ===== */
document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const id = Number(e.target.dataset.id);

  if (action) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    if (action === "inc-dr") member.dr++;
    if (action === "dec-dr" && member.dr > 0) member.dr--;

    if (action === "inc-sh") member.sh++;
    if (action === "dec-sh" && member.sh > 0) member.sh--;

    if (action === "delete") {
      members = members.filter(m => m.id !== id);
    }

    render();
  }

  if (e.target.dataset.metric) {
    currentMetric = e.target.dataset.metric;
    render();
  }
});

/* ===== メンバー追加 ===== */
function addMember() {
  const input = document.getElementById("name-input");
  const name = input.value.trim();
  if (!name) return;

  members.push({
    id: nextId++,
    name,
    dr: 0,
    sh: 0
  });

  input.value = "";
  render();
}

document.getElementById("add-btn")
  .addEventListener("click", addMember);

document.getElementById("name-input")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addMember();
    }
  });

/* ===== 初回描画 ===== */
render();

