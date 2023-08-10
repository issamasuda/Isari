const bucketContent = document.getElementById("bucketContent");

bucketContent.addEventListener("dragover", (e) => {
  e.preventDefault();
});

bucketContent.addEventListener("drop", (e) => {
  e.preventDefault();
  const fishId = e.dataTransfer.getData("text/plain");
  const fishElement = document.getElementById(fishId);

  if (fishElement) {
    const fishClone = fishElement.cloneNode(true);
    const newFishId = `bucketFish${Date.now()}`;
    fishClone.id = newFishId;
    bucketContent.appendChild(fishClone);
    
    fishElement.style.display = "none";
  }
});