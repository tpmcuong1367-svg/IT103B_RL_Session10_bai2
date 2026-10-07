

const FINE_LOST = 200000;      
const FINE_PER_DAY = 5000;     
const LOAN_DAYS = 14;          
const EXTEND_DAYS = 7;        
const KEEP_DAYS = 30;         
const today = 100;            

const validStudents = ["S001", "S002", "S003", "S004", "S005"];


const circulationLogs = [
  { logId: "L001", studentCode: "S001", bookIsbn: "ISBN-001", status: "RETURNED",  fineAmount: 0,     borrowDay: 40, dueDay: 54,  settledDay: 50 },
  { logId: "L002", studentCode: "S002", bookIsbn: "ISBN-002", status: "RETURNED",  fineAmount: 10000, borrowDay: 70, dueDay: 84,  settledDay: 86 },
  { logId: "L003", studentCode: "S003", bookIsbn: "ISBN-003", status: "BORROWING", fineAmount: 0,     borrowDay: 90, dueDay: 104, settledDay: null },
  { logId: "L004", studentCode: "S004", bookIsbn: "ISBN-004", status: "BORROWING", fineAmount: 0,     borrowDay: 80, dueDay: 94,  settledDay: null },
  { logId: "L005", studentCode: "S005", bookIsbn: "ISBN-005", status: "BORROWING", fineAmount: 0,     borrowDay: 92, dueDay: 106, settledDay: null }
];

// ===== 1. MƯỢN SÁCH MỚI (Create) =====
console.log("=== 1. MƯỢN SÁCH MỚI ===");
const newRequests = [
  { studentCode: "S001", bookIsbn: "ISBN-006" },
  { studentCode: "S009", bookIsbn: "ISBN-007" },   // mã sinh viên sai
  { studentCode: "S002", bookIsbn: "ISBN-008" }
];

let nextId = circulationLogs.length + 1;
for (const req of newRequests) {
  if (!validStudents.includes(req.studentCode)) {
    console.log(` Từ chối: mã sinh viên ${req.studentCode} không hợp lệ.`);
    continue;
  }
  const newLog = {
    logId: `L${String(nextId).padStart(3, "0")}`,
    studentCode: req.studentCode,
    bookIsbn: req.bookIsbn,
    status: "BORROWING",
    fineAmount: 0,
    borrowDay: today,
    dueDay: today + LOAN_DAYS,
    settledDay: null
  };
  circulationLogs.push(newLog);
  nextId++;
  console.log(` ${newLog.logId}: ${newLog.studentCode} mượn ${newLog.bookIsbn}, hạn trả ngày ${newLog.dueDay}.`);
}


console.log("\n=== GIA HẠN SÁCH ===");
const extendId = "L006";
for (const log of circulationLogs) {
  if (log.logId === extendId) {
    if (log.status === "BORROWING") {
      log.dueDay += EXTEND_DAYS;
      console.log(` ${log.logId} được gia hạn, hạn trả mới: ngày ${log.dueDay}.`);
    } else {
      console.log(` ${log.logId} không ở trạng thái BORROWING nên không thể gia hạn.`);
    }
  }
}


console.log("\n=== 2. TRẢ SÁCH & TÍNH PHẠT ===");
const returnRequests = [
  { logId: "L003", result: "RETURN" },  // trả đúng hạn
  { logId: "L004", result: "RETURN" },  // trả trễ
  { logId: "L005", result: "LOST" },    // làm mất
  { logId: "L001", result: "RETURN" }   // đã trả rồi -> không hợp lệ
];

for (const req of returnRequests) {
  let found = false;
  for (const log of circulationLogs) {
    if (log.logId !== req.logId) continue;
    found = true;

   
    if (log.status !== "BORROWING") {
      console.log(`⚠️ ${log.logId} đã ở trạng thái ${log.status}, không xử lý lại.`);
      break;
    }

    if (req.result === "LOST") {
      log.status = "LOST";
      log.fineAmount = FINE_LOST;
      console.log(` ${log.logId}: làm mất sách, phạt ${FINE_LOST.toLocaleString("vi-VN")} VNĐ.`);
    } else {
      log.status = "RETURNED";
      const lateDays = today - log.dueDay;
      if (lateDays > 0) {
        log.fineAmount = lateDays * FINE_PER_DAY;
        console.log(` ${log.logId}: trả trễ ${lateDays} ngày, phạt ${log.fineAmount.toLocaleString("vi-VN")} VNĐ.`);
      } else {
        console.log(` ${log.logId}: trả đúng hạn, không phạt.`);
      }
    }
    log.settledDay = today; 
    break;
  }
  if (!found) {
    console.log(` Không tìm thấy giao dịch ${req.logId}.`);
  }
}


console.log("\n=== 3. DỌN NHẬT KÝ QUÁ 30 NGÀY ===");

for (let i = circulationLogs.length - 1; i >= 0; i--) {
  const log = circulationLogs[i];
  const done = log.status === "RETURNED" || log.status === "LOST";
  if (done && log.settledDay !== null && today - log.settledDay > KEEP_DAYS) {
    circulationLogs.splice(i, 1);
    console.log(` Đã xóa ${log.logId} (quyết toán từ ngày ${log.settledDay}).`);
  }
}

// ===== 4. BÁO CÁO CUỐI NGÀY (Read) =====
let borrowing = 0, returned = 0, lost = 0, totalFine = 0;
for (const log of circulationLogs) {
  if (log.status === "BORROWING") borrowing++;
  else if (log.status === "RETURNED") returned++;
  else if (log.status === "LOST") lost++;
  totalFine += log.fineAmount;
}

console.log(`\n┌────────┬──────────┬───────────┬───────────┬───────────────┐`);
console.log(`│ Mã GD  │ Sinh viên│ ISBN      │ Trạng thái│ Tiền phạt     │`);
console.log(`├────────┼──────────┼───────────┼───────────┼───────────────┤`);
for (const log of circulationLogs) {
  console.log(
    `│ ${log.logId.padEnd(6)} │ ${log.studentCode.padEnd(8)} │ ${log.bookIsbn.padEnd(9)} │ ${log.status.padEnd(9)} │ ${String(log.fineAmount).padStart(13)} │`
  );
}
console.log(`└────────┴──────────┴───────────┴───────────┴───────────────┘`);
console.log(`Số bản ghi còn lưu         : ${circulationLogs.length}`);
console.log(`Sách đang được mượn        : ${borrowing}`);
console.log(`Sách đã trả                : ${returned}`);
console.log(`Sách bị mất                : ${lost}`);
console.log(`Tổng tiền phạt thu được    : ${totalFine.toLocaleString("vi-VN")} VNĐ`);