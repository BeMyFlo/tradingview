const apiBaseUrl = "http://localhost:8090/api/user/api/user";
// const apiBaseUrl = "https://beviewchart-production.up.railway.app/api/user";

// ✅ Đảm bảo gọi sau khi popup HTML đã được inject xong
function initAuthPopupEvents() {
  const form = document.getElementById("auth-form");
  if (form) {
    form.addEventListener("submit", handleAuthSubmit);
  }

  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");

  if (registerBtn)
    registerBtn.addEventListener("click", () => showAuthPopup("register"));
  if (loginBtn)
    loginBtn.addEventListener("click", () => showAuthPopup("login"));

  updateAuthUI();
}

function showAuthPopup(mode = "login") {
  document.getElementById("auth-popup-overlay").style.display = "flex";
  document.getElementById("popup-title").innerText =
    mode === "register" ? "Đăng ký" : "Đăng nhập";
  document.getElementById("toggle-form-text").innerHTML =
    mode === "register"
      ? 'Đã có tài khoản? <a href="#" onclick="toggleAuthMode()">Đăng nhập</a>'
      : 'Chưa có tài khoản? <a href="#" onclick="toggleAuthMode()">Đăng ký</a>';
}

function hideAuthPopup() {
  document.getElementById("auth-popup-overlay").style.display = "none";
}

function toggleAuthMode() {
  const current = document.getElementById("popup-title").innerText;
  showAuthPopup(current === "Đăng nhập" ? "register" : "login");
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mode =
    document.getElementById("popup-title").innerText === "Đăng ký"
      ? "register"
      : "login";
  const endpoint = mode === "register" ? "/register" : "/login";

  try {
    const res = await fetch(apiBaseUrl + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        mode === "register" ? "Đăng ký thành công!" : "Đăng nhập thành công!"
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      // ✅ Lưu token
      hideAuthPopup();
      updateAuthUI();
    } else {
      alert(data.message || "Đã có lỗi xảy ra.");
    }
  } catch (err) {
    console.error("Lỗi gửi auth:", err);
    alert("Không thể kết nối đến server.");
  }
}

function updateAuthUI() {
  const token = localStorage.getItem("token");
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");

  if (!registerBtn || !loginBtn) return;

  if (token) {
    // Đã đăng nhập
    registerBtn.style.display = "none";
    loginBtn.textContent = "Đăng xuất";
    loginBtn.onclick = logout;
  } else {
    // Chưa đăng nhập
    registerBtn.style.display = "inline-block";
    loginBtn.textContent = "Đăng nhập";
    loginBtn.onclick = () => showAuthPopup("login");
  }
}

function logout() {
  localStorage.removeItem("token");
  updateAuthUI();
}
