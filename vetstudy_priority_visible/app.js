

    const SUBJECTS_STORAGE_KEY = "vetstudy_subjects_v1";
    let subjectsData = [
      {key:"anatomia",icon:"🫀",name:"Anatomia",progress:32,status:"Revisar",last:"Última revisão: ontem",exam:"12 de Abril",sub:"Área dedicada para consolidar sua base anatômica na veterinária.",topics:["Sistema ósseo","Sistema muscular","Planos anatômicos"],checklist:[["Introdução",true],["Sistema ósseo",false],["Sistema muscular",false]],today:["8 flashcards para revisar","2 tópicos para avançar","1 ciclo de foco recomendado"]},
      {key:"fisiologia",icon:"🧬",name:"Fisiologia",progress:18,status:"Atrasada",last:"Última revisão: há 4 dias",exam:"20 de Abril",sub:"Entenda o funcionamento do organismo animal e suas respostas fisiológicas.",topics:["Homeostase","Sistema nervoso","Sistema cardiovascular"],checklist:[["Homeostase",true],["Sistema nervoso",false],["Sistema cardiovascular",false]],today:["1 rodada de revisão","Priorizar sistema nervoso","Retomar resumos"]},
      {key:"histologia",icon:"🧫",name:"Histologia",progress:54,status:"Em dia",last:"Última revisão: hoje",exam:"26 de Abril",sub:"Estudo microscópico dos tecidos para fortalecer a base morfofuncional.",topics:["Tecido epitelial","Tecido conjuntivo","Tecido muscular"],checklist:[["Epitelial",true],["Conjuntivo",true],["Muscular",false]],today:["Revisar 6 flashcards","Fechar tecido muscular","1 resumo curto"]},
      {key:"bioquimica",icon:"🧪",name:"Bioquímica",progress:12,status:"Revisar",last:"Última revisão: há 5 dias",exam:"30 de Abril",sub:"Conteúdo essencial para entender metabolismo e reações químicas da vida.",topics:["Proteínas","Carboidratos","Enzimas"],checklist:[["Proteínas",false],["Carboidratos",false],["Enzimas",false]],today:["Voltar em proteínas","Fazer 1 rodada de flashcards","Organizar mapa mental"]},
      {key:"microbiologia",icon:"🦠",name:"Microbiologia",progress:8,status:"Nova",last:"Ainda não revisada",exam:"08 de Maio",sub:"Introdução aos microrganismos importantes na formação veterinária.",topics:["Bactérias","Fungos","Vírus"],checklist:[["Bactérias",false],["Fungos",false],["Vírus",false]],today:["Iniciar por bactérias","Criar 3 flashcards","Fazer leitura guiada"]},
      {key:"semiologia",icon:"🐾",name:"Semiologia",progress:41,status:"Em dia",last:"Última revisão: ontem",exam:"15 de Maio",sub:"Base para avaliação clínica, anamnese e interpretação dos sinais observados.",topics:["Anamnese","Inspeção","Palpação"],checklist:[["Anamnese",true],["Inspeção",true],["Palpação",false]],today:["Treinar anamnese","Revisar inspeção","Fechar palpação"]},
      {key:"farmacologia",icon:"💊",name:"Farmacologia",progress:22,status:"Revisar",last:"Última revisão: há 3 dias",exam:"18 de Maio",sub:"Organize conceitos de fármacos, efeitos e aplicações básicas.",topics:["Farmacocinética","Farmacodinâmica","Vias de administração"],checklist:[["Farmacocinética",false],["Farmacodinâmica",false],["Vias",true]],today:["Revisar conceitos-base","10 min de leitura","1 rodada de flashcards"]},
      {key:"etologia",icon:"🐶",name:"Etologia",progress:5,status:"Nova",last:"Ainda não revisada",exam:"22 de Maio",sub:"Compreenda comportamento animal e sua importância na medicina veterinária.",topics:["Comportamento animal","Sinais comportamentais","Bem-estar"],checklist:[["Comportamento animal",false],["Sinais comportamentais",false],["Bem-estar",false]],today:["Abrir conteúdo inicial","Fazer leitura leve","Criar 2 anotações"]}
    ];


    function saveSubjectsData(){
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjectsData));
    }

    function loadSubjectsData(){
      try{
        const raw = JSON.parse(localStorage.getItem(SUBJECTS_STORAGE_KEY) || "null");
        if(Array.isArray(raw) && raw.length) subjectsData = raw;
      } catch {}
    }

    function statusPriority(status){
      if(status === "Atrasada") return 0;
      if(status === "Revisar") return 1;
      if(status === "Em dia") return 2;
      return 3;
    }

    function progressClass(progress){
      if(progress >= 70) return "progress-high";
      if(progress >= 30) return "progress-mid";
      return "progress-low";
    }

    function statusClass(status){
      return "status-" + status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-");
    }

    function renderSubjectsSummary(){
      if(!subjectsSummary) return;
      const counts = {
        atrasadas: subjectsData.filter(s => s.status === "Atrasada").length,
        revisar: subjectsData.filter(s => s.status === "Revisar").length,
        emdia: subjectsData.filter(s => s.status === "Em dia").length,
        novas: subjectsData.filter(s => s.status === "Nova").length
      };
      subjectsSummary.innerHTML = `
        <div class="summary-pill"><span class="dot-mini dot-danger"></span>${counts.atrasadas} atrasadas</div>
        <div class="summary-pill"><span class="dot-mini dot-warn"></span>${counts.revisar} revisar</div>
        <div class="summary-pill"><span class="dot-mini dot-good"></span>${counts.emdia} em dia</div>
        <div class="summary-pill"><span class="dot-mini dot-new"></span>${counts.novas} novas</div>
      `;
    }

    function bestSuggestedSubject(){
      return [...subjectsData].sort((a,b)=>{
        const diff = statusPriority(a.status)-statusPriority(b.status);
        if(diff !== 0) return diff;
        return a.progress-b.progress;
      })[0];
    }

    function renderSuggestedSubject(){
      const suggestion = bestSuggestedSubject();
      const box = document.getElementById("subjectsSuggestion");
      if(!box || !suggestion) return;
      box.querySelector("strong").textContent = `📌 Hoje você deve estudar: ${suggestion.name}`;
      box.querySelector("span").textContent =
        suggestion.status === "Atrasada" ? "Ela está atrasada e merece sua atenção primeiro." :
        suggestion.status === "Revisar" ? "Ela é a melhor opção para manter sua revisão em dia." :
        suggestion.status === "Nova" ? "Boa escolha para começar um conteúdo novo hoje." :
        "Boa opção para manter consistência e revisão ativa.";
      if(startSuggestedSubject){
        startSuggestedSubject.onclick = () => openSubject(suggestion.key, "study", "subjectsView");
      }
    }


    let pendingDeleteSubjectKey = null;

    function openDeleteSubjectModal(subjectKey){
      const subject = subjectsData.find(s => s.key === subjectKey);
      if(!subject) return;
      recalculateSubjectProgress(subject);
      pendingDeleteSubjectKey = subjectKey;
      const userName = "Sra. Rodrigues";
      if(confirmDeleteTitle){
        confirmDeleteTitle.textContent = `${userName}, tem certeza que deseja apagar a matéria ${subject.name}?`;
      }
      if(confirmDeleteModal) confirmDeleteModal.classList.add("show");
    }

    function closeDeleteSubjectModal(){
      pendingDeleteSubjectKey = null;
      if(confirmDeleteModal) confirmDeleteModal.classList.remove("show");
    }

    
const reviewModal = document.getElementById("reviewModal");
const reviewTitle = document.getElementById("reviewTitle");
const reviewContent = document.getElementById("reviewContent");
const closeReview = document.getElementById("closeReview");
const navHomeBtn = document.getElementById("navHomeBtn");
const navSubjectsBtn = document.getElementById("navSubjectsBtn");
const navFlashcardsBtn = document.getElementById("navFlashcardsBtn");
const backToHomeFromFlashcards = document.getElementById("backToHomeFromFlashcards");
const quizGridClone = document.getElementById("quizGridClone");
const swapBtnClone = document.getElementById("swapBtnClone");
const repeatLevelBtnClone = document.getElementById("repeatLevelBtnClone");
const continueSessionBtnClone = document.getElementById("continueSessionBtnClone");
const sessionSummaryClone = document.getElementById("sessionSummaryClone");
const sessionSummaryTextClone = document.getElementById("sessionSummaryTextClone");
const flashProgressTextClone = document.getElementById("flashProgressTextClone");
const flashProgressBarClone = document.getElementById("flashProgressBarClone");
const levelLabelClone = document.getElementById("levelLabelClone");


function openReview(subject){
  normalizeSubjectStructure(subject);
  reviewTitle.textContent = subject.name;
  reviewContent.innerHTML = `
    <h4>Tópicos</h4>
    ${subject.topicCards.length
      ? subject.topicCards.map(topic => `
          <div class="review-read-item"><strong>${topic.title}</strong></div>
          ${topic.tasks.length
            ? topic.tasks.map(task => `<div class="review-read-item" style="margin-left:12px;">${task.done ? "✅" : "⬜"} ${task.text}</div>`).join("")
            : '<div class="review-read-item" style="margin-left:12px;">Nenhuma tarefa neste tópico.</div>'
          }
        `).join("")
      : '<div class="review-read-item">Nenhum tópico adicionado.</div>'
    }
  `;
  reviewModal.classList.add("show");
}

if(closeReview){
  closeReview.onclick = ()=> { if(reviewModal) reviewModal.classList.remove("show"); };
}

