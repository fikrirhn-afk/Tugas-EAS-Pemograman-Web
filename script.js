(function(){
  const STORAGE_KEY = "pmb_last_registration_v1";

  const form = document.getElementById("registrationForm");
  const formStatus = document.getElementById("formStatus");
  const storageStatus = document.getElementById("storageStatus");
  const resultArea = document.getElementById("resultArea");
  const btnReset = document.getElementById("btnReset");

  const fields = {
    fullName: document.getElementById("fullName"),
    nim: document.getElementById("nim"),
    email: document.getElementById("email"),
    program: document.getElementById("program"),
    gender: document.getElementById("gender"),
    birthDate: document.getElementById("birthDate"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
  };

  const errors = {
    fullName: document.getElementById("errFullName"),
    nim: document.getElementById("errNim"),
    email: document.getElementById("errEmail"),
    program: document.getElementById("errProgram"),
    gender: document.getElementById("errGender"),
    birthDate: document.getElementById("errBirthDate"),
    phone: document.getElementById("errPhone"),
    address: document.getElementById("errAddress"),
  };

  function setFieldInvalid(fieldEl, errEl, message){
    fieldEl.closest(".field").classList.add("invalid");
    errEl.textContent = message;
  }

  function setFieldValid(fieldEl, errEl){
    fieldEl.closest(".field").classList.remove("invalid");
    errEl.textContent = "";
  }

  function normalizeSpaces(s){
    return (s || "").trim().replace(/\s+/g, " ");
  }

  function isValidEmail(email){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(email);
  }

  function isDigitsOnly(s){
    return /^[0-9]+$/.test(s);
  }

  function calcAge(dateString){
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  function validateAll(){
    let ok = true;

    // Nama
    const fullName = normalizeSpaces(fields.fullName.value);
    if (!fullName) {
      setFieldInvalid(fields.fullName, errors.fullName, "Nama lengkap wajib diisi.");
      ok = false;
    } else if (fullName.length < 3) {
      setFieldInvalid(fields.fullName, errors.fullName, "Nama terlalu pendek (minimal 3 karakter).");
      ok = false;
    } else {
      setFieldValid(fields.fullName, errors.fullName);
    }

    // NIM: angka saja, panjang 10–12
    const nim = fields.nim.value.trim();
    if (!nim) {
      setFieldInvalid(fields.nim, errors.nim, "NIM wajib diisi.");
      ok = false;
    } else if (!isDigitsOnly(nim)) {
      setFieldInvalid(fields.nim, errors.nim, "NIM harus berupa angka (0-9) tanpa spasi.");
      ok = false;
    } else if (nim.length < 10 || nim.length > 12) {
      setFieldInvalid(fields.nim, errors.nim, "Panjang NIM harus 10–12 digit.");
      ok = false;
    } else {
      setFieldValid(fields.nim, errors.nim);
    }

    // Email
    const email = fields.email.value.trim();
    if (!email) {
      setFieldInvalid(fields.email, errors.email, "Email wajib diisi.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setFieldInvalid(fields.email, errors.email, "Format email tidak valid.");
      ok = false;
    } else {
      setFieldValid(fields.email, errors.email);
    }

    // Program Studi
    const program = fields.program.value;
    if (!program) {
      setFieldInvalid(fields.program, errors.program, "Program studi wajib dipilih.");
      ok = false;
    } else {
      setFieldValid(fields.program, errors.program);
    }

    // Jenis Kelamin
    const gender = fields.gender.value;
    if (!gender) {
      setFieldInvalid(fields.gender, errors.gender, "Jenis kelamin wajib dipilih.");
      ok = false;
    } else {
      setFieldValid(fields.gender, errors.gender);
    }

    // Tanggal lahir: wajib, minimal 15 tahun
    const birthDate = fields.birthDate.value;
    if (!birthDate) {
      setFieldInvalid(fields.birthDate, errors.birthDate, "Tanggal lahir wajib diisi.");
      ok = false;
    } else {
      const age = calcAge(birthDate);
      if (age === null) {
        setFieldInvalid(fields.birthDate, errors.birthDate, "Tanggal lahir tidak valid.");
        ok = false;
      } else if (age < 15) {
        setFieldInvalid(fields.birthDate, errors.birthDate, "Usia minimal 15 tahun.");
        ok = false;
      } else {
        setFieldValid(fields.birthDate, errors.birthDate);
      }
    }

    // Telepon: Indonesia, awali 08, 10–13 digit
    const phone = fields.phone.value.trim();
    if (!phone) {
      setFieldInvalid(fields.phone, errors.phone, "Nomor telepon wajib diisi.");
      ok = false;
    } else if (!/^08\d{8,11}$/.test(phone)) {
      setFieldInvalid(fields.phone, errors.phone, "Nomor telepon harus diawali 08 dan 10–13 digit.");
      ok = false;
    } else {
      setFieldValid(fields.phone, errors.phone);
    }

    // Alamat
    const address = normalizeSpaces(fields.address.value);
    if (!address) {
      setFieldInvalid(fields.address, errors.address, "Alamat wajib diisi.");
      ok = false;
    } else if (address.length < 10) {
      setFieldInvalid(fields.address, errors.address, "Alamat terlalu singkat (minimal 10 karakter).");
      ok = false;
    } else {
      setFieldValid(fields.address, errors.address);
    }

    return ok;
  }

  function getPayload(){
    return {
      fullName: normalizeSpaces(fields.fullName.value),
      nim: fields.nim.value.trim(),
      email: fields.email.value.trim(),
      program: fields.program.value,
      gender: fields.gender.value,
      birthDate: fields.birthDate.value,
      phone: fields.phone.value.trim(),
      address: normalizeSpaces(fields.address.value),
      submittedAt: new Date().toISOString()
    };
  }

  function formatDateID(isoOrDate){
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });
  }

  function escapeHtml(str){
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderResultCard(data){
    const submitted = formatDateID(data.submittedAt);
    const birth = formatDateID(data.birthDate);

    resultArea.innerHTML = `
      <div class="result-card" role="status" aria-live="polite">
        <div class="result-title">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="ok-dot" aria-hidden="true"></span>
            <div>
              <div style="font-weight:800; letter-spacing:.2px;">Pendaftaran Berhasil</div>
              <div style="color: var(--muted); font-size:.86rem;">Terkirim: ${submitted}</div>
            </div>
          </div>
          <span class="badge">Terakhir tersimpan</span>
        </div>

        <div class="kv">
          <div class="kv-row"><div class="k">Nama Lengkap</div><div class="v">${escapeHtml(data.fullName)}</div></div>
          <div class="kv-row"><div class="k">NIM</div><div class="v">${escapeHtml(data.nim)}</div></div>
          <div class="kv-row"><div class="k">Email</div><div class="v">${escapeHtml(data.email)}</div></div>
          <div class="kv-row"><div class="k">Program Studi</div><div class="v">${escapeHtml(data.program)}</div></div>
          <div class="kv-row"><div class="k">Jenis Kelamin</div><div class="v">${escapeHtml(data.gender)}</div></div>
          <div class="kv-row"><div class="k">Tanggal Lahir</div><div class="v">${birth}</div></div>
          <div class="kv-row"><div class="k">Nomor Telepon</div><div class="v">${escapeHtml(data.phone)}</div></div>
          <div class="kv-row"><div class="k">Alamat</div><div class="v">${escapeHtml(data.address)}</div></div>
        </div>
      </div>
    `;
  }

  function renderEmpty(){
    resultArea.innerHTML = `
      <p class="result-empty">
        Belum ada data pendaftaran. Setelah submit berhasil, ringkasan akan muncul di sini.
      </p>
    `;
  }

  function setStorageBadge(hasData){
    storageStatus.textContent = hasData ? "localStorage: ada" : "localStorage: kosong";
  }

  function saveToStorage(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStorageBadge(true);
  }

  function loadFromStorage(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function clearStorage(){
    localStorage.removeItem(STORAGE_KEY);
    setStorageBadge(false);
  }

  // Validasi realtime per-field (interaktif)
  function wireRealtimeValidation(){
    const map = [
      { el: fields.fullName, key:"fullName", event:"input" },
      { el: fields.nim, key:"nim", event:"input" },
      { el: fields.email, key:"email", event:"input" },
      { el: fields.program, key:"program", event:"change" },
      { el: fields.gender, key:"gender", event:"change" },
      { el: fields.birthDate, key:"birthDate", event:"change" },
      { el: fields.phone, key:"phone", event:"input" },
      { el: fields.address, key:"address", event:"input" },
    ];

    function validateOne(key){
      // Cek per field agar cepat dan responsif
      if (key === "fullName"){
        const v = normalizeSpaces(fields.fullName.value);
        if (!v) return setFieldInvalid(fields.fullName, errors.fullName, "Nama lengkap wajib diisi.");
        if (v.length < 3) return setFieldInvalid(fields.fullName, errors.fullName, "Nama terlalu pendek (minimal 3 karakter).");
        return setFieldValid(fields.fullName, errors.fullName);
      }

      if (key === "nim"){
        const v = fields.nim.value.trim();
        if (!v) return setFieldInvalid(fields.nim, errors.nim, "NIM wajib diisi.");
        if (!isDigitsOnly(v)) return setFieldInvalid(fields.nim, errors.nim, "NIM harus berupa angka (0-9) tanpa spasi.");
        if (v.length < 10 || v.length > 12) return setFieldInvalid(fields.nim, errors.nim, "Panjang NIM harus 10–12 digit.");
        return setFieldValid(fields.nim, errors.nim);
      }

      if (key === "email"){
        const v = fields.email.value.trim();
        if (!v) return setFieldInvalid(fields.email, errors.email, "Email wajib diisi.");
        if (!isValidEmail(v)) return setFieldInvalid(fields.email, errors.email, "Format email tidak valid.");
        return setFieldValid(fields.email, errors.email);
      }

      if (key === "program"){
        const v = fields.program.value;
        if (!v) return setFieldInvalid(fields.program, errors.program, "Program studi wajib dipilih.");
        return setFieldValid(fields.program, errors.program);
      }

      if (key === "gender"){
        const v = fields.gender.value;
        if (!v) return setFieldInvalid(fields.gender, errors.gender, "Jenis kelamin wajib dipilih.");
        return setFieldValid(fields.gender, errors.gender);
      }

      if (key === "birthDate"){
        const v = fields.birthDate.value;
        if (!v) return setFieldInvalid(fields.birthDate, errors.birthDate, "Tanggal lahir wajib diisi.");
        const age = calcAge(v);
        if (age === null) return setFieldInvalid(fields.birthDate, errors.birthDate, "Tanggal lahir tidak valid.");
        if (age < 15) return setFieldInvalid(fields.birthDate, errors.birthDate, "Usia minimal 15 tahun.");
        return setFieldValid(fields.birthDate, errors.birthDate);
      }

      if (key === "phone"){
        const v = fields.phone.value.trim();
        if (!v) return setFieldInvalid(fields.phone, errors.phone, "Nomor telepon wajib diisi.");
        if (!/^08\d{8,11}$/.test(v)) return setFieldInvalid(fields.phone, errors.phone, "Nomor telepon harus diawali 08 dan 10–13 digit.");
        return setFieldValid(fields.phone, errors.phone);
      }

      if (key === "address"){
        const v = normalizeSpaces(fields.address.value);
        if (!v) return setFieldInvalid(fields.address, errors.address, "Alamat wajib diisi.");
        if (v.length < 10) return setFieldInvalid(fields.address, errors.address, "Alamat terlalu singkat (minimal 10 karakter).");
        return setFieldValid(fields.address, errors.address);
      }
    }

    for (const item of map){
      item.el.addEventListener(item.event, () => validateOne(item.key));
      item.el.addEventListener("blur", () => validateOne(item.key));
    }
  }

  // Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valid = validateAll();
    if (!valid) {
      formStatus.textContent = "Periksa input";
      formStatus.style.borderColor = "rgba(255,106,106,.45)";
      return;
    }

    const payload = getPayload();
    renderResultCard(payload);
    saveToStorage(payload);

    formStatus.textContent = "Terkirim";
    formStatus.style.borderColor = "rgba(74,222,128,.45)";
  });

  // Reset total: form + ringkasan + localStorage
  btnReset.addEventListener("click", () => {
    form.reset();

    Object.keys(fields).forEach((k) => setFieldValid(fields[k], errors[k]));

    renderEmpty();
    clearStorage();

    formStatus.textContent = "Belum dikirim";
    formStatus.style.borderColor = "var(--border)";
  });

  // Inisialisasi: load last saved
  const saved = loadFromStorage();
  if (saved) {
    renderResultCard(saved);
    setStorageBadge(true);
    formStatus.textContent = "Tersimpan (hasil terakhir)";
  } else {
    setStorageBadge(false);
  }

  wireRealtimeValidation();
})();
