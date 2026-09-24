let deferredPrompt = null;

window.addEventListener("gameappready", () => Object.assign(GameApp, {
  async installApp() {
    if (!deferredPrompt) {
      this.toast("التثبيت غير متاح حالياً. افتح القائمة من متصفح يدعم تثبيت التطبيقات.");
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      this.toast("جاري تنزيل كافة أصول اللعبة والصوتيات في الخلفية للعمل بدون إنترنت...");
      const registration = await navigator.serviceWorker.getRegistration();
      registration?.active?.postMessage({ action: "precache-assets" });
    }
    deferredPrompt = null;
    document.getElementById("btn-install-app")?.classList.remove("visible");
  },
}));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  document.getElementById("btn-install-app")?.classList.add("visible");
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  document.getElementById("btn-install-app")?.classList.remove("visible");
  const toast = document.getElementById("app-toast");
  toast.innerText = "تم تثبيت اللعبة بنجاح! يمكنك الآن تشغيلها أوفلاين من الشاشة الرئيسية 🚀";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4200);
});

if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
  document.getElementById("btn-install-app")?.classList.remove("visible");
}

function showUpdateNotification() {
  if (document.querySelector(".update-toast")) return;
  const toast = document.createElement("div");
  toast.className = "update-toast";
  toast.innerHTML = '<span>توجد نسخة جديدة ومحدثة من الموقع!</span><button type="button">تحديث الآن</button>';
  document.body.appendChild(toast);
  toast.querySelector("button").addEventListener("click", async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) registration.waiting.postMessage({ action: "skipWaiting" });
    else window.location.reload();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      sessionStorage.setItem("mafia_show_v2_changelog", "1");
      window.location.reload();
    });
    navigator.serviceWorker.register("./sw.js").then((registration) => {
      console.log("SW registered:", registration.scope);
      if (navigator.onLine) registration.update().catch((error) => console.warn("SW update check failed:", error));
      window.addEventListener("online", () => registration.update().catch((error) => console.warn("SW update check failed:", error)));
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) showUpdateNotification();
        });
      });
    }).catch((error) => console.error("SW registration failed:", error));
  });
}