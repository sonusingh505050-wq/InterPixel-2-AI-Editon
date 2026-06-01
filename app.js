const IPX_KEY = "interpixel-os-2-drive";

const defaultDrive = {
  "/Desktop/hello.txt": "This file belongs to InterPixel OS 2.",
  "/Desktop/readme.txt": "Open Files to create folders, write TXT files, and install IPX packages.",
  "/Documents/welcome.txt": "Welcome to InterPixel OS 2.\nTry: help, ls, cat /System/lesson.ipx",
  "/System/lesson.ipx": "An OS manages CPU time, memory, devices, files, and programs.",
  "/System/storage.txt": "When booted as the real kernel, files go through IPXFS to raw SSD sectors.",
  "/Packages/base.ipxpkg": "name=base\nversion=1\nfiles=/System/lesson.ipx"
};

let drive = loadDrive();
let currentFolder = "/Desktop";
let tasks = [
  { pid: 1, name: "kernel.ui", cpu: 3, mem: 42 },
  { pid: 2, name: "drive.cache", cpu: 1, mem: 18 },
  { pid: 3, name: "lesson.host", cpu: 2, mem: 25 }
];
let nextPid = 10;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadDrive() {
  try {
    return JSON.parse(localStorage.getItem(IPX_KEY)) || defaultDrive;
  } catch {
    return defaultDrive;
  }
}

function saveDrive() {
  localStorage.setItem(IPX_KEY, JSON.stringify(drive));
  renderDrive();
}

function openWindow(name) {
  const win = document.querySelector(`[data-window="${name}"]`);
  if (!win) return;
  win.classList.add("open");
  win.style.zIndex = Date.now().toString().slice(-6);
}

function closeWindow(name) {
  document.querySelector(`[data-window="${name}"]`)?.classList.remove("open");
}

function renderTasks(sortByCpu = false) {
  const rows = [...tasks];
  if (sortByCpu) rows.sort((a, b) => b.cpu - a.cpu);
  $("#task-list").innerHTML = rows.map(task => `
    <tr>
      <td>${task.pid}</td>
      <td>${task.name}</td>
      <td>${task.cpu}%</td>
      <td>${task.mem} MB</td>
      <td><button data-kill="${task.pid}">Kill</button></td>
    </tr>
  `).join("");
}

function renderDrive() {
  const files = Object.entries(drive);
  const bytes = new Blob([JSON.stringify(drive)]).size;
  $("#drive-status").textContent = `Drive: ${files.length} files, ${bytes} bytes`;
  $("#drive-info").textContent = JSON.stringify(makePack(), null, 2);
  renderDesktopIcons();
  renderFileManager();
}

function folderOf(path) {
  const clean = path.replace(/\/+$/, "");
  const index = clean.lastIndexOf("/");
  return index <= 0 ? "/" : clean.slice(0, index);
}

function nameOf(path) {
  return path.split("/").filter(Boolean).pop() || "/";
}

function foldersIn(folder) {
  const prefix = folder === "/" ? "/" : `${folder}/`;
  return [...new Set(Object.keys(drive)
    .filter(path => path.startsWith(prefix))
    .map(path => path.slice(prefix.length).split("/")[0])
    .filter(part => part && part.includes(".") === false))];
}

function filesIn(folder) {
  return Object.entries(drive).filter(([path]) => folderOf(path) === folder);
}

function renderDesktopIcons() {
  const desktop = $("#desktop-icons");
  if (!desktop) return;
  const icons = [
    { name: "Files", app: "files", icon: "FM" },
    { name: "Terminal", app: "terminal", icon: ">_" },
    ...filesIn("/Desktop").map(([path]) => ({ name: nameOf(path), path, icon: "TXT" }))
  ];
  desktop.innerHTML = icons.map(item => `
    <button class="desktop-icon" ${item.app ? `data-open="${item.app}"` : `data-edit="${item.path}"`}>
      <span class="icon">${escapeHtml(item.icon)}</span>
      <span>${escapeHtml(item.name)}</span>
    </button>
  `).join("");
}