function openSubjectModal(){
      if(subjectModal) subjectModal.classList.add("show");
      if(newSubjectName) newSubjectName.focus();
    }

    function closeSubjectModal(){
      if(subjectModal) subjectModal.classList.remove("show");
      if(newSubjectName) newSubjectName.value = "";
      if(newSubjectIcon) newSubjectIcon.value = "";
      if(newSubjectStatus) newSubjectStatus.value = "Nova";
      if(createSubjectBtn && createSubjectBtn.dataset.editKey) delete createSubjectBtn.dataset.editKey;
    }


    let subjectDetailBackTarget = "subjectsView";

    function showPage(pageId){
      document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
      const next = document.getElementById(pageId);
      if(next) next.classList.add("active");
      window.scrollTo({top:0, behavior:"smooth"});
    }



    
    function renderSubjectsPage(){
      const grid = document.getElementById("subjectsPageGrid");
      if(!grid) return;

      const ordered = [...subjectsData].sort((a,b)=>{
        const diff = statusPriority(a.status)-statusPriority(b.status);
        if(diff !== 0) return diff;
        return a.progress-b.progress;
      });

      renderSubjectsSummary();
      renderSuggestedSubject();

      grid.innerHTML = ordered.map(subject => `
        <div class="subject-overview-card" data-subject="${subject.key}">
          <div class="subject-overview-head">
            <div class="subject-overview-name"><span>${subject.icon}</span><span>${subject.name}</span></div>
            <div class="subject-status ${statusClass(subject.status)}">${subject.status}</div>
          </div>
          <div class="subject-last">${subject.last}</div>
          <div class="subject-progress-line">
            <div class="meta"><span>Progresso</span><span>${subject.progress}%</span></div>
            <div class="track"><span class="${progressClass(subject.progress)}" style="width:${subject.progress}%"></span></div>
          </div>
          <div class="quick-actions">
            <button class="quick-chip" type="button" data-action="review" data-subject="${subject.key}">🔁 Revisar</button>
            <button class="quick-chip" type="button" data-action="edit" data-subject="${subject.key}">⚙️ Editar</button>
          </div>
          <button class="delete-subject-btn" type="button" data-action="delete" data-subject="${subject.key}" aria-label="Excluir matéria">✕</button>
        </div>
      `).join("");

      grid.querySelectorAll(".subject-overview-card").forEach(card => {
        card.addEventListener("click", (e) => {
          if(e.target.closest(".quick-chip") || e.target.closest(".delete-subject-btn")) return;
          openSubject(card.dataset.subject, "study", "subjectsView");
        });
      });

      grid.querySelectorAll('.quick-chip[data-action="review"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const s = subjectsData.find(x => x.key === btn.dataset.subject);
          if(!s){ showToast("Matéria não encontrada."); return; }
          openReview(s);
        });
      });

      grid.querySelectorAll('.quick-chip[data-action="edit"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const s = subjectsData.find(x => x.key === btn.dataset.subject);
          if(!s) return;
          newSubjectName.value = s.name;
          newSubjectIcon.value = s.icon;
          newSubjectStatus.value = s.status;
          if(createSubjectBtn) createSubjectBtn.dataset.editKey = s.key;
          openSubjectModal();
        });
      });

      grid.querySelectorAll('.delete-subject-btn').forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          openDeleteSubjectModal(btn.dataset.subject);
        });
      });
    }

function openSubject(subjectKey, mode = "study", backTarget = "subjectsView"){
      const subject = subjectsData.find(s => s.key === subjectKey);
      if(!subject) return;

      subjectDetailBackTarget = backTarget;
      const isReview = mode === "review";
      document.getElementById("detailSubjectTitle").textContent = `${subject.icon} ${subject.name}`;
      document.getElementById("detailSubjectSub").textContent = isReview
        ? `Área de revisão rápida de ${subject.name}, focada no que já foi visto.`
        : subject.sub;
      if(detailModeBadge){
        detailModeBadge.textContent = isReview ? "Modo: revisão rápida 🧠" : "Modo: estudo normal";
      }
      document.getElementById("detailSubjectProgress").textContent = `${subject.progress}%`;
      document.getElementById("detailSubjectBar").style.width = `${subject.progress}%`;
      document.getElementById("detailExamDate").textContent = subject.exam;

      if(isReview){
        const topics = subject.topics.slice(0, 2).map(t => `Revisar: ${t}`);
        const today = [
          "Sessão curta de revisão",
          "Flashcards do que já foi estudado",
          "Erros anteriores para retomar"
        ];
        document.getElementById("detailTopics").innerHTML = topics.map(t => `<div class="topic-item">📘 ${t}</div>`).join("");
        document.getElementById("detailChecklist").innerHTML = subject.checklist.map(c => `<div class="check-item">${c[1] ? "✅" : "⬜"} ${c[0]}</div>`).join("");
        document.getElementById("detailTodayPlan").innerHTML = today.map(i => `<div class="review-item">✨ ${i}</div>`).join("");
      } else {
        renderSubjectManager(subject);
        document.getElementById("detailTodayPlan").innerHTML = subject.today.map(i => `<div class="review-item">✨ ${i}</div>`).join("");
      }

      showToast(isReview ? `Revisão rápida iniciada em ${subject.name} 🧠` : `Iniciando sessão de estudo em ${subject.name} 📚`);
      showPage("subjectDetailView");
    }



    const TOPIC_COLORS = ["#f9a8d4","#8ee3ff","#a7f3d0","#fde68a","#c4b5fd","#fca5a5","#93c5fd","#86efac"];

function normalizeSubjectStructure(subject){
  if(!subject.topicCards){
    subject.topicCards = (subject.topics || []).map((topic, idx) => ({
      id:`topic-${Date.now()}-${idx}`,
      title:topic,
      color:TOPIC_COLORS[idx % TOPIC_COLORS.length],
      open: idx === 0,
      priority:"low",
      tasks:[]
    }));
    if(Array.isArray(subject.checklist) && subject.checklist.length){
      if(!subject.topicCards.length){
        subject.topicCards.push({id:`topic-${Date.now()}-base`, title:"Geral", color:TOPIC_COLORS[0], open:true, priority:"low", tasks:[]});
      }
      subject.topicCards[0].tasks = subject.checklist.map((task, i) => ({
        id:`task-${Date.now()}-${i}`,
        text:Array.isArray(task) ? task[0] : String(task),
        done:Array.isArray(task) ? !!task[1] : false
      }));
    }
  }
}



function recalculateSubjectProgress(subject){
  normalizeSubjectStructure(subject);
  const topics = subject.topicCards || [];
  const totalTasks = topics.reduce((sum, topic) => sum + ((topic.tasks || []).length), 0);
  const doneTasks = topics.reduce((sum, topic) => sum + ((topic.tasks || []).filter(task => task.done).length), 0);

  if(totalTasks > 0){
    subject.progress = Math.round((doneTasks / totalTasks) * 100);
  }
  return subject.progress || 0;
}

function getTopicCompletion(topic){
  const total = Array.isArray(topic.tasks) ? topic.tasks.length : 0;
  const done = Array.isArray(topic.tasks) ? topic.tasks.filter(task => task.done).length : 0;
  return { total, done, completed: total > 0 && done === total };
}

function setTopicPriority(subjectKey, topicId, priority){
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.map(topic => topic.id === topicId ? {...topic, priority, open:true} : topic);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Prioridade atualizada.");
}

function togglePriorityMenu(topicId){
  const target = document.querySelector(`.priority-menu[data-topic-id="${topicId}"]`);
  document.querySelectorAll('.priority-menu').forEach(menu => {
    if(menu !== target) menu.classList.remove('show');
  });
  if(target) target.classList.toggle('show');
}

function getSubjectByKey(subjectKey){
  return subjectsData.find(s => s.key === subjectKey);
}

function addTopicCard(subjectKey){
  const input = document.getElementById("newTopicCardInput");
  const value = (input?.value || "").trim();
  if(!value){ showToast("Digite o nome do tópico."); return; }
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards.push({
    id:`topic-${Date.now()}`,
    title:value,
    color:TOPIC_COLORS[subject.topicCards.length % TOPIC_COLORS.length],
    open:true,
    tasks:[]
  });
  recalculateSubjectProgress(subject);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Tópico criado ✨");
}

function removeTopicCard(subjectKey, topicId){
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.filter(topic => topic.id !== topicId);
  recalculateSubjectProgress(subject);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Tópico removido.");
}

function toggleTopicCard(subjectKey, topicId){
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.map(topic => topic.id === topicId ? {...topic, open: !topic.open} : topic);
  saveSubjectsData();
  renderSubjectManager(subject);
}


function toggleTaskInsideTopic(subjectKey, topicId, taskId){
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.map(topic => {
    if(topic.id !== topicId) return topic;
    return {
      ...topic,
      open:true,
      tasks: topic.tasks.map(task => task.id === taskId ? {...task, done: !task.done} : task)
    };
  });
  recalculateSubjectProgress(subject);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Tarefa atualizada ✅");
}

function addTaskInsideTopic(subjectKey, topicId){
  const input = document.getElementById(`task-input-${topicId}`);
  const value = (input?.value || "").trim();
  if(!value){ showToast("Digite a tarefa."); return; }
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.map(topic => topic.id === topicId ? {...topic, open:true, tasks:[...topic.tasks, {id:`task-${Date.now()}`, text:value, done:false}]} : topic);
  recalculateSubjectProgress(subject);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Tarefa adicionada ✅");
}

function removeTaskInsideTopic(subjectKey, topicId, taskId){
  const subject = getSubjectByKey(subjectKey);
  if(!subject) return;
  normalizeSubjectStructure(subject);
  subject.topicCards = subject.topicCards.map(topic => topic.id === topicId ? {...topic, open:true, tasks:topic.tasks.filter(task => task.id !== taskId)} : topic);
  recalculateSubjectProgress(subject);
  saveSubjectsData();
  renderSubjectManager(subject);
  showToast("Tarefa removida.");
}

