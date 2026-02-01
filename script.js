async function convertToPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const files = document.getElementById("images").files;

  for (let i = 0; i < files.length; i++) {
    const img = await readFile(files[i]);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', 10, 10, 190, 0);
  }

  pdf.save("images.pdf");
}

function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}


// ===== ضغط الصور =====
async function compressImages() {
  const files = document.getElementById("compress-images").files;
  const status = document.getElementById("compress-status");
  const button = document.getElementById("compress-button");

  if (files.length === 0) {
    status.textContent = "❌ الرجاء اختيار صورة واحدة على الأقل";
    status.style.color = "red";
    return;
  }

  button.disabled = true;
  status.textContent = "⏳ جارٍ ضغط الصور...";
  status.style.color = "#2563eb";

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width / 2;
      canvas.height = img.height / 2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      await new Promise(resolve => {
        canvas.toBlob(blob => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = file.name.replace(/\.(\w+)$/, "_compressed.$1");
          link.click();
          resolve();
        }, "image/jpeg", 0.7);
      });

      status.textContent = `✅ تم ضغط الصورة ${i + 1} من ${files.length}`;
    }
  } catch (error) {
    console.error(error);
    status.textContent = "❌ حدث خطأ أثناء الضغط، جرّب صورة أخرى";
    status.style.color = "red";
  } finally {
    button.disabled = false;
  }
}

function loadImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => resolve(img);
    };
    reader.readAsDataURL(file);
  });
}



// مكتبة توليد QR Code صغيرة
// سنستخدم qrcode.js من CDN
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js";
document.head.appendChild(script);

script.onload = () => {
  const qrCanvas = document.getElementById("qr-canvas");
  const qrStatus = document.getElementById("qr-status");
  const downloadLink = document.getElementById("download-qr");

  document.getElementById("generate-qr").addEventListener("click", () => {
    const text = document.getElementById("qr-text").value.trim();
    if (!text) {
      qrStatus.textContent = "❌ الرجاء كتابة نص أو رابط أولاً";
      qrStatus.style.color = "red";
      return;
    }

    qrStatus.textContent = "⏳ جاري توليد QR Code...";
    qrStatus.style.color = "#2563eb";

    QRCode.toCanvas(qrCanvas, text, { width: 200 }, function (error) {
      if (error) {
        console.error(error);
        qrStatus.textContent = "❌ حدث خطأ أثناء توليد QR Code";
        qrStatus.style.color = "red";
        downloadLink.style.display = "none";
        return;
      }
      qrStatus.textContent = "✅ تم توليد QR Code بنجاح";
      qrStatus.style.color = "green";

      // إعداد رابط التحميل
      downloadLink.href = qrCanvas.toDataURL("image/png");
      downloadLink.download = "qrcode.png";
      downloadLink.style.display = "inline-block";
      downloadLink.textContent = "⬇️ تنزيل QR Code";
    });
  });
};

// تحويل النص إلى PDF
function convertTextToPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // الحصول على النص من textarea
  const text = document.getElementById("text-input").value.trim();
  if (!text) return; // إذا النص فارغ، لا يفعل شيء

  // تقسيم النص تلقائيًا ليناسب الصفحة
  const lines = pdf.splitTextToSize(text, 180);
  pdf.text(lines, 10, 10);

  // تنزيل الملف مباشرة
  pdf.save("text.pdf");
}
