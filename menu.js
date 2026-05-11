const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.querySelector('header div'); // icon menu

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
});