function renderSubjectManager(subject){
      normalizeSubjectStructure(subject);

      const topicCardsHtml = subject.topicCards.map((topic) => {
        const { total, done, completed } = getTopicCompletion(topic);
        const priority = topic.priority || "low";
        const priorityLabel = priority === "urgent" ? "Urgente" : priority === "medium" ? "Média" : "Baixa";

        const tasksHtml = topic.tasks.length
          ? topic.tasks.map(task => `
              <div class="task-item ${task.done ? "done" : ""}">
                <div class="task-left">
                  <button class="task-check-btn ${task.done ? "done" : ""}" type="button" onclick="toggleTaskInsideTopic('${subject.key}', '${topic.id}', '${task.id}')">${task.done ? "✓" : ""}</button>
                  <span>${task.text}</span>
                </div>
                <div class="task-actions">
                  <button type="button" onclick="removeTaskInsideTopic('${subject.key}', '${topic.id}', '${task.id}')">✕</button>
                </div>
              </div>
            `).join("")
          : `<div class="task-empty">Nenhuma tarefa neste tópico ainda.</div>`;

        return `
          <div class="topic-card ${topic.open ? "open" : ""} ${completed ? "completed" : ""}" style="--topic-color:${topic.color}">
            <div class="topic-card-head" onclick="toggleTopicCard('${subject.key}', '${topic.id}')">
              <div class="topic-card-left">
                <div class="topic-toggle">▶</div>
                <div class="topic-title">${topic.title}</div>
              </div>
              <div class="topic-head-right">
                <div class="topic-count">${done}/${total}</div>
                <div class="topic-priority ${priority}" onclick="event.stopPropagation(); togglePriorityMenu('${topic.id}')">
                  ${priorityLabel}
                  <div class="priority-menu" data-topic-id="${topic.id}">
                    <button class="priority-option low" type="button" onclick="event.stopPropagation(); setTopicPriority('${subject.key}', '${topic.id}', 'low')">Baixa</button>
                    <button class="priority-option medium" type="button" onclick="event.stopPropagation(); setTopicPriority('${subject.key}', '${topic.id}', 'medium')">Média</button>
                    <button class="priority-option urgent" type="button" onclick="event.stopPropagation(); setTopicPriority('${subject.key}', '${topic.id}', 'urgent')">Urgente</button>
                  </div>
                </div>
                <button class="topic-icon-btn delete" type="button" onclick="event.stopPropagation(); removeTopicCard('${subject.key}', '${topic.id}')">✕</button>
              </div>
            </div>
            <div class="topic-card-body">
              <div class="task-add-row">
                <input id="task-input-${topic.id}" type="text" placeholder="Adicionar tarefa dentro deste tópico...">
                <button type="button" onclick="addTaskInsideTopic('${subject.key}', '${topic.id}')">Adicionar tarefa</button>
              </div>
              <div class="task-list">${tasksHtml}</div>
            </div>
          </div>
        `;
      }).join("");

      document.getElementById("detailTopics").innerHTML = `
        <div class="topic-create-row">
          <input id="newTopicCardInput" type="text" placeholder="Adicionar novo tópico">
          <button type="button" onclick="addTopicCard('${subject.key}')">+ Tópico</button>
        </div>
        <div class="topic-cards-wrap">
          ${topicCardsHtml || '<div class="manage-item"><span>Nenhum tópico ainda.</span></div>'}
        </div>
      `;

      document.getElementById("detailChecklist").innerHTML = ``;
    }

window.openReview = openReview;
window.openSubject = openSubject;
window.addTopicCard = addTopicCard;
window.removeTopicCard = removeTopicCard;
window.addTaskInsideTopic = addTaskInsideTopic;
window.removeTaskInsideTopic = removeTaskInsideTopic;
window.toggleTaskInsideTopic = toggleTaskInsideTopic;
window.setTopicPriority = setTopicPriority;
window.togglePriorityMenu = togglePriorityMenu;
window.toggleTopicCard = toggleTopicCard;

const LOGIN_USER = "Momor";
    const LOGIN_PASS = "Veterinaria";
    const APP_STATE_KEY = "vetstudy_app_state_v1";

    const loginBtn = document.getElementById("loginBtn");
    const loginUser = document.getElementById("loginUser");
    const loginPass = document.getElementById("loginPass");
    const loginError = document.getElementById("loginError");
    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");
    const mobileTabbar = document.getElementById("mobileTabbar");
    const logoutBtn = document.getElementById("logoutBtn");

    const togglePass = document.getElementById("togglePass");

    loginBtn.addEventListener("click", handleLogin);
    loginPass.addEventListener("keydown", e => { if(e.key === "Enter") handleLogin(); });
    loginUser.addEventListener("keydown", e => { if(e.key === "Enter") handleLogin(); });
    togglePass.addEventListener("click", () => {
      const hidden = loginPass.type === "password";
      loginPass.type = hidden ? "text" : "password";
      togglePass.textContent = hidden ? "🙈" : "👁";
      togglePass.setAttribute("aria-label", hidden ? "Ocultar senha" : "Mostrar senha");
    });
    
    function renderQuizCardsInto(container, pair){
      if(!container) return;
      container.innerHTML = pair.map((card, idx) => `
        <div class="quiz-mini ${card.state || ""}">
          <div class="quiz-thumb">${card.img ? `<img src="${card.img}" alt="">` : ""}</div>
          <div class="quiz-question">${card.q}</div>
          <div class="quiz-options">
            ${card.opts.map((opt, optIdx) => {
              const cls = card.answered ? (optIdx === card.c ? 'correct' : (optIdx === card.selected && card.selected !== card.c ? 'wrong' : '')) : '';
              return `<button class="${cls}" type="button" data-card="${idx}" data-opt="${optIdx}" ${card.answered ? 'disabled' : ''}>${opt}</button>`;
            }).join("")}
          </div>
          <div class="quiz-feedback ${card.feedback ? "show " + (card.state || "") : ""}">${card.feedback || ""}</div>
        </div>
      `).join("");
    }

    
    let pageCurrentLevel = "easy";
    let pageCurrentPair = [];
    let pageIsSwitching = false;
    const pageReviewedByLevel = { easy: 0, medium: 0, hard: 0 };
    const pageUsedPairsByLevel = { easy: [], medium: [], hard: [] };

    function pageGetFlashcards(){
      return flashcardSets[pageCurrentLevel] || [];
    }

    function pageShuffleItem(item){
      const original = { ...item, opts:[...(item.opts || [])] };
      const indexed = original.opts.map((opt, idx) => ({ opt, idx }));
      for(let i = indexed.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
      }
      return {
        ...original,
        opts: indexed.map(x => x.opt),
        c: indexed.findIndex(x => x.idx === original.c),
        answered:false,
        selected:null,
        state:"",
        feedback:""
      };
    }

    function pagePickTwo(){
      const cards = pageGetFlashcards();
      const total = cards.length;
      let used = pageUsedPairsByLevel[pageCurrentLevel] || [];

      if(used.length >= total){
        used = [];
      }

      let available = cards.map((_, i) => i).filter(i => !used.includes(i));
      if(available.length < 2){
        available = cards.map((_, i) => i);
      }

      const chosen = available.sort(() => Math.random() - 0.5).slice(0, 2);
      pageUsedPairsByLevel[pageCurrentLevel] = [...used, ...chosen];

      return chosen.map(i => pageShuffleItem(cards[i]));
    }

    function pageApplyLevelVisual(){
      const flashPage = document.getElementById("flashcardsView");
      if(flashPage){
        flashPage.classList.remove("level-easy","level-medium","level-hard");
        flashPage.classList.add(`level-${pageCurrentLevel}`);
      }
      document.querySelectorAll('#flashcardsView .flash-select').forEach(btn => {
        btn.classList.remove("active");
        if(btn.dataset.level === pageCurrentLevel){
          btn.classList.add("active");
        }
      });
      if(levelLabelClone){
        levelLabelClone.textContent =
          pageCurrentLevel === "easy" ? "Nível - Fácil" :
          pageCurrentLevel === "medium" ? "Nível - Médio" : "Nível - Difícil";
      }
    }

    function pageUpdateProgress(){
      const total = pageGetFlashcards().length;
      const reviewed = Math.min(pageReviewedByLevel[pageCurrentLevel], total);
      if(flashProgressTextClone){
        flashProgressTextClone.textContent = `Progresso do nível: ${reviewed}/${total}`;
      }
      if(flashProgressBarClone){
        flashProgressBarClone.style.width = total ? `${(reviewed / total) * 100}%` : "0%";
      }
      pageApplyLevelVisual();
    }

    function pageHideSummary(){
      if(sessionSummaryClone) sessionSummaryClone.classList.remove("show");
      if(repeatLevelBtnClone) repeatLevelBtnClone.classList.remove("show");
    }

    function pageShowSummary(doneLevel){
      if(!sessionSummaryClone || !sessionSummaryTextClone) return;
      sessionSummaryClone.classList.add("show");
      if(doneLevel){
        sessionSummaryTextClone.innerHTML = `Você concluiu o nível ${pageCurrentLevel === 'easy' ? 'Fácil' : pageCurrentLevel === 'medium' ? 'Médio' : 'Difícil'} 🧠<small>Agora você pode repetir o nível ou continuar estudando.</small>`;
      } else {
        const total = pageGetFlashcards().length;
        const remaining = Math.max(total - pageReviewedByLevel[pageCurrentLevel], 0);
        sessionSummaryTextClone.innerHTML = `Boa! você finalizou essa rodada 🔥<small>Restam ${remaining} flashcards neste nível.</small>`;
      }
      if(repeatLevelBtnClone) repeatLevelBtnClone.classList.add("show");
    }

    function renderQuizCardsInto(container, pair){
      if(!container) return;
      container.innerHTML = pair.map((card, idx) => `
        <div class="quiz-mini ${card.state || ""}">
          <div class="quiz-thumb">${card.img ? `<img src="${card.img}" alt="">` : ""}</div>
          <div class="quiz-question">${card.q}</div>
          <div class="quiz-options">
            ${card.opts.map((opt, optIdx) => {
              const cls = card.answered ? (optIdx === card.c ? 'correct' : (optIdx === card.selected && card.selected !== card.c ? 'wrong' : '')) : '';
              return `<button class="${cls}" type="button" data-card="${idx}" data-opt="${optIdx}" ${card.answered ? 'disabled' : ''}>${opt}</button>`;
            }).join("")}
          </div>
          <div class="quiz-feedback ${card.feedback ? "show " + (card.state || "") : ""}">${card.feedback || ""}</div>
        </div>
      `).join("");
    }

    function syncFlashcardsView(){
      if(!quizGridClone) return;
      pageApplyLevelVisual();
      pageUpdateProgress();
      renderQuizCardsInto(quizGridClone, pageCurrentPair);

      if(swapBtnClone){
        swapBtnClone.style.display = pageCurrentPair.length && pageCurrentPair.every(card => card.answered) ? "inline-flex" : "none";
        swapBtnClone.textContent = "Próximos flashcards";
      }

      if(repeatLevelBtnClone){
        repeatLevelBtnClone.classList.remove("show");
      }

      quizGridClone.querySelectorAll("button[data-card]").forEach(btn => {
        btn.addEventListener("click", () => {
          pageAnswerQuiz(Number(btn.dataset.card), Number(btn.dataset.opt));
        });
      });
    }

    function pageRenderPair(){
      pageHideSummary();
      pageCurrentPair = pagePickTwo() || [];
      syncFlashcardsView();
    }

    function pageSetLevel(level){
      if(pageIsSwitching) return;
      if(!["easy","medium","hard"].includes(level)) return;

      pageIsSwitching = true;
      pageCurrentLevel = level;
      pageCurrentPair = [];
      pageHideSummary();
      pageRenderPair();

      setTimeout(() => {
        pageIsSwitching = false;
      }, 120);
    }

    function pageAnswerQuiz(cardIndex, optionIndex){
      const item = pageCurrentPair[cardIndex];
      if(!item || item.answered) return;

      item.answered = true;
      item.selected = optionIndex;

      const isCorrect = optionIndex === item.c;
      const correctText = item.opts[item.c];
      const explanation = item.explanation || item.exp || `A resposta correta é "${correctText}", porque ela corresponde ao conceito principal dessa pergunta.`;

      item.state = isCorrect ? "correct" : "wrong";
      item.feedback = isCorrect
        ? `<strong>✅ Boa! Você acertou essa.</strong>${explanation}`
        : `<strong>❌ Ops! A correta era: ${correctText}.</strong>${explanation}`;

      pageReviewedByLevel[pageCurrentLevel] = Math.min(pageReviewedByLevel[pageCurrentLevel] + 1, pageGetFlashcards().length);

      syncFlashcardsView();

      if(pageCurrentPair.every(card => card.answered)){
        const doneLevel = pageReviewedByLevel[pageCurrentLevel] >= pageGetFlashcards().length;
        pageShowSummary(doneLevel);
        if(swapBtnClone){
          swapBtnClone.style.display = doneLevel ? "none" : "inline-flex";
        }
        if(repeatLevelBtnClone){
          repeatLevelBtnClone.classList.add("show");
        }
      }
    }

    if(swapBtnClone){
      swapBtnClone.addEventListener("click", () => {
        pageRenderPair();
      });
    }

    if(continueSessionBtnClone){
      continueSessionBtnClone.addEventListener("click", () => {
        pageRenderPair();
      });
    }

    if(repeatLevelBtnClone){
      repeatLevelBtnClone.addEventListener("click", () => {
        pageReviewedByLevel[pageCurrentLevel] = 0;
        pageUsedPairsByLevel[pageCurrentLevel] = [];
        pageRenderPair();
      });
    }