function renderFileManager() {
  const grid = $("#folder-grid");
  if (!grid) return;
  $("#current-folder").textContent = currentFolder;
  const folderTiles = foldersIn(currentFolder).map(folder => `
    <button class="file-tile" data-enter-folder="${currentFolder === "/" ? "" : currentFolder}/${folder}">
      <strong>Folder</strong>
      <span>${escapeHtml(folder)}</span>
    </button>
  `);
  const fileTiles = filesIn(currentFolder).map(([path, body]) => `
    <button class="file-tile" data-edit="${escapeHtml(path)}">
      <strong>${escapeHtml(nameOf(path))}</strong>
      <small>${new Blob([body]).size} bytes</small>
    </button>
  `);
  grid.innerHTML = [...folderTiles, ...fileTiles].join("") || `<p class="muted">This folder is empty.</p>`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function print(line = "") {
  const out = $("#terminal-output");
  out.textContent += `${line}\n`;
  out.scrollTop = out.scrollHeight;
}

function runCommand(input) {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const rest = input.slice(cmd.length).trim();
  if (!cmd) return;
  print(`ipx:/> ${input}`);

  switch (cmd.toLowerCase()) {
    case "help":
      print("Commands: help, ls, cat PATH, write PATH TEXT, rm PATH, tasks, kill PID, drive, export, install NAME, clear");
      break;
    case "ls":
      print(Object.keys(drive).join("\n"));
      break;
    case "cat":
      print(drive[args[0]] ?? `File not found: ${args[0] || ""}`);
      break;
    case "write": {
      const [path, ...words] = rest.split(/\s+/);
      if (!path || words.length === 0) {
        print("Usage: write /path/file.txt contents");
        break;
      }
      drive[path] = words.join(" ");
      saveDrive();
      print(`Wrote ${path}`);
      break;
    }
    case "rm":
      delete drive[args[0]];
      saveDrive();
      print(`Removed ${args[0]}`);
      break;
    case "tasks":
      print(tasks.map(t => `${t.pid}\t${t.name}\tCPU ${t.cpu}%\t${t.mem} MB`).join("\n"));
      break;
    case "kill":
      tasks = tasks.filter(t => t.pid !== Number(args[0]));
      renderTasks();
      print(`Kill signal sent to ${args[0]}`);
      break;
    case "drive":
      print($("#drive-status").textContent);
      break;
    case "export":
      downloadPack();
      print("Exported interpixel-drive.ipxpack");
      break;
    case "install": {
      const packageName = args[0] || "manual";
      drive[`/Packages/${packageName}.ipxpkg`] = `name=${packageName}\ninstalledAt=${new Date().toISOString()}`;
      saveDrive();
      print(`Installed ${packageName} into /Packages`);
      break;
    }
    case "ai":
      print(interpixelAI(rest || "explain os"));
      break;
    case "clear":
      $("#terminal-output").textContent = "";
      break;
    default:
      print(`Unknown command: ${cmd}`);
  }
}

function interpixelAI(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("driver")) {
    return "AI Core: A driver is the OS translator for hardware. Start with VGA text output, keyboard scan codes, timer interrupts, and block-drive reads.";
  }
  if (text.includes("v8") || text.includes("javascript")) {
    return "AI Core: V8 needs memory, threads, timers, file I/O, and a C++ runtime. A bare-metal OS should boot with a tiny shell first, then host V8 after the kernel services exist.";
  }
  if (text.includes("file") || text.includes("ipx")) {
    return "AI Core: IPXPACK stores a header, directory entries, and file blocks. The browser version uses JSON so students can inspect it easily.";
  }
  if (text.includes("task") || text.includes("process")) {
    return "AI Core: The task manager tracks PID, CPU, and memory. A real kernel adds context switching, process states, and scheduling.";
  }
  return "AI Core: Build bare metal in layers: boot, screen, keyboard, memory, interrupts, scheduler, filesystem, user runtime, then AI and V8.";
}

function makePack() {
  return {
    magic: "IPXPACK",
    version: 1,
    createdBy: "InterPixel OS 2",
    createdAt: new Date().toISOString(),
    files: Object.entries(drive).map(([path, contents]) => ({
      path,
      type: "text/plain",
      bytes: new Blob([contents]).size,
      contents
    }))
  };
}

function importPack(pack) {
  if (pack.magic !== "IPXPACK" || !Array.isArray(pack.files)) {
    throw new Error("Invalid InterPixel pack");
  }
  drive = Object.fromEntries(pack.files.map(file => [file.path, file.contents ?? ""]));
  saveDrive();
}

function editFile(path) {
  $("#editor-path").value = path;
  $("#editor-body").value = drive[path] ?? "";
  openWindow("files");
}

function installPackageFile(fileName, contents) {
  const safeName = fileName.replace(/[^a-z0-9._-]/gi, "_");
  drive[`/Packages/${safeName}`] = contents;
  $("#file-action-log").textContent = `Installed package ${safeName} into /Packages.\nIn the real OS this maps to IPXFS raw SSD writes.`;
  saveDrive();
}

