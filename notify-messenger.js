onSnapshot(collection(db, "notifications"), (snap) => {
  let count = 0;

  snap.forEach(doc => {
    if(!doc.data().read) count++;
  });

  localStorage.setItem("notifyCount", count);
  renderNotify();
});