document.querySelectorAll('#flashcardsView .flash-select').forEach(btn => {
  btn.addEventListener('click', () => {
    pageSetLevel(btn.dataset.level);
  });
});

document.addEventListener('click', (e) => {
  if(!e.target.closest('.topic-priority')){
    document.querySelectorAll('.priority-menu').forEach(menu => menu.classList.remove('show'));
  }
});

logoutBtn.addEventListener("click", () => {
      app.style.display = "none";
      loginScreen.style.display = "flex";
      mobileTabbar?.classList.add("hidden");
      showPage("homeView");
      loginUser.value = "";
      loginPass.value = "";
      loginError.textContent = "";
    });

    function handleLogin(){
      const u = loginUser.value.trim();
      const p = loginPass.value.trim();
      if(u === LOGIN_USER && p === LOGIN_PASS){
        loginScreen.style.display = "none";
        app.style.display = "block";
        mobileTabbar?.classList.remove("hidden");
        loginError.textContent = "";

        const saved = loadAppState();
        resetFlashcardProgress();
        updateFlashProgress();
    if(typeof syncFlashcardsView === "function") syncFlashcardsView();

        if(saved.subjectsOpen){
          subjectsBoard.classList.add("show");
          studyTitle.textContent = "Certo, Sra. Rodrigues... o que vamos estudar hoje? 👀";
          studySubtitle.textContent = "Escolha uma matéria abaixo para seguir direto para o que importa.";
          studyToggle.textContent = "Ocultar matérias";
          activitiesBtn.classList.add("show");
          studyPlanCard.classList.add("show");
          applyCalendarVisibility(true);
        } else {
          applyCalendarVisibility(false);
        }
        saveAppState();
      } else {
        loginError.textContent = "Usuário ou senha incorretos.";
      }
    }


    function saveAppState(){
      const state = {
        subjectsOpen: subjectsBoard ? subjectsBoard.classList.contains("show") : false,
        calendarUnlocked: subjectsBoard ? subjectsBoard.classList.contains("show") : false
      };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    }

    function loadAppState(){
      try{
        return JSON.parse(localStorage.getItem(APP_STATE_KEY) || "{}");
      } catch {
        return {};
      }
    }

    function resetFlashcardProgress(){
      currentLevel = "easy";
      flashcards = flashcardSets[currentLevel];
      currentPair = [];
      answeredCount = 0;

      Object.keys(reviewedByLevel).forEach(level => reviewedByLevel[level] = 0);
      Object.keys(reviewedInSession).forEach(level => reviewedInSession[level] = 0);
      Object.keys(usedPairsByLevel).forEach(level => usedPairsByLevel[level] = []);

      pageCurrentLevel = "easy";
      pageCurrentPair = [];
      pageIsSwitching = false;
      Object.keys(pageReviewedByLevel).forEach(level => pageReviewedByLevel[level] = 0);
      Object.keys(pageUsedPairsByLevel).forEach(level => pageUsedPairsByLevel[level] = []);

      hideSessionSummary();
      pageHideSummary();
      updateQuizLevelTheme();
      renderQuizPair(false);
      syncFlashcardsView();
    }

    function applyCalendarVisibility(isOpen){
      calendarUnlocked = !!isOpen;

      if(calendarUnlocked){
        if(calendarClosedState) calendarClosedState.style.display = "none";
        if(btnProvas) btnProvas.classList.add("active");
        if(btnProgress) btnProgress.classList.remove("active");
        if(progressWrap) progressWrap.classList.remove("show");
        if(calendarMode) calendarMode.style.display = "block";
      } else {
        if(calendarClosedState) calendarClosedState.style.display = "grid";
        if(calendarMode) calendarMode.style.display = "none";
        if(progressWrap) progressWrap.classList.remove("show");
        if(btnProvas) btnProvas.classList.add("active");
        if(btnProgress) btnProgress.classList.remove("active");
      }
    }

    // Banner
    const slides = [...document.querySelectorAll(".slide")];
    const dots = [...document.querySelectorAll(".banner-dots button")];
    let currentSlide = 0;
    function goSlide(index){
      currentSlide = index;
      slides.forEach((slide,i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot,i) => dot.classList.toggle("active", i === index));
    }
    dots.forEach(dot => dot.addEventListener("click", () => goSlide(Number(dot.dataset.slide))));
    setInterval(() => goSlide((currentSlide + 1) % slides.length), 4200);

    // Subjects board
    const studyToggle = document.getElementById("studyToggle");
    const activitiesBtn = document.getElementById("activitiesBtn");
    const subjectsBoard = document.getElementById("subjectsBoard");
    const studyTitle = document.getElementById("studyTitle");
    const studySubtitle = document.getElementById("studySubtitle");
    const studyPlanCard = document.getElementById("studyPlanCard");
    let calendarUnlocked = false;
    const calendarClosedState = document.getElementById("calendarClosedState");
    const flashProgressText = document.getElementById("flashProgressText");
    const flashProgressBar = document.getElementById("flashProgressBar");

    studyToggle.addEventListener("click", () => {
      const willShow = !subjectsBoard.classList.contains("show");
      subjectsBoard.classList.toggle("show");
      if(willShow){
        studyTitle.textContent = "Certo, Sra. Rodrigues... o que vamos estudar hoje? 👀";
        studySubtitle.textContent = "Escolha uma matéria abaixo para seguir direto para o que importa.";
        studyToggle.textContent = "Ocultar matérias";
        activitiesBtn.classList.add("show");
        studyPlanCard.classList.add("show");
        applyCalendarVisibility(true);
      } else {
        studyTitle.textContent = "EIIII, VOCÊ AINDA NÃO ESTUDOU HOJE!";
        studySubtitle.textContent = "Clique no botão abaixo para abrir suas matérias e começar agora.";
        studyToggle.textContent = "Começar a estudar";
        activitiesBtn.classList.remove("show");
        studyPlanCard.classList.remove("show");
        applyCalendarVisibility(false);
      }
      saveAppState();
      if(typeof syncFlashcardsView === "function") syncFlashcardsView();
    });
    activitiesBtn.addEventListener("click", () => {
      renderSubjectsPage();
      showPage("subjectsView");
    });

    document.getElementById("backToHomeFromSubjects").addEventListener("click", () => showPage("homeView"));
