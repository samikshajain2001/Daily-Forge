const toggleMode = document.getElementById('theme-toggle');

const applyTheme = (theme) => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
};
  
toggleMode.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    const newTheme = isDark ? "light-mode" : "dark-mode";
    applyTheme(newTheme);
});
