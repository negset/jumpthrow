let timeJump = 0;
let timeThrow = 0;

let attempts = 0;
let successes = 0;
let wrongInputs = 0;
let deltaSum = 0;

let jumpAssign = {type: "keydown", code: "Space"};
let throwAssign = {type: "mousedown", button: 0};

function insertResult(isSuccess, isMultipleInput, delta) {
  const result = document.createElement("p");
  if (isMultipleInput) {
    result.innerHTML = `Multiple ${timeJump > 0 ? "jumps" : "throws"} detected`;
    result.style.color = "gray";
  } else {
    result.innerHTML = `${isSuccess ? "Success" : "Failure"} (${delta} ms)`;
    result.style.color = isSuccess ? "green" : "red";
  }
  const parent = document.getElementById("results");
  parent.appendChild(result);
  result.scrollIntoView({behavior: "smooth"});
}

function updateAnalytics() {
  const anlAttempts = document.getElementById("anl-attempts");
  const anlSuccessRate = document.getElementById("anl-success-rate");
  const anlWrongInputFirst = document.getElementById("anl-wrong-input-first");
  const anlThrowTooLate = document.getElementById("anl-throw-too-late");
  const anlAverageDelta = document.getElementById("anl-average-delta");
  anlAttempts.innerHTML = attempts;
  anlSuccessRate.innerHTML = 100 * successes / attempts;
  anlWrongInputFirst.innerHTML = 100 * wrongInputs / attempts;
  anlThrowTooLate.innerHTML = 100 * (attempts - successes - wrongInputs) / attempts;
  anlAverageDelta.innerHTML = deltaSum / attempts;
}

function checkTime() {
  if (timeJump <= 0 || timeThrow <= 0) return;

  // https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-8-01/#:~:text=We%20have%20implemented,the%20same%20location.
  const delta = timeThrow - timeJump;
  const isSuccess = 0 <= delta && delta <= 100;
  insertResult(isSuccess, false, delta);

  timeJump = 0;
  timeThrow = 0;

  attempts++;
  if (isSuccess) successes++;
  else if (delta < 0) wrongInputs++;
  deltaSum += delta;
  updateAnalytics();
}

function onJumpInput() {
  if (timeJump > 0) {
    insertResult(false, true, 0);
    timeJump = 0;
    return;
  }
  timeJump = performance.now();
  checkTime();
}

function onThrowInput() {
  if (timeThrow > 0) {
    insertResult(false, true, 0);
    timeThrow = 0;
    return;
  }
  timeThrow = performance.now();
  checkTime();
}

function setInputListeners() {
  document.onkeyup = (event) => event.preventDefault();
  document.onmouseup = (event) => event.preventDefault();
  document.onkeydown = (event) => {
    event.preventDefault();
    if (event.type === jumpAssign.type && event.code === jumpAssign.code) onJumpInput();
    if (event.type === throwAssign.type && event.code === throwAssign.code) onThrowInput();
  }
  document.onmousedown = (event) => {
    event.preventDefault();
    if (event.type === jumpAssign.type && event.button === jumpAssign.button) onJumpInput();
    if (event.type === throwAssign.type && event.button === throwAssign.button) onThrowInput();
  }
}

setInputListeners();

document.getElementById("reset").onclick = () => {
  timeJump = 0;
  timeThrow = 0;
  attempts = 0;
  successes = 0;
  wrongInputs = 0;
  deltaSum = 0;
  updateAnalytics();

  const results = document.getElementById("results");
  while (results.firstChild != null) results.removeChild(results.firstChild);
};

document.getElementById("key-config").onclick = () => {
  const cnfDialog = document.getElementById("cnf-dialog");
  const cnfJump = document.getElementById("cnf-jump");
  const cnfThrow = document.getElementById("cnf-throw");
  const cnfSave = document.getElementById("cnf-save");

  const inputWaiter = () => new Promise((resolve) => {
    document.onkeydown = (event) => event.preventDefault();
    document.onmousedown = (event) => event.preventDefault();
    document.onkeyup = (event) => {
      event.preventDefault();
      resolve({
        type: "keydown",
        code: event.code,
        name: event.code,
      });
    };
    document.onmouseup = (event) => {
      event.preventDefault();
      resolve({
        type: "mousedown",
        button: event.button,
        name: "Mousebutton " + event.button,
      });
    };
  });

  (async () => {
    cnfDialog.showModal();
    cnfJump.innerHTML = "Press any key or mouse button";
    cnfThrow.innerHTML = "";
    cnfSave.disabled = true;
    const newJumpAssign = await inputWaiter();
    cnfJump.innerHTML = newJumpAssign.name;
    cnfThrow.innerHTML = "Press any key or mouse button";
    const newThrowAssign = await inputWaiter();
    cnfThrow.innerHTML = newThrowAssign.name;

    cnfSave.disabled = false;
    cnfSave.onclick = () => {
      jumpAssign = newJumpAssign;
      throwAssign = newThrowAssign;
      setInputListeners();
      cnfDialog.close();
    };
  })();
};

document.getElementById("cnf-cancel").onclick = () => {
  setInputListeners();
  document.getElementById("cnf-dialog").close();
};

document.getElementById("buttons").onmousedown = (event) => {
  event.stopPropagation();
};