document.getElementById("backToSubjects").addEventListener("click", () => showPage(subjectDetailBackTarget));
if(backToHomeFromFlashcards) backToHomeFromFlashcards.addEventListener("click", () => showPage("homeView"));
if(navHomeBtn) navHomeBtn.addEventListener("click", () => showPage("homeView"));
if(navSubjectsBtn) navSubjectsBtn.addEventListener("click", () => { renderSubjectsPage(); showPage("subjectsView"); });
if(navFlashcardsBtn) navFlashcardsBtn.addEventListener("click", () => {
  if(!pageCurrentPair.length){
    pageRenderPair();
  } else {
    syncFlashcardsView();
  }
  showPage("flashcardsView");
});

    document.getElementById("backToSubjects").addEventListener("click", () => showPage(subjectDetailBackTarget));

    loadSubjectsData();

    document.querySelectorAll(".subject-card-mini").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const wanted = (card.dataset.subjectName || "").trim().toLowerCase();
        const subject = subjectsData.find(s => s.name.trim().toLowerCase() === wanted);
        if(!subject){
          showToast("Não encontrei essa matéria.");
          return;
        }
        openSubject(subject.key, "study", "homeView");
      });
    });

    if(openSubjectModalBtn) openSubjectModalBtn.addEventListener("click", openSubjectModal);
    if(closeSubjectModalBtn) closeSubjectModalBtn.addEventListener("click", closeSubjectModal);
    if(cancelSubjectBtn) cancelSubjectBtn.addEventListener("click", closeSubjectModal);
    if(subjectModal) subjectModal.addEventListener("click", (e) => {
      if(e.target === subjectModal) closeSubjectModal();
    });

    if(confirmDeleteModal) confirmDeleteModal.addEventListener("click", (e) => {
      if(e.target === confirmDeleteModal) closeDeleteSubjectModal();
    });
    if(cancelDeleteSubjectBtn) cancelDeleteSubjectBtn.addEventListener("click", closeDeleteSubjectModal);
    if(confirmDeleteSubjectBtn) confirmDeleteSubjectBtn.addEventListener("click", () => {
      if(!pendingDeleteSubjectKey) return;
      const subject = subjectsData.find(s => s.key === pendingDeleteSubjectKey);
      subjectsData = subjectsData.filter(s => s.key !== pendingDeleteSubjectKey);
      saveSubjectsData();
      renderSubjectsPage();
      closeDeleteSubjectModal();
      showToast(subject ? `${subject.name} foi apagada.` : "Matéria apagada.");
    });

    if(createSubjectBtn) createSubjectBtn.addEventListener("click", () => {
      const name = (newSubjectName.value || "").trim();
      const icon = (newSubjectIcon.value || "").trim() || "📘";
      const status = newSubjectStatus.value || "Nova";

      if(!name){
        showToast("Digite o nome da matéria.");
        return;
      }

      const editKey = createSubjectBtn.dataset.editKey;
      if(editKey){
        const subject = subjectsData.find(s => s.key === editKey);
        if(subject){
          subject.name = name;
          subject.icon = icon;
          subject.status = status;
        }
        saveSubjectsData();
        renderSubjectsPage();
        closeSubjectModal();
        showToast("Matéria atualizada ✨");
        return;
      }

      const keyBase = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      subjectsData.push({
        key: keyBase + "-" + Date.now(),
        icon,
        name,
        progress: 0,
        status,
        last: "Ainda não revisada",
        exam: "Sem prova definida",
        sub: `Área dedicada para estudar ${name} com mais foco.`,
        topics: ["Introdução", "Primeiro tópico", "Revisão inicial"],
        checklist: [["Introdução", false], ["Primeiro tópico", false], ["Revisão inicial", false]],
        today: ["Criar primeiros flashcards", "Organizar resumo", "Definir meta do dia"]
      });

      saveSubjectsData();
      renderSubjectsPage();
      closeSubjectModal();
      showToast("Nova matéria criada ✅");
    });

    // Toast
    function showToast(text){
      const toast = document.getElementById("toast");
      toast.textContent = text;
      toast.classList.add("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
    }

    // Flashcards mini game

    const flashcardsEasy = [
      {
            "q": "Qual etapa vem antes do diagnóstico?",
            "opts": [
                  "Anamnese",
                  "Alta médica"
            ],
            "c": 0,
            "exp": "A anamnese coleta o histórico e orienta a avaliação clínica.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "O que a palpação permite avaliar?",
            "opts": [
                  "Estruturas pelo toque",
                  "Somente exames laboratoriais"
            ],
            "c": 0,
            "exp": "Palpação ajuda a perceber dor, volume, textura e alterações.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Frequência cardíaca é:",
            "opts": [
                  "Número de batimentos por minuto",
                  "Quantidade de respirações"
            ],
            "c": 0,
            "exp": "Frequência cardíaca mede quantos batimentos ocorrem em um minuto.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Mucosas ajudam a avaliar:",
            "opts": [
                  "Perfusão e hidratação",
                  "Tipo de alimentação"
            ],
            "c": 0,
            "exp": "Cor e aspecto das mucosas ajudam na avaliação clínica geral.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Cavalos são classificados como:",
            "opts": [
                  "Grandes animais",
                  "Pequenos animais"
            ],
            "c": 0,
            "exp": "Na rotina veterinária, cavalos entram em grandes animais.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Na avaliação de um cavalo, a marcha pode mostrar:",
            "opts": [
                  "Claudicação",
                  "Tipo sanguíneo"
            ],
            "c": 0,
            "exp": "Observar a marcha ajuda a identificar alterações locomotoras.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Bovinos são muito associados a:",
            "opts": [
                  "Produção animal",
                  "Apenas animais exóticos"
            ],
            "c": 0,
            "exp": "Bovinos fazem parte da rotina de produção animal.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "No manejo de bovinos, acompanhar o rebanho ajuda em:",
            "opts": [
                  "Saúde e produtividade",
                  "Somente estética"
            ],
            "c": 0,
            "exp": "O acompanhamento do rebanho impacta saúde e produção.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Aves podem ser estudadas em:",
            "opts": [
                  "Produção e clínica",
                  "Somente grandes animais"
            ],
            "c": 0,
            "exp": "Aves aparecem tanto em produção quanto em atendimento clínico.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "O bico e as penas ajudam a observar:",
            "opts": [
                  "Condição geral do animal",
                  "Resultados financeiros"
            ],
            "c": 0,
            "exp": "Aspectos externos ajudam a perceber alterações de saúde.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Cobras pertencem ao grupo dos:",
            "opts": [
                  "Répteis",
                  "Anfíbios"
            ],
            "c": 0,
            "exp": "Cobras são répteis.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Em animais exóticos, observar comportamento é:",
            "opts": [
                  "Muito importante",
                  "Sem utilidade"
            ],
            "c": 0,
            "exp": "O comportamento ajuda muito na avaliação inicial de exóticos.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Antes do prognóstico, vem:",
            "opts": [
                  "Avaliação clínica",
                  "Alta hospitalar"
            ],
            "c": 0,
            "exp": "Primeiro se avalia o paciente, depois se pensa no prognóstico.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "A auscultação serve para:",
            "opts": [
                  "Ouvir sons internos",
                  "Medir a altura"
            ],
            "c": 0,
            "exp": "Auscultação é usada para ouvir coração, pulmões e outros sons.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Respiração ofegante pode indicar:",
            "opts": [
                  "Estresse ou alteração clínica",
                  "Apenas sono"
            ],
            "c": 0,
            "exp": "Pode indicar estresse, dor, calor ou outra alteração.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em equinos, inspeção visual ajuda a notar:",
            "opts": [
                  "Postura e locomoção",
                  "Somente peso exato"
            ],
            "c": 0,
            "exp": "A observação visual mostra sinais importantes no cavalo.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Na semiologia, inspeção significa:",
            "opts": [
                  "Observar visualmente",
                  "Fazer cirurgia"
            ],
            "c": 0,
            "exp": "Inspeção é a observação visual inicial do animal.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Sinal clínico é:",
            "opts": [
                  "Manifestação observável",
                  "Resultado financeiro"
            ],
            "c": 0,
            "exp": "Sinal clínico é aquilo que pode ser observado no paciente.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Desidratação pode ser percebida por:",
            "opts": [
                  "Elasticidade da pele",
                  "Cor da parede"
            ],
            "c": 0,
            "exp": "O turgor cutâneo ajuda a avaliar hidratação.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em aves, observar apetite e postura ajuda a perceber:",
            "opts": [
                  "Alterações iniciais",
                  "Somente idade"
            ],
            "c": 0,
            "exp": "Pequenas mudanças podem indicar problemas de saúde.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Dor à palpação indica:",
            "opts": [
                  "Possível alteração clínica",
                  "Vacinação em dia"
            ],
            "c": 0,
            "exp": "Dor ao toque pode sugerir inflamação, trauma ou outra alteração.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Prognóstico é:",
            "opts": [
                  "Previsão da evolução do caso",
                  "Tipo de exame"
            ],
            "c": 0,
            "exp": "Prognóstico indica a expectativa de evolução do caso.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Exame físico começa geralmente por:",
            "opts": [
                  "Inspeção",
                  "Medicação"
            ],
            "c": 0,
            "exp": "O exame físico costuma começar com a inspeção.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Na rotina com exóticos, contenção e observação devem ser:",
            "opts": [
                  "Cuidadosas",
                  "Apressadas"
            ],
            "c": 0,
            "exp": "Animais exóticos exigem mais cuidado na observação e manejo.",
            "img": "assets/animais/cobra.png"
      }
];
    const flashcardsMedium = [
      {
            "q": "Em cães e gatos, a frequência cardíaca deve ser interpretada junto com:",
            "opts": [
                  "Espécie e porte",
                  "Cor da roupa do tutor"
            ],
            "c": 0,
            "exp": "A interpretação varia conforme espécie, porte e contexto clínico.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Na anamnese, um sintoma relatado pelo tutor é:",
            "opts": [
                  "Dado subjetivo",
                  "Achado de necropsia"
            ],
            "c": 0,
            "exp": "O relato do tutor é uma informação subjetiva importante para o caso.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Se um cavalo apresenta claudicação, a inspeção dinâmica ajuda a avaliar:",
            "opts": [
                  "Alteração de marcha",
                  "Tipo de pelagem"
            ],
            "c": 0,
            "exp": "A inspeção em movimento ajuda a localizar e entender a claudicação.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "No manejo de bovinos, escore corporal serve para:",
            "opts": [
                  "Avaliar condição nutricional",
                  "Definir cor do rebanho"
            ],
            "c": 0,
            "exp": "O escore corporal ajuda a avaliar a condição corporal e o manejo nutricional.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Em aves, alterações no padrão respiratório podem sugerir:",
            "opts": [
                  "Comprometimento sistêmico",
                  "Somente sede"
            ],
            "c": 0,
            "exp": "Mudanças respiratórias podem indicar infecção, estresse ou outra alteração clínica.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Em serpentes, observar a troca de pele pode ajudar a identificar:",
            "opts": [
                  "Condição de saúde e manejo",
                  "Apenas idade exata"
            ],
            "c": 0,
            "exp": "Problemas na ecdise podem refletir ambiente inadequado ou alteração clínica.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Na auscultação, ruídos anormais podem orientar a necessidade de:",
            "opts": [
                  "Investigação complementar",
                  "Alta imediata"
            ],
            "c": 0,
            "exp": "Achados alterados indicam a necessidade de aprofundar a avaliação.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "A semiologia veterinária integra:",
            "opts": [
                  "Anamnese, exame físico e interpretação",
                  "Apenas prescrição"
            ],
            "c": 0,
            "exp": "A semiologia reúne coleta de dados, exame e raciocínio clínico.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em grandes animais, contenção adequada é importante para:",
            "opts": [
                  "Segurança e exame correto",
                  "Deixar o animal mais bonito"
            ],
            "c": 0,
            "exp": "A contenção correta protege equipe e animal, além de facilitar o exame.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "O estado de hidratação pode ser avaliado por mucosas e também por:",
            "opts": [
                  "Turgor cutâneo",
                  "Tamanho da orelha"
            ],
            "c": 0,
            "exp": "O turgor cutâneo é um parâmetro importante na avaliação de hidratação.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Em pequenos animais, palpação abdominal auxilia na detecção de:",
            "opts": [
                  "Dor e aumento de volume",
                  "Resultados de laboratório"
            ],
            "c": 0,
            "exp": "Palpação pode evidenciar dor, distensão e massas.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Na inspeção geral, postura alterada pode indicar:",
            "opts": [
                  "Dor ou desconforto",
                  "Vacinação recente obrigatoriamente"
            ],
            "c": 0,
            "exp": "Mudanças de postura podem ser reflexo de dor, fraqueza ou alteração clínica.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em aves, redução de ingestão alimentar exige atenção porque:",
            "opts": [
                  "Pode ser sinal precoce de doença",
                  "É sempre normal"
            ],
            "c": 0,
            "exp": "Em aves, pequenos sinais podem evoluir rápido e exigem observação precoce.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Em equinos, frequência respiratória deve ser interpretada junto com:",
            "opts": [
                  "Esforço e comportamento",
                  "Cor do cabresto"
            ],
            "c": 0,
            "exp": "Exercício, dor e estresse influenciam a frequência respiratória.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Em répteis, temperatura ambiente interfere diretamente em:",
            "opts": [
                  "Metabolismo",
                  "Formato dos olhos"
            ],
            "c": 0,
            "exp": "Como ectotérmicos, répteis dependem do ambiente para regular o metabolismo.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "No prognóstico, o clínico considera gravidade, resposta esperada e:",
            "opts": [
                  "Evolução provável do caso",
                  "Nome do tutor"
            ],
            "c": 0,
            "exp": "O prognóstico considera a tendência de evolução do caso.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em bovinos, comportamento de ruminação pode informar sobre:",
            "opts": [
                  "Bem-estar e saúde digestiva",
                  "Cor da pelagem"
            ],
            "c": 0,
            "exp": "Alterações na ruminação podem indicar desconforto ou problema digestivo.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Ausculta pulmonar alterada em gato pode sugerir necessidade de:",
            "opts": [
                  "Avaliação mais detalhada",
                  "Encerrar o atendimento"
            ],
            "c": 0,
            "exp": "Achados respiratórios exigem investigação clínica complementar.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Na anamnese, duração do sintoma ajuda principalmente a entender:",
            "opts": [
                  "Cronologia do caso",
                  "Tipo de ração preferida"
            ],
            "c": 0,
            "exp": "Tempo de evolução é essencial para o raciocínio clínico.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em aves e répteis, observação silenciosa inicial é útil porque:",
            "opts": [
                  "Reduz interferência no comportamento",
                  "Não muda nada"
            ],
            "c": 0,
            "exp": "Observar antes da manipulação ajuda a ver sinais naturais do animal.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Quando dois sinais se relacionam, o estudante deve buscar:",
            "opts": [
                  "Interpretação integrada",
                  "Escolher um e ignorar o outro"
            ],
            "c": 0,
            "exp": "Raciocínio clínico exige integrar sinais em vez de analisá-los isoladamente.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Em equinos, inspeção de mucosa e tempo de perfusão auxiliam na avaliação de:",
            "opts": [
                  "Perfusão circulatória",
                  "Tipo de casqueamento"
            ],
            "c": 0,
            "exp": "Esses parâmetros ajudam na avaliação hemodinâmica.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Na rotina inicial de estudo, revisar antes de avançar ajuda em:",
            "opts": [
                  "Fixação de conteúdo",
                  "Esquecer mais rápido"
            ],
            "c": 0,
            "exp": "A revisão espaçada melhora retenção e aprendizagem.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "No exame físico, encontrar um sinal alterado pede:",
            "opts": [
                  "Correlacionar com outros achados",
                  "Fechar diagnóstico instantâneo"
            ],
            "c": 0,
            "exp": "Um único sinal raramente basta; é preciso correlacionar dados.",
            "img": "assets/animais/boi.png"
      }
];
    const flashcardsHard = [
      {
            "q": "Um tutor relata apatia e hiporexia há 3 dias. A melhor conduta inicial do estudante é:",
            "opts": [
                  "Organizar anamnese + exame físico direcionado",
                  "Pensar só em medicação"
            ],
            "c": 0,
            "exp": "O raciocínio começa pela coleta organizada de dados e exame clínico.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em semiologia, um achado objetivo corresponde a:",
            "opts": [
                  "Sinal observado no exame",
                  "Percepção emocional do tutor"
            ],
            "c": 0,
            "exp": "Achados objetivos são observáveis e mensuráveis no exame físico.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Em um cavalo com alteração de marcha, comparar em repouso e movimento serve para:",
            "opts": [
                  "Refinar a localização da alteração",
                  "Definir a raça"
            ],
            "c": 0,
            "exp": "A comparação ajuda a entender melhor o padrão locomotor alterado.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Quando o prognóstico é reservado, isso indica:",
            "opts": [
                  "Evolução incerta e cautela",
                  "Cura garantida"
            ],
            "c": 0,
            "exp": "Prognóstico reservado indica cautela quanto ao desfecho.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Em aves, a ausência de sinais exuberantes não exclui gravidade porque:",
            "opts": [
                  "Elas podem mascarar doença",
                  "Sempre são resistentes"
            ],
            "c": 0,
            "exp": "Aves frequentemente escondem sinais até fases mais avançadas.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Em répteis, manejo ambiental inadequado pode alterar:",
            "opts": [
                  "Metabolismo e comportamento",
                  "Somente o comprimento da cauda"
            ],
            "c": 0,
            "exp": "Temperatura, umidade e ambiente influenciam muito a clínica de répteis.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Na construção do diagnóstico presuntivo, o estudante deve priorizar:",
            "opts": [
                  "Integração dos achados clínicos",
                  "Escolher um sinal isolado"
            ],
            "c": 0,
            "exp": "Diagnóstico presuntivo vem da interpretação integrada dos dados.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Em bovinos, alterações de comportamento alimentar devem ser correlacionadas com:",
            "opts": [
                  "Exame clínico e manejo",
                  "Apenas o peso"
            ],
            "c": 0,
            "exp": "Comportamento alimentar precisa ser interpretado dentro do contexto do caso.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Se auscultação cardíaca está alterada, o passo seguinte é:",
            "opts": [
                  "Correlacionar com outros parâmetros",
                  "Ignorar e encerrar exame"
            ],
            "c": 0,
            "exp": "Achados alterados pedem investigação e correlação clínica.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Em equinos, dor pode modificar frequência cardíaca, respiração e:",
            "opts": [
                  "Postura/comportamento",
                  "Cor do arreio"
            ],
            "c": 0,
            "exp": "Dor frequentemente altera parâmetros vitais e comportamento.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Um sinal clínico inespecífico exige do aluno:",
            "opts": [
                  "Raciocínio diferencial",
                  "Conclusão imediata"
            ],
            "c": 0,
            "exp": "Sinais inespecíficos exigem hipóteses diferenciais e investigação.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Na revisão inteligente, flashcards ajudam principalmente em:",
            "opts": [
                  "Recuperação ativa",
                  "Leitura passiva"
            ],
            "c": 0,
            "exp": "O valor do flashcard está em testar a lembrança ativa do conteúdo.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Em pequenos animais, a ordem do exame físico ajuda porque:",
            "opts": [
                  "Evita esquecer etapas importantes",
                  "Torna tudo mais lento sem motivo"
            ],
            "c": 0,
            "exp": "Uma rotina organizada aumenta consistência e qualidade do exame.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "No atendimento inicial, a queixa principal deve ser relacionada com:",
            "opts": [
                  "Histórico e sinais atuais",
                  "Apenas idade do animal"
            ],
            "c": 0,
            "exp": "A queixa principal precisa ser interpretada no contexto do caso.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "Em aves, manipular cedo demais pode atrapalhar porque:",
            "opts": [
                  "Altera o comportamento observado",
                  "Melhora todos os sinais"
            ],
            "c": 0,
            "exp": "A observação prévia ajuda a ver o estado natural do paciente.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Em exóticos, ausência de apetite e letargia juntos sugerem:",
            "opts": [
                  "Necessidade de avaliação prioritária",
                  "Apenas sono"
            ],
            "c": 0,
            "exp": "Sinais combinados em exóticos merecem atenção rápida.",
            "img": "assets/animais/cobra.png"
      },
      {
            "q": "Na palpação abdominal, sensibilidade aumentada deve ser interpretada com:",
            "opts": [
                  "Outros achados e histórico",
                  "Apenas o nome da espécie"
            ],
            "c": 0,
            "exp": "Dor precisa ser correlacionada com todo o contexto clínico.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Em grandes animais, segurança do manejo interfere diretamente em:",
            "opts": [
                  "Qualidade do exame",
                  "Somente estética do atendimento"
            ],
            "c": 0,
            "exp": "Sem segurança adequada, exame e contenção ficam prejudicados.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "O aluno do 1º-2º semestre deve usar revisão espaçada para:",
            "opts": [
                  "Fixar bases teóricas",
                  "Substituir completamente o estudo"
            ],
            "c": 0,
            "exp": "Revisão espaçada ajuda a consolidar o conteúdo básico.",
            "img": "assets/animais/gato.png"
      },
      {
            "q": "No raciocínio clínico, dados contraditórios exigem:",
            "opts": [
                  "Reavaliar e coletar mais informações",
                  "Ignorar o exame"
            ],
            "c": 0,
            "exp": "Quando os dados não fecham, reavaliar é parte do processo.",
            "img": "assets/animais/cachorro.png"
      },
      {
            "q": "Um bom plano de estudo em veterinária combina:",
            "opts": [
                  "Conteúdo novo + revisão",
                  "Somente conteúdo novo"
            ],
            "c": 0,
            "exp": "Misturar aprendizado e revisão melhora constância e retenção.",
            "img": "assets/animais/pinto.png"
      },
      {
            "q": "Quando um sinal não confirma uma hipótese, o melhor é:",
            "opts": [
                  "Ajustar a hipótese clínica",
                  "Forçar a conclusão"
            ],
            "c": 0,
            "exp": "Hipóteses devem ser revistas conforme os achados clínicos.",
            "img": "assets/animais/boi.png"
      },
      {
            "q": "Em equinos e bovinos, inspeção geral também observa:",
            "opts": [
                  "Interação com o ambiente",
                  "Só o casco"
            ],
            "c": 0,
            "exp": "Comportamento e interação com o ambiente trazem pistas clínicas valiosas.",
            "img": "assets/animais/cavalo.png"
      },
      {
            "q": "Na evolução do estudo, nível difícil deve testar mais:",
            "opts": [
                  "Raciocínio e integração",
                  "Memorização solta apenas"
            ],
            "c": 0,
            "exp": "Questões difíceis devem exigir interpretação e conexão entre conceitos.",
            "img": "assets/animais/cobra.png"
      }
];

    const flashcardSets = {
      easy: flashcardsEasy,
      medium: flashcardsMedium,
      hard: flashcardsHard
    };

    let currentLevel = "easy";
    let flashcards = flashcardSets[currentLevel];
    const reviewedByLevel = { easy: 0, medium: 0, hard: 0 };
    const usedPairsByLevel = { easy: [], medium: [], hard: [] };
    let currentPair = [];
    let answeredCount = 0;

    const quizCard = document.querySelector(".quiz-card");
    const quizGrid = document.getElementById("quizGrid");
    const swapBtn = document.getElementById("swapBtn");
    const levelLabel = document.getElementById("levelLabel");
    const levelButtons = [...document.querySelectorAll(".flash-select")];
    const sessionSummary = document.getElementById("sessionSummary");
    const sessionSummaryText = document.getElementById("sessionSummaryText");
    const continueSessionBtn = document.getElementById("continueSessionBtn");
    const repeatLevelBtn = document.getElementById("repeatLevelBtn");
    const SESSION_SIZE = 6;
    const reviewedInSession = { easy: 0, medium: 0, hard: 0 };


    
    function shuffleFlashcardItem(item){
      const original = {...item, opts:[...item.opts]};
      const indexed = original.opts.map((opt, idx) => ({opt, idx}));
      for(let i = indexed.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
      }
      return {
        ...original,
        opts: indexed.map(x => x.opt),
        c: indexed.findIndex(x => x.idx === original.c)
      };
    }

function pickTwo(){
      let usedPairs = usedPairsByLevel[currentLevel];
      if((flashcards.length - usedPairs.length) < 2){
        usedPairs = [];
      }

      let available = flashcards
        .map((_, i) => i)
        .filter(i => !usedPairs.includes(i));

      if(available.length < 2){
        usedPairs = [];
        available = flashcards.map((_, i) => i);
      }

      const firstIndex = available.splice(Math.floor(Math.random() * available.length), 1)[0];
      let secondPool = available.filter(i => flashcards[i].img !== flashcards[firstIndex].img);

      if(secondPool.length === 0){
        secondPool = flashcards
          .map((_, i) => i)
          .filter(i => i !== firstIndex && flashcards[i].img !== flashcards[firstIndex].img && !usedPairs.includes(i));
      }
      if(secondPool.length === 0){
        secondPool = flashcards
          .map((_, i) => i)
          .filter(i => i !== firstIndex && flashcards[i].img !== flashcards[firstIndex].img);
      }

      const secondIndex = secondPool[Math.floor(Math.random() * secondPool.length)];
      const chosen = [firstIndex, secondIndex];
      usedPairs.push(...chosen);
      usedPairsByLevel[currentLevel] = usedPairs;
      return chosen.map(i => shuffleFlashcardItem(flashcards[i]));
    }

    function renderQuizPair(withAnimation=false){
      hideSessionSummary();
      if(withAnimation){
        quizGrid.classList.add("switching");
        setTimeout(() => {
          currentPair = pickTwo();
          answeredCount = 0;
          swapBtn.classList.remove("show");
          drawQuizCards();
        if(typeof syncFlashcardsView === "function") syncFlashcardsView();
          if(typeof syncFlashcardsView === "function") syncFlashcardsView();
          quizGrid.classList.remove("switching");
        }, 260);
      } else {
        currentPair = pickTwo();
        answeredCount = 0;
        swapBtn.classList.remove("show");
        drawQuizCards();
      }
    }

    function drawQuizCards(){
      quizGrid.innerHTML = currentPair.map((card, idx) => `
        <div class="quiz-mini ${card.state || ""}">
          <div class="quiz-thumb">${card.img ? `<img src="${card.img}" alt="">` : ""}</div>
          <div class="quiz-question">${card.q}</div>
          <div class="quiz-options">
            ${card.opts.map((opt, optIdx) => {
              const cls = card.answered ? (optIdx === card.c ? 'correct' : (optIdx === card.selected && card.selected !== card.c ? 'wrong' : '')) : '';
              return `<button class="${cls}" type="button" data-card="${idx}" data-opt="${optIdx}" ${card.answered ? 'disabled' : ''}>${opt}</button>`;
            }).join("")}
          </div>
          <div class="quiz-feedback ${card.feedback ? "show " + (card.state || "") : ""}">${card.feedback || ""}</div>
        </div>
      `).join("");

      quizGrid.querySelectorAll("button[data-card]").forEach(btn => {
        btn.addEventListener("click", () => {
          answerQuiz(Number(btn.dataset.card), Number(btn.dataset.opt));
        });
      });
    }



    function updateQuizLevelTheme(){
      quizCard.classList.remove("level-easy", "level-medium", "level-hard");
      quizCard.classList.add(`level-${currentLevel}`);
      levelButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.level === currentLevel));
      if(currentLevel === "easy") levelLabel.textContent = "Nível - Fácil";
      if(currentLevel === "medium") levelLabel.textContent = "Nível - Médio";
      if(currentLevel === "hard") levelLabel.textContent = "Nível - Difícil";
    }

    function hideSessionSummary(){
      if(sessionSummary) sessionSummary.classList.remove("show");
      if(repeatLevelBtn) repeatLevelBtn.classList.remove("show");
    }

    function showSessionComplete(){
      if(!sessionSummary || !sessionSummaryText || !continueSessionBtn) return;
      sessionSummary.classList.add("show");
      const totalLevel = flashcards.length;
      const reviewedTotal = reviewedByLevel[currentLevel];
      const remaining = Math.max(totalLevel - reviewedTotal, 0);

      if(reviewedTotal >= totalLevel){
        sessionSummaryText.innerHTML = `Você concluiu o nível ${currentLevel === 'easy' ? 'Fácil' : currentLevel === 'medium' ? 'Médio' : 'Difícil'} 🧠<small>${currentLevel !== 'hard' ? 'Agora você pode seguir para o próximo nível.' : 'Mandou muito bem! Você fechou todos os níveis.'}</small>`;
        continueSessionBtn.textContent = currentLevel !== 'hard' ? 'Próximo nível' : 'Voltar ao início';
        if(repeatLevelBtn) repeatLevelBtn.classList.add("show");
      } else {
        sessionSummaryText.innerHTML = `Boa! você finalizou essa rodada 🔥<small>Restam ${remaining} flashcards neste nível.</small>`;
        continueSessionBtn.textContent = 'Continuar estudando';
        if(repeatLevelBtn) repeatLevelBtn.classList.remove("show");
      }
    }

    function updateFlashProgress(){
      const total = flashcards.length;
      const reviewed = reviewedByLevel[currentLevel];
      const sessionDone = reviewedInSession[currentLevel];
      const percent = Math.min((sessionDone / SESSION_SIZE) * 100, 100);

      if(reviewed >= total){
        flashProgressText.textContent = "Nível concluído 🧠";
      } else if(sessionDone >= SESSION_SIZE){
        flashProgressText.textContent = "Sessão concluída 🔥";
      } else {
        flashProgressText.textContent = `Progresso do nível: ${reviewed}/${total}`;
      }

      flashProgressBar.style.width = `${percent}%`;

      if(reviewed >= total && currentLevel !== "hard"){
        
      } else {
        
      }
    }

    function setLevel(level){
      currentLevel = level;
      flashcards = flashcardSets[level];
      currentPair = [];
      answeredCount = 0;
      reviewedInSession[currentLevel] = 0;
      swapBtn.classList.remove("show");
      
      hideSessionSummary();
      updateQuizLevelTheme();
      renderQuizPair(true);
      updateFlashProgress();
    if(typeof syncFlashcardsView === "function") syncFlashcardsView();
      saveAppState();
      saveAppState();
    }

    window.answerQuiz = function(cardIndex, optionIndex){
      const item = currentPair[cardIndex];
      if(!item || item.answered) return;

      item.answered = true;
      item.selected = optionIndex;

      const isCorrect = optionIndex === item.c;
      const correctText = item.opts[item.c];
      const explanation = item.explanation || item.exp || `A resposta correta é "${correctText}", porque ela corresponde ao conceito principal dessa pergunta.`;

      item.state = isCorrect ? "correct" : "wrong";
      item.feedback = isCorrect
        ? `<strong>✅ Boa! Você acertou essa.</strong>${explanation}`
        : `<strong>❌ Ops! A correta era: ${correctText}.</strong>${explanation}`;

      reviewedByLevel[currentLevel] = Math.min(reviewedByLevel[currentLevel] + 1, flashcards.length);
      reviewedInSession[currentLevel] = Math.min(reviewedInSession[currentLevel] + 1, SESSION_SIZE);

      if(currentPair.every(card => card.answered)){
        const finishedLevel = reviewedByLevel[currentLevel] >= flashcards.length;
        const finishedSession = reviewedInSession[currentLevel] >= SESSION_SIZE;

        if(finishedLevel || finishedSession){
          showSessionComplete();
          swapBtn.classList.remove("show");
        } else {
          swapBtn.classList.add("show");
        }
      }

      drawQuizCards();
      updateFlashProgress();
      if(typeof syncFlashcardsView === "function") syncFlashcardsView();
      saveAppState();
    }

    swapBtn.addEventListener("click", () => renderQuizPair(true));
    levelButtons.forEach(btn => {
      btn.addEventListener("click", () => setLevel(btn.dataset.level));
    });

    continueSessionBtn.addEventListener("click", () => {
      const finishedLevel = reviewedByLevel[currentLevel] >= flashcards.length;
      if(finishedLevel){
        if(currentLevel === "easy") setLevel("medium");
        else if(currentLevel === "medium") setLevel("hard");
        else setLevel("easy");
        return;
      }

      reviewedInSession[currentLevel] = 0;
      renderQuizPair(true);
      updateFlashProgress();
    if(typeof syncFlashcardsView === "function") syncFlashcardsView();
      saveAppState();
    });

    repeatLevelBtn.addEventListener("click", () => {
      reviewedByLevel[currentLevel] = 0;
      reviewedInSession[currentLevel] = 0;
      usedPairsByLevel[currentLevel] = [];
      renderQuizPair(true);
      updateFlashProgress();
    if(typeof syncFlashcardsView === "function") syncFlashcardsView();
      hideSessionSummary();
      saveAppState();
    });

    updateQuizLevelTheme();
    renderQuizPair(false);
    updateFlashProgress();
    if(typeof syncFlashcardsView === "function") syncFlashcardsView();
    applyCalendarVisibility(false);


    // Calendar / months
    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const STORAGE_EVENTS_KEY = "vetstudy_calendar_events_v2";
    const baseCalendarEvents = {
      0:{provas:[], study:[], tasks:[]},
      1:{provas:[], study:[], tasks:[]},
      2:{provas:[], study:[], tasks:[]},
      3:{provas:[], study:[], tasks:[]},
      4:{provas:[], study:[], tasks:[]},
      5:{provas:[], study:[], tasks:[]},
      6:{provas:[], study:[], tasks:[]},
      7:{provas:[], study:[], tasks:[]},
      8:{provas:[], study:[], tasks:[]},
      9:{provas:[], study:[], tasks:[]},
      10:{provas:[], study:[], tasks:[]},
      11:{provas:[], study:[], tasks:[]}
    };

    function loadStoredEvents(){
      try{
        return JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY) || "{}");
      } catch {
        return {};
      }
    }

    function buildCalendarState(){
      const stored = loadStoredEvents();
      const state = {};
      for(let m=0; m<12; m++){
        const base = baseCalendarEvents[m] || {provas:[], study:[], tasks:[]};
        const extra = stored[m] || {provas:[], tasks:[]};
        state[m] = {
          provas:[...(base.provas || []), ...((extra.provas || []).map(item => item.day))],
          study:[...(base.study || [])],
          tasks:[...((extra.tasks || []).map(item => item.day))],
          provaItems:[...(extra.provas || [])],
          taskItems:[...(extra.tasks || [])]
        };
      }
      return state;
    }

    let calendarEvents = buildCalendarState();

    function persistCalendarEvents(){
      const payload = {};
      for(let m=0; m<12; m++){
        payload[m] = {
          provas: calendarEvents[m].provaItems || [],
          tasks: calendarEvents[m].taskItems || []
        };
      }
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(payload));
    }

    const calendarDays = ["D","S","T","Q","Q","S","S"];
    const miniCalendar = document.getElementById("miniCalendar");
    const monthSelect = document.getElementById("monthSelect");
    const eventModal = document.getElementById("eventModal");
    const modalTitle = document.getElementById("modalTitle");
    const eventList = document.getElementById("eventList");
    const addProvaBtn = document.getElementById("addProvaBtn");
    const addTaskEventBtn = document.getElementById("addTaskEventBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    let showProvas = true;
    let activeDay = null;

    monthNames.forEach((name, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = name;
      monthSelect.appendChild(opt);
    });

    function renderCalendar(monthIndex){
      const data = calendarEvents[monthIndex] || {provas:[], study:[], tasks:[]};
      miniCalendar.innerHTML = "";
      calendarDays.forEach(label => {
        miniCalendar.innerHTML += `<div class="day-label">${label}</div>`;
      });
      for(let i=1; i<=31; i++){
        const hasProva = data.provas.includes(i);
        const hasStudy = data.study.includes(i);
        const hasTask = data.tasks.includes(i);
        let dot = "";
        let extraClass = "";
        if(showProvas && hasProva && hasTask){
          dot = "<span class='dot combo'></span>";
          extraClass = "has-combo";
        } else if(showProvas && hasProva){
          dot = "<span class='dot prova'></span>";
          extraClass = "has-prova";
        } else if(showProvas && hasTask){
          dot = "<span class='dot task'></span>";
          extraClass = "has-task";
        } else if(!showProvas && hasStudy && hasTask){
          dot = "<span class='dot combo'></span>";
          extraClass = "has-combo";
        } else if(!showProvas && hasStudy){
          dot = "<span class='dot study'></span>";
          extraClass = "has-study";
        } else if(!showProvas && hasTask){
          dot = "<span class='dot task'></span>";
          extraClass = "has-task";
        }
        const today = new Date();
        const isToday = today.getMonth() === Number(monthSelect.value) && today.getDate() === i;
        const todayClass = isToday ? "today-highlight" : "";
        miniCalendar.innerHTML += `<button class="day-cell ${extraClass} ${todayClass}" type="button" data-day="${i}">${i}${dot}</button>`;
      }
      miniCalendar.querySelectorAll(".day-cell").forEach(btn => {
        btn.addEventListener("click", () => openEventModal(Number(btn.dataset.day)));
      });
      calendarMode.classList.add("switching");
      setTimeout(() => calendarMode.classList.remove("switching"), 280);
    }

    function openEventModal(day){
      activeDay = day;
      modalTitle.textContent = `${day} de ${monthNames[Number(monthSelect.value)]}`;
      renderEventList();
      eventModal.classList.add("show");
    }

    function closeEventModal(){
      eventModal.classList.remove("show");
    }

    function renderEventList(){
      const monthData = calendarEvents[Number(monthSelect.value)];
      const provas = (monthData.provaItems || []).filter(item => item.day === activeDay)
        .map((item, idx) => ({type:"prova", text:item.text, localIndex:idx}));
      const tasks = (monthData.taskItems || []).filter(item => item.day === activeDay)
        .map((item, idx) => ({type:"task", text:item.text, localIndex:idx}));
      const items = [...provas, ...tasks];

      if(!items.length){
        eventList.innerHTML = `<div class="empty">Nenhum evento nesta data ainda.</div>`;
        return;
      }

      eventList.innerHTML = items.map(item => `
        <div class="event-item">
          <div class="event-left">
            <span class="event-pill ${item.type}"></span>
            <div class="event-text">${item.type === "prova" ? "Prova" : "Tarefa"} — ${item.text}</div>
          </div>
          <button class="delete-mini" type="button" onclick="removeCalendarItem('${item.type}', ${activeDay}, ${item.localIndex})">✕</button>
        </div>
      `).join("");
    }

    function rebuildCalendarStateFromItems(){
      const rebuilt = {};
      for(let m=0; m<12; m++){
        const base = baseCalendarEvents[m] || {provas:[], study:[], tasks:[]};
        const data = calendarEvents[m] || {provaItems:[], taskItems:[]};
        rebuilt[m] = {
          provas:[...(base.provas || []), ...((data.provaItems || []).map(item => item.day))],
          study:[...(base.study || [])],
          tasks:[...((data.taskItems || []).map(item => item.day))],
          provaItems:[...(data.provaItems || [])],
          taskItems:[...(data.taskItems || [])]
        };
      }
      calendarEvents = rebuilt;
    }

    function refreshCalendarState(){
      rebuildCalendarStateFromItems();
      persistCalendarEvents();
      renderEventList();
      renderCalendar(Number(monthSelect.value));
    }

    function addCalendarItem(type){
      if(activeDay == null) return;
      const label = type === "prova" ? "Digite o nome da prova:" : "Digite a tarefa:";
      const value = prompt(label);
      if(!value || !value.trim()) return;

      const monthIndex = Number(monthSelect.value);
      if(type === "prova"){
        calendarEvents[monthIndex].provaItems.push({day:activeDay, text:value.trim()});
        showToast("Prova adicionada! 📌");
      } else {
        calendarEvents[monthIndex].taskItems.push({day:activeDay, text:value.trim()});
        showToast("Tarefa adicionada! ✅");
      }
      refreshCalendarState();
    }

    window.removeCalendarItem = function(type, day, localIndex){
      const monthIndex = Number(monthSelect.value);
      if(type === "prova"){
        const sameDay = calendarEvents[monthIndex].provaItems.filter(item => item.day === day);
        const target = sameDay[localIndex];
        if(target){
          const index = calendarEvents[monthIndex].provaItems.findIndex(item => item.day === day && item.text === target.text);
          if(index > -1) calendarEvents[monthIndex].provaItems.splice(index, 1);
        }
      } else {
        const sameDay = calendarEvents[monthIndex].taskItems.filter(item => item.day === day);
        const target = sameDay[localIndex];
        if(target){
          const index = calendarEvents[monthIndex].taskItems.findIndex(item => item.day === day && item.text === target.text);
          if(index > -1) calendarEvents[monthIndex].taskItems.splice(index, 1);
        }
      }
      refreshCalendarState();
      saveAppState();
      showToast("Evento removido.");
    }

    addProvaBtn.addEventListener("click", () => addCalendarItem("prova"));
    addTaskEventBtn.addEventListener("click", () => addCalendarItem("task"));
    closeModalBtn.addEventListener("click", closeEventModal);
    eventModal.addEventListener("click", e => { if(e.target === eventModal) closeEventModal(); });

    monthSelect.addEventListener("change", () => renderCalendar(Number(monthSelect.value)));

    btnProvas.addEventListener("click", () => {
      if(!calendarUnlocked){
        applyCalendarVisibility(false);
        showToast("Clique em Começar a estudar para liberar o calendário 📚");
        return;
      }
      showProvas = true;
      btnProvas.classList.add("active");
      btnProgress.classList.remove("active");
      if (typeof calendarClosedState !== "undefined" && calendarClosedState) calendarClosedState.style.display = "none";
      progressWrap.classList.remove("show");
      calendarMode.style.display = "block";
      renderCalendar(Number(monthSelect.value));
    });

    btnProgress.addEventListener("click", () => {
      if(!calendarUnlocked){
        applyCalendarVisibility(false);
        showToast("Clique em Começar a estudar para liberar o calendário 📚");
        return;
      }
      showProvas = false;
      btnProgress.classList.add("active");
      btnProvas.classList.remove("active");
      if (typeof calendarClosedState !== "undefined" && calendarClosedState) calendarClosedState.style.display = "none";
      calendarMode.style.display = "none";
      progressWrap.classList.add("show");
    });

    const now = new Date();
    monthSelect.value = String(now.getMonth());
    renderCalendar(now.getMonth());
    applyCalendarVisibility(false);
  