function downloadPack() {
  const blob = new Blob([JSON.stringify(makePack(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "interpixel-drive.ipxpack";
  link.click();
  URL.revokeObjectURL(url);
}

function bootWhiteboard() {
  const canvas = $("#board");
  const ctx = canvas.getContext("2d");
  let drawing = false;

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("pointerdown", event => {
    drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener("pointermove", event => {
    if (!drawing) return;
    const p = point(event);
    ctx.strokeStyle = $("#pen-color").value;
    ctx.lineWidth = Number($("#pen-size").value);
    ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  window.addEventListener("pointerup", () => drawing = false);
  $("#clear-board").addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
}

function wireDrag() {
  $$(".window").forEach(win => {
    const bar = win.querySelector(".titlebar");
    let active = false;
    let dx = 0;
    let dy = 0;
    bar.addEventListener("pointerdown", event => {
      if (event.target.tagName === "BUTTON") return;
      active = true;
      dx = event.clientX - win.offsetLeft;
      dy = event.clientY - win.offsetTop;
      win.setPointerCapture(event.pointerId);
      win.style.zIndex = Date.now().toString().slice(-6);
    });
    bar.addEventListener("pointermove", event => {
      if (!active) return;
      win.style.left = `${Math.max(8, event.clientX - dx)}px`;
      win.style.top = `${Math.max(80, event.clientY - dy)}px`;
    });
    bar.addEventListener("pointerup", () => active = false);
  });
}

$$("[data-open]").forEach(button => button.addEventListener("click", () => openWindow(button.dataset.open)));
$$("[data-close]").forEach(button => button.addEventListener("click", () => closeWindow(button.dataset.close)));
$("#desktop-icons").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.open) openWindow(button.dataset.open);
  if (button.dataset.edit) editFile(button.dataset.edit);
});

$("#terminal-form").addEventListener("submit", event => {
  event.preventDefault();
  runCommand($("#terminal-input").value);
  $("#terminal-input").value = "";
});

$("#spawn-task").addEventListener("click", () => {
  tasks.push({ pid: nextPid++, name: `student.vm.${nextPid}`, cpu: Math.ceil(Math.random() * 18), mem: 10 + Math.ceil(Math.random() * 90) });
  renderTasks();
});

$("#sort-cpu").addEventListener("click", () => renderTasks(true));
$("#task-list").addEventListener("click", event => {
  const pid = Number(event.target.dataset.kill);
  if (!pid) return;
  tasks = tasks.filter(task => task.pid !== pid);
  renderTasks();
});

$("#save-file").addEventListener("click", () => {
  drive[$("#file-name").value] = $("#file-body").value;
  saveDrive();
});

$$("[data-folder]").forEach(button => button.addEventListener("click", () => {
  currentFolder = button.dataset.folder;
  renderFileManager();
}));

$("#folder-grid").addEventListener("click", event => {
  const tile = event.target.closest("button");
  if (!tile) return;
  if (tile.dataset.enterFolder) {
    currentFolder = tile.dataset.enterFolder.replace("//", "/");
    renderFileManager();
  }
  if (tile.dataset.edit) {
    editFile(tile.dataset.edit);
  }
});

$("#new-text-file").addEventListener("click", () => {
  const base = `${currentFolder === "/" ? "" : currentFolder}/new-file`;
  let path = `${base}.txt`;
  let index = 2;
  while (drive[path]) {
    path = `${base}-${index++}.txt`;
  }
  drive[path] = "";
  saveDrive();
  editFile(path);
});

$("#new-folder").addEventListener("click", () => {
  const name = prompt("Folder name", "New Folder");
  if (!name) return;
  const safeName = name.replace(/[\\/:*?"<>|]/g, "").trim();
  if (!safeName) return;
  const path = `${currentFolder === "/" ? "" : currentFolder}/${safeName}/.folder`;
  drive[path] = "InterPixel folder marker";
  saveDrive();
});

$("#editor-save").addEventListener("click", () => {
  const path = $("#editor-path").value.startsWith("/") ? $("#editor-path").value : `/${$("#editor-path").value}`;
  drive[path] = $("#editor-body").value;
  currentFolder = folderOf(path);
  $("#file-action-log").textContent = `Saved ${path}\nBrowser mode: saved in InterPixel virtual disk.\nBare-metal mode: this path is written by IPXFS to raw SSD sectors.`;
  saveDrive();
});

$("#editor-delete").addEventListener("click", () => {
  const path = $("#editor-path").value;
  delete drive[path];
  $("#file-action-log").textContent = `Deleted ${path}`;
  saveDrive();
});

$("#pkg-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  installPackageFile(file.name, await file.text());
});

$("#export-pack").addEventListener("click", downloadPack);
$("#import-pack").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    importPack(JSON.parse(await file.text()));
  } catch (error) {
    alert(error.message);
  }
});

$("#ai-form").addEventListener("submit", event => {
  event.preventDefault();
  const prompt = $("#ai-input").value.trim();
  if (!prompt) return;
  $("#ai-log").innerHTML += `<div class="ai-message"><strong>You</strong><br>${escapeHtml(prompt)}</div>`;
  $("#ai-log").innerHTML += `<div class="ai-message"><strong>InterPixel AI</strong><br>${escapeHtml(interpixelAI(prompt))}</div>`;
  $("#ai-log").scrollTop = $("#ai-log").scrollHeight;
});

setInterval(() => {
  $("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  tasks = tasks.map(task => ({ ...task, cpu: Math.max(0, Math.min(99, task.cpu + Math.ceil(Math.random() * 7) - 4)) }));
  renderTasks();
}, 2000);

print("InterPixel OS 2 online. Type help.");
renderTasks();
renderDrive();
bootWhiteboard();
wireDrag();
openWindow("terminal");
openWindow("lesson");